#!/bin/bash

set -e

BASE_DIR=$(dirname "$(realpath $0)")
LEDGER_DIR="/tmp/hapi-core-solana-cli-test-$$"
PROGRAM_ID="hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7"
CLI="$BASE_DIR/../target/debug/hapi-core-solana-cli"

AUTHORITY_KEYPAIR=./keys/authority.json
NOBODY_KEYPAIR=./keys/nobody.json
ALICE_KEYPAIR=./keys/reporter-alice.json
BOB_KEYPAIR=./keys/reporter-bob.json
CAROL_KEYPAIR=./keys/reporter-carol.json
UNINITIALIZED_KEYPAIR=./keys/uninitialized.json

function cleanup() {
  echo "==> Stopping test validator"
  killall solana-test-validator

  echo "==> Cleaning up ledger directory"
  rm -rf $LEDGER_DIR
}

function exception() {
  echo "Error: $1"
  cleanup
  exit 1
}

echo "==> Building program"
cd $BASE_DIR/../../program
cargo build-bpf

echo "==> Building cli"
cd $BASE_DIR/..
cargo build

echo "==> Starting test validator in $LEDGER_DIR"
cd $BASE_DIR
solana-test-validator \
  --quiet \
  --reset \
  --ledger $LEDGER_DIR \
  --bpf-program $PROGRAM_ID ../../program/target/deploy/hapi_core_solana.so &

sleep 1

echo "==> Airdropping"
cd $BASE_DIR
solana airdrop 10 $AUTHORITY_KEYPAIR
solana airdrop 10 $NOBODY_KEYPAIR
solana airdrop 10 $ALICE_KEYPAIR
solana airdrop 10 $BOB_KEYPAIR
solana airdrop 10 $CAROL_KEYPAIR

echo "==> Creating network"
(
  set +e

  $CLI --keypair $AUTHORITY_KEYPAIR community create hapi.one ||
    exception "Can't create community hapi.one"

  $CLI --keypair $AUTHORITY_KEYPAIR network create hapi.one test1 ||
    exception "Can't create network test1"
  $CLI --keypair $AUTHORITY_KEYPAIR network view hapi.one test1 ||
    exception "Can't view network test1"

  $CLI --keypair $UNINITIALIZED_KEYPAIR network create hapi.one test2 2>&1 >/dev/null &&
    exception "Shouldn't be able to create network from uninitialized account"

  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $ALICE_KEYPAIR) Alice Authority &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $ALICE_KEYPAIR) ||
    exception "Can't view reporter Alice"

  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $BOB_KEYPAIR) Bob Full &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $BOB_KEYPAIR) ||
    exception "Can't view reporter Bob"

  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $CAROL_KEYPAIR) Carol Tracer &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $CAROL_KEYPAIR) ||
    exception "Can't view reporter Carol"

  $CLI --keypair $ALICE_KEYPAIR case report hapi.one test1 case0 &&
    $CLI --keypair $ALICE_KEYPAIR case view hapi.one test1 0 ||
    exception "Can't view case0"

  $CLI --keypair $BOB_KEYPAIR case report hapi.one test1 case1 &&
    $CLI --keypair $BOB_KEYPAIR case view hapi.one test1 1 ||
    exception "Can't view case1"

  $CLI --keypair $CAROL_KEYPAIR case report hapi.one test1 case2 2>&1 >/dev/null &&
    exception "Shouldn't be able to report case by tracer"

  set -e
)

cleanup
