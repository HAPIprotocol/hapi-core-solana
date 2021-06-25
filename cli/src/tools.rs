use {
  solana_client::rpc_client::RpcClient, solana_program::program_error::ProgramError,
  solana_sdk::pubkey::Pubkey,
};

pub fn assert_is_empty_account(
  rpc_client: &RpcClient,
  account_address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  match rpc_client.get_account(account_address) {
    Ok(_) => Err(ProgramError::AccountAlreadyInitialized.into()),
    Err(_) => Ok(()),
  }
}

pub fn assert_is_existing_account(
  rpc_client: &RpcClient,
  account_address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  match rpc_client.get_account(account_address) {
    Ok(_) => Ok(()),
    Err(_) => Err(ProgramError::UninitializedAccount.into()),
  }
}
