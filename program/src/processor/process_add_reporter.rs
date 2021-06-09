use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint::ProgramResult,
  msg,
  pubkey::Pubkey,
  rent::Rent,
  sysvar::Sysvar,
};

use crate::{
  error::HapiError, state::enums::{HapiAccountType, ReporterType}, state::reporter::get_reporter_address_seeds,
  state::reporter::Reporter, tools::account::create_and_serialize_account_signed,
};

pub fn process_add_reporter(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  reporter_key: &Pubkey,
  name: String,
  reporter_type: ReporterType,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let payer_info = next_account_info(account_info_iter)?; // 0
  let reporter_info = next_account_info(account_info_iter)?; // 1
  let system_info = next_account_info(account_info_iter)?; // 2
  let rent_sysvar_info = next_account_info(account_info_iter)?; // 3
  let rent = &Rent::from_account_info(rent_sysvar_info)?;

  if !payer_info.is_signer {
    msg!("Authority did not sign initialization");
    return Err(HapiError::SignatureMissing.into());
  }

  let reporter_data = Reporter {
    account_type: HapiAccountType::Reporter,
    reporter_key: *reporter_key,
    name: name.clone(),
    reporter_type,
  };

  create_and_serialize_account_signed::<Reporter>(
    payer_info,
    &reporter_info,
    &reporter_data,
    &get_reporter_address_seeds(reporter_key),
    program_id,
    system_info,
    rent,
  )?;

  Ok(())
}
