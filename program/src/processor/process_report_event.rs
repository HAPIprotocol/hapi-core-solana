use borsh::BorshSerialize;
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint::ProgramResult,
  msg,
  pubkey::Pubkey,
  rent::Rent,
  sysvar::Sysvar,
};

use crate::{
  error::HapiError,
  state::enums::HapiAccountType,
  state::event::{get_event_address_seeds, Event},
  state::network::get_network_data,
  tools::account::create_and_serialize_account_signed,
};

pub fn process_report_event(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  name: String,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let reporter_info = next_account_info(account_info_iter)?; // 0
  let network_info = next_account_info(account_info_iter)?; // 1
  let event_info = next_account_info(account_info_iter)?; // 2
  let system_info = next_account_info(account_info_iter)?; // 3
  let rent_sysvar_info = next_account_info(account_info_iter)?; // 4
  let rent = &Rent::from_account_info(rent_sysvar_info)?;

  if !reporter_info.is_signer {
    msg!("Reporter did not sign ReportEvent");
    return Err(HapiError::SignatureMissing.into());
  }

  // TODO: check if reporter is registered and can report events

  let mut network_data = get_network_data(network_info)?;
  let event_id = network_data.next_event_id;
  network_data.next_event_id += 1;
  network_data.serialize(&mut *network_info.data.borrow_mut())?;

  let event_data = Event {
    account_type: HapiAccountType::Event,
    name: name.clone(),
    reporter_key: *reporter_info.key,
  };

  create_and_serialize_account_signed::<Event>(
    reporter_info,
    &event_info,
    &event_data,
    &get_event_address_seeds(&network_info.key, &event_id.to_le_bytes()),
    program_id,
    system_info,
    rent,
  )?;

  Ok(())
}
