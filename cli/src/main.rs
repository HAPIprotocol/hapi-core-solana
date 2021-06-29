mod command;
mod tools;

use {
    crate::command::{
        cmd_add_reporter, cmd_create_network, cmd_list_accounts, cmd_update_reporter,
        cmd_view_network, cmd_view_reporter,
    },
    clap::{
        crate_description, crate_name, crate_version, value_t_or_exit, App, AppSettings, Arg,
        SubCommand,
    },
    colored::*,
    hapi_core_solana::state::enums::ReporterType,
    solana_clap_utils::{
        input_parsers::pubkey_of,
        input_validators::{is_keypair, is_url, is_url_or_moniker, is_valid_pubkey},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{
        commitment_config::CommitmentConfig,
        signature::{read_keypair_file, Keypair, Signer},
    },
};

pub struct Config {
    keypair: Keypair,
    json_rpc_url: String,
    verbose: bool,
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    let arg_network_name = Arg::with_name("network_name")
        .long("network-name")
        .value_name("NETWORK_NAME")
        .validator(is_url_or_moniker)
        .help("The name of the new network");

    let arg_network_authority = Arg::with_name("network_authority")
        .long("network-authority")
        .value_name("NETWORK_AUTHORITY")
        .validator(is_valid_pubkey)
        .help("Authority public key (default: signer public key)");

    let arg_reporter_pubkey = Arg::with_name("reporter_pubkey")
        .long("reporter-pubkey")
        .value_name("REPORTER_PUBKEY")
        .validator(is_valid_pubkey)
        .help("The public key of the reporter");

    let arg_reporter_name = Arg::with_name("reporter_name")
        .long("reporter-name")
        .value_name("REPORTER_NAME")
        .help("The name of the new reporter");

    let arg_reporter_type = Arg::with_name("reporter_type")
        .long("reporter-type")
        .value_name("REPORTER_TYPE")
        .possible_values(&["Inactive", "Tracer", "Full", "Authority"])
        .help("The type of the new reporter");

    let app_matches = App::new(crate_name!())
        .about(crate_description!())
        .version(crate_version!())
        .setting(AppSettings::SubcommandRequiredElseHelp)
        .arg({
            let arg = Arg::with_name("config_file")
                .short("C")
                .long("config")
                .value_name("PATH")
                .takes_value(true)
                .global(true)
                .help("Configuration file to use");
            if let Some(ref config_file) = *solana_cli_config::CONFIG_FILE {
                arg.default_value(&config_file)
            } else {
                arg
            }
        })
        .arg(
            Arg::with_name("keypair")
                .long("keypair")
                .value_name("KEYPAIR")
                .validator(is_keypair)
                .takes_value(true)
                .global(true)
                .help("Filepath or URL to a keypair [default: client keypair]"),
        )
        .arg(
            Arg::with_name("verbose")
                .long("verbose")
                .short("v")
                .takes_value(false)
                .global(true)
                .help("Show additional information"),
        )
        .arg(
            Arg::with_name("json_rpc_url")
                .long("url")
                .value_name("URL")
                .takes_value(true)
                .global(true)
                .validator(is_url)
                .help("JSON RPC URL for the cluster [default: value from configuration file]"),
        )
        .subcommand(SubCommand::with_name("accounts"))
        .subcommand(
            SubCommand::with_name("create_network")
                .about("Create a new HAPI network")
                .arg(arg_network_name.clone().index(1).required(true))
                .arg(arg_network_authority.clone().index(2).required(false)),
        )
        .subcommand(
            SubCommand::with_name("network")
                .about("View network data")
                .arg(arg_network_name.clone().index(1).required(true)),
        )
        .subcommand(
            SubCommand::with_name("add_reporter")
                .about("Add a new reporter public key to network")
                .arg(arg_network_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true))
                .arg(arg_reporter_name.clone().index(3).required(true))
                .arg(arg_reporter_type.clone().index(4).required(true)),
        )
        .subcommand(
            SubCommand::with_name("update_reporter")
                .about("Update an existing reporter")
                .arg(arg_network_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true))
                .arg(arg_reporter_name.clone().index(3).required(true))
                .arg(arg_reporter_type.clone().index(4).required(true)),
        )
        .subcommand(
            SubCommand::with_name("reporter")
                .about("View reporter data")
                .arg(arg_network_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true)),
        )
        .get_matches();

    let (sub_command, sub_matches) = app_matches.subcommand();
    let matches = sub_matches.unwrap();

    let config = {
        let cli_config = if let Some(config_file) = matches.value_of("config_file") {
            solana_cli_config::Config::load(config_file).unwrap_or_default()
        } else {
            solana_cli_config::Config::default()
        };

        Config {
            json_rpc_url: matches
                .value_of("json_rpc_url")
                .unwrap_or(&cli_config.json_rpc_url)
                .to_string(),
            keypair: read_keypair_file(
                matches
                    .value_of("keypair")
                    .unwrap_or(&cli_config.keypair_path),
            )?,
            verbose: matches.is_present("verbose"),
        }
    };

    solana_logger::setup_with_default("solana=info");
    let rpc_client =
        RpcClient::new_with_commitment(config.json_rpc_url.clone(), CommitmentConfig::confirmed());

    if config.verbose {
        println!("{}: {}", "JSON RPC URL".bright_black(), config.json_rpc_url);
    }

    match (sub_command, sub_matches) {
        ("accounts", Some(_)) => cmd_list_accounts(&rpc_client, &config),
        ("create_network", Some(arg_matches)) => {
            let network_name = value_t_or_exit!(arg_matches, "network_name", String);
            let network_authority = match pubkey_of(arg_matches, "network_authority") {
                Some(pubkey) => pubkey,
                None => config.keypair.pubkey(),
            };

            cmd_create_network(&rpc_client, &config, network_name, &network_authority)
        }
        ("network", Some(arg_matches)) => {
            let network_name = value_t_or_exit!(arg_matches, "network_name", String);

            cmd_view_network(&rpc_client, &config, network_name)
        }
        ("add_reporter", Some(arg_matches)) => {
            let network_name = value_t_or_exit!(arg_matches, "network_name", String);
            let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();
            let reporter_name = value_t_or_exit!(arg_matches, "reporter_name", String);
            let reporter_type = value_t_or_exit!(arg_matches, "reporter_type", ReporterType);

            cmd_add_reporter(
                &rpc_client,
                &config,
                network_name,
                &reporter_pubkey,
                reporter_name,
                reporter_type,
            )
        }
        ("update_reporter", Some(arg_matches)) => {
            let network_name = value_t_or_exit!(arg_matches, "network_name", String);
            let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();
            let reporter_name = value_t_or_exit!(arg_matches, "reporter_name", String);
            let reporter_type = value_t_or_exit!(arg_matches, "reporter_type", ReporterType);

            cmd_update_reporter(
                &rpc_client,
                &config,
                network_name,
                &reporter_pubkey,
                reporter_name,
                reporter_type,
            )
        }
        ("reporter", Some(arg_matches)) => {
            let network_name = value_t_or_exit!(arg_matches, "network_name", String);
            let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();

            cmd_view_reporter(&rpc_client, &config, network_name, &reporter_pubkey)
        }
        _ => unreachable!(),
    }
}

fn main() {
    if let Err(e) = run() {
        println!("{}", e.to_string().red());
        std::process::exit(1)
    }
}
