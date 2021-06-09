use borsh::BorshSerialize;
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint::ProgramResult,
  msg,
  pubkey::Pubkey,
};

use crate::{error::HapiError, state::enums::ReporterType, state::reporter::get_reporter_data};

pub fn process_update_reporter(
  _program_id: &Pubkey,
  accounts: &[AccountInfo],
  name: String,
  reporter_type: ReporterType,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let payer_info = next_account_info(account_info_iter)?; // 0
  let reporter_info = next_account_info(account_info_iter)?; // 1

  if !payer_info.is_signer {
    msg!("Authority did not sign initialization");
    return Err(HapiError::SignatureMissing.into());
  }

  let mut reporter_data = get_reporter_data(reporter_info)?;

  reporter_data.name = name;
  reporter_data.reporter_type = reporter_type;

  reporter_data.serialize(&mut *reporter_info.data.borrow_mut())?;

  Ok(())
}
