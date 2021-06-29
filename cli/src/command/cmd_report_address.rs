use { crate::Config, solana_client::rpc_client::RpcClient};

pub fn cmd_report_address(
    _rpc_client: &RpcClient,
    _config: &Config,
) -> Result<(), Box<dyn std::error::Error>> {
    unimplemented!("This command is not implemented yet");
}
