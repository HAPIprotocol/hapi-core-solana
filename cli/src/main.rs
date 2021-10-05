mod command;
mod tools;
use {
    crate::{command::*, tools::*},
    clap::{
        crate_description, crate_name, crate_version, value_t_or_exit, App, AppSettings, Arg,
        SubCommand,
    },
    colored::*,
    solana_clap_utils::{
        input_parsers::pubkey_of,
        input_validators::{is_keypair, is_url, is_valid_pubkey},
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
    let arg_community_name = Arg::with_name("community_name")
        .long("community-name")
        .value_name("COMMUNITY_NAME")
        .help("The name of the community");

    let arg_network_name = Arg::with_name("network_name")
        .long("network-name")
        .value_name("NETWORK_NAME")
        .help("The name of the network");

    let arg_community_authority = Arg::with_name("community_authority")
        .long("community-authority")
        .value_name("COMMUNITY_AUTHORITY")
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
        .possible_values(REPORTER_TYPE_VALUES)
        .help("The type of the new reporter");

    let arg_case_name = Arg::with_name("case_name")
        .long("case-name")
        .value_name("CASE_NAME")
        .help("Short memo about case");

    let arg_case_categories = Arg::with_name("category")
        .multiple(true)
        .long("category")
        .value_name("CATEGORY")
        .takes_value(true)
        .possible_values(CATEGORY_VALUES);

    let arg_case_id = Arg::with_name("case_id")
        .long("case-id")
        .value_name("CASE_ID")
        .help("Case ID number");

    let arg_address = Arg::with_name("address")
        .long("address")
        .value_name("ADDRESS")
        .help("Blockchain address (account)");

    let arg_risk = Arg::with_name("risk")
        .long("risk")
        .value_name("RISK")
        .help("Risk factor from 0 to 10");

    let arg_category = Arg::with_name("category")
        .long("category")
        .value_name("CATEGORY")
        .possible_values(CATEGORY_VALUES)
        .help("Illicitness category");

    let subcommand_community = SubCommand::with_name("community")
        .about("Manage communities")
        .subcommand(
            SubCommand::with_name("create")
                .about("Create a new HAPI community")
                .arg(arg_community_name.clone().index(1).required(true)),
        );

    let subcommand_network = SubCommand::with_name("network")
        .about("Manage networks")
        .subcommand(
            SubCommand::with_name("create")
                .about("Create a new HAPI network")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_network_name.clone().index(2).required(true))
                .arg(arg_community_authority.clone().index(3).required(false)),
        )
        .subcommand(
            SubCommand::with_name("view")
                .about("View network data")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_network_name.clone().index(2).required(true)),
        );

    let subcommand_reporter = SubCommand::with_name("reporter")
        .about("Manage reporters")
        .subcommand(
            SubCommand::with_name("add")
                .about("Add a new reporter public key to a network")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true))
                .arg(arg_reporter_name.clone().index(3).required(true))
                .arg(arg_reporter_type.clone().index(4).required(true)),
        )
        .subcommand(
            SubCommand::with_name("update")
                .about("Update an existing reporter")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true))
                .arg(arg_reporter_name.clone().index(3).required(true))
                .arg(arg_reporter_type.clone().index(4).required(true)),
        )
        .subcommand(
            SubCommand::with_name("view")
                .about("View reporter data")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_reporter_pubkey.clone().index(2).required(true)),
        );

    let subcommand_case = SubCommand::with_name("case")
        .about("Manage cases")
        .subcommand(
            SubCommand::with_name("report")
                .about("Report a new case")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_case_name.clone().index(2).required(true))
                .arg(arg_case_categories.clone()),
        )
        .subcommand(
            SubCommand::with_name("update")
                .about("Update an existing case")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_case_id.clone().index(2).required(true))
                .arg(arg_case_categories.clone()),
        )
        .subcommand(
            SubCommand::with_name("view")
                .about("View case data")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_case_id.clone().index(2).required(true)),
        );

    let subcommand_address = SubCommand::with_name("address")
        .about("Manage addresses")
        .subcommand(
            SubCommand::with_name("report")
                .about("Report a new address")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_network_name.clone().index(2).required(true))
                .arg(arg_address.clone().index(3).required(true))
                .arg(arg_case_id.clone().index(4).required(true))
                .arg(arg_risk.clone().index(5).required(true))
                .arg(arg_category.clone().index(6).required(true)),
        )
        .subcommand(
            SubCommand::with_name("update")
                .about("Update an existing address")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_network_name.clone().index(2).required(true))
                .arg(arg_address.clone().index(3).required(true))
                .arg(arg_case_id.clone().index(4).required(true))
                .arg(arg_risk.clone().index(5).required(true))
                .arg(arg_category.clone().index(6).required(true)),
        )
        .subcommand(
            SubCommand::with_name("view")
                .about("View address data")
                .arg(arg_community_name.clone().index(1).required(true))
                .arg(arg_network_name.clone().index(2).required(true))
                .arg(arg_address.clone().index(3).required(true)),
        );

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
        .subcommand(SubCommand::with_name("list_accounts").about("List all program accounts"))
        .subcommand(subcommand_community.clone())
        .subcommand(subcommand_network.clone())
        .subcommand(subcommand_reporter.clone())
        .subcommand(subcommand_case.clone())
        .subcommand(subcommand_address.clone())
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
        ("list_accounts", Some(_)) => cmd_list_accounts(&rpc_client, &config),

        ("address", Some(arg_matches)) => {
            let (sub_command, sub_matches) = arg_matches.subcommand();
            match (sub_command, sub_matches) {
                ("create", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let network_name = value_t_or_exit!(arg_matches, "network_name", String);
                    let address = pubkey_of(arg_matches, "address").unwrap();
                    let case_id = value_t_or_exit!(arg_matches, "case_id", u64);
                    let risk = value_t_or_exit!(arg_matches, "risk", u8);
                    let category = parse_arg_category(arg_matches)?;

                    cmd_create_address(
                        &rpc_client,
                        &config,
                        community_name,
                        network_name,
                        &address,
                        case_id,
                        risk,
                        category,
                    )
                }

                ("update", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let network_name = value_t_or_exit!(arg_matches, "network_name", String);
                    let address = pubkey_of(arg_matches, "address").unwrap();
                    let case_id = value_t_or_exit!(arg_matches, "case_id", u64);
                    let risk = value_t_or_exit!(arg_matches, "risk", u8);
                    let category = parse_arg_category(arg_matches)?;

                    cmd_update_address(
                        &rpc_client,
                        &config,
                        community_name,
                        network_name,
                        &address,
                        case_id,
                        risk,
                        category,
                    )
                }

                ("view", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let network_name = value_t_or_exit!(arg_matches, "network_name", String);
                    let address = pubkey_of(arg_matches, "address").unwrap();

                    cmd_view_address(&rpc_client, &config, community_name, network_name, &address)
                }

                _ => subcommand_address
                    .clone()
                    .print_long_help()
                    .map(|_| println!())
                    .map_err(|e| e.into()),
            }
        }

        ("case", Some(arg_matches)) => {
            let (sub_command, sub_matches) = arg_matches.subcommand();
            match (sub_command, sub_matches) {
                ("create", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let case_name = value_t_or_exit!(arg_matches, "case_name", String);
                    let categories = parse_arg_categories(&arg_matches)?;

                    cmd_create_case(&rpc_client, &config, community_name, case_name, categories)
                }

                ("update", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let case_id = value_t_or_exit!(arg_matches, "case_id", u64);
                    let categories = parse_arg_categories(&arg_matches)?;

                    cmd_update_case(&rpc_client, &config, community_name, case_id, categories)
                }

                ("view", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let case_id = value_t_or_exit!(arg_matches, "case_id", u64);

                    cmd_view_case(&rpc_client, &config, community_name, case_id)
                }

                _ => subcommand_case
                    .clone()
                    .print_long_help()
                    .map(|_| println!())
                    .map_err(|e| e.into()),
            }
        }

        ("community", Some(arg_matches)) => {
            let (sub_command, sub_matches) = arg_matches.subcommand();
            match (sub_command, sub_matches) {
                ("create", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let community_authority = match pubkey_of(arg_matches, "community_authority") {
                        Some(pubkey) => pubkey,
                        None => config.keypair.pubkey(),
                    };

                    cmd_create_community(&rpc_client, &config, community_name, &community_authority)
                }

                _ => subcommand_community
                    .clone()
                    .print_long_help()
                    .map(|_| println!())
                    .map_err(|e| e.into()),
            }
        }

        ("network", Some(arg_matches)) => {
            let (sub_command, sub_matches) = arg_matches.subcommand();
            match (sub_command, sub_matches) {
                ("create", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let network_name = value_t_or_exit!(arg_matches, "network_name", String);

                    cmd_create_network(&rpc_client, &config, community_name, network_name)
                }

                ("view", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let network_name = value_t_or_exit!(arg_matches, "network_name", String);

                    cmd_view_network(&rpc_client, &config, community_name, network_name)
                }

                _ => subcommand_network
                    .clone()
                    .print_long_help()
                    .map(|_| println!())
                    .map_err(|e| e.into()),
            }
        }

        ("reporter", Some(arg_matches)) => {
            let (sub_command, sub_matches) = arg_matches.subcommand();
            match (sub_command, sub_matches) {
                ("create", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();
                    let reporter_name = value_t_or_exit!(arg_matches, "reporter_name", String);
                    let reporter_type = parse_arg_reporter_type(&arg_matches)?;

                    cmd_create_reporter(
                        &rpc_client,
                        &config,
                        community_name,
                        &reporter_pubkey,
                        reporter_name,
                        reporter_type,
                    )
                }

                ("update", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();
                    let reporter_name = value_t_or_exit!(arg_matches, "reporter_name", String);
                    let reporter_type = parse_arg_reporter_type(&arg_matches)?;

                    cmd_update_reporter(
                        &rpc_client,
                        &config,
                        community_name,
                        &reporter_pubkey,
                        reporter_name,
                        reporter_type,
                    )
                }

                ("view", Some(arg_matches)) => {
                    let community_name = value_t_or_exit!(arg_matches, "community_name", String);
                    let reporter_pubkey = pubkey_of(arg_matches, "reporter_pubkey").unwrap();

                    cmd_view_reporter(&rpc_client, &config, community_name, &reporter_pubkey)
                }

                _ => subcommand_reporter
                    .clone()
                    .print_long_help()
                    .map(|_| println!())
                    .map_err(|e| e.into()),
            }
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
