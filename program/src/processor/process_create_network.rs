use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint::ProgramResult,
  msg,
  pubkey::Pubkey,
  rent::Rent,
  sysvar::Sysvar,
};

use crate::{
  error::HapiError, state::enums::HapiAccountType, state::network::get_network_address_seeds,
  state::network::Network, tools::account::create_and_serialize_account_signed,
};

pub fn process_create_network(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  name: String,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let payer_info = next_account_info(account_info_iter)?; // 0
  let network_info = next_account_info(account_info_iter)?; // 1
  let system_info = next_account_info(account_info_iter)?; // 2
  let rent_sysvar_info = next_account_info(account_info_iter)?; // 3
  let rent = &Rent::from_account_info(rent_sysvar_info)?;

  if !payer_info.is_signer {
    msg!("Authority did not sign initialization");
    return Err(HapiError::SignatureMissing.into());
  }

  let network_data = Network {
    account_type: HapiAccountType::Network,
    name: name.clone(),
  };

  create_and_serialize_account_signed::<Network>(
    payer_info,
    &network_info,
    &network_data,
    &get_network_address_seeds(&name),
    program_id,
    system_info,
    rent,
  )?;

  Ok(())
}
