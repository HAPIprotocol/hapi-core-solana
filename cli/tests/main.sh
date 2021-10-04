#!/bin/bash

set -e

BASE_DIR=$(dirname "$(realpath $0)")
LEDGER_DIR="/tmp/hapi-core-solana-cli-test-$$"
OUTPUT_DIR="$BASE_DIR/output"
LOG_FILE="$OUTPUT_DIR/test.log"
PROGRAM_ID="hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7"
CLI="$BASE_DIR/../target/debug/hapi-core-solana-cli -v"

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
  --log \
  --reset \
  --ledger $LEDGER_DIR \
  --bpf-program $PROGRAM_ID ../../program/target/deploy/hapi_core_solana.so &>"$LOG_FILE" &

mkdir -p $OUTPUT_DIR
sleep 1

echo "==> Switching Solana client configuration to local"
solana config set --url http://127.0.0.1:8899

echo "==> Airdropping"
cd $BASE_DIR
solana airdrop 10 $AUTHORITY_KEYPAIR
solana airdrop 10 $NOBODY_KEYPAIR
solana airdrop 10 $ALICE_KEYPAIR
solana airdrop 10 $BOB_KEYPAIR
solana airdrop 10 $CAROL_KEYPAIR

(
  set +e

  echo "==> Creating community hapi.one"
  $CLI --keypair $AUTHORITY_KEYPAIR community create hapi.one ||
    exception "Can't create community hapi.one"

  echo "==> Creating network testcoin"
  $CLI --keypair $AUTHORITY_KEYPAIR network create hapi.one testcoin ||
    exception "Can't create network testcoin"
  $CLI --keypair $AUTHORITY_KEYPAIR network view hapi.one testcoin ||
    exception "Can't view network testcoin"

  echo "==> Attempting to create network without correct credentials"
  $CLI --keypair $UNINITIALIZED_KEYPAIR network create hapi.one testhereum 2>&1 >/dev/null &&
    exception "Shouldn't be able to create network from uninitialized account" ||
    echo "Passed"

  echo "==> Creating reporter Alice"
  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $ALICE_KEYPAIR) Alice Authority &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $ALICE_KEYPAIR) ||
    exception "Can't view reporter Alice"

  echo "==> Creating reporter Bob"
  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $BOB_KEYPAIR) Bob Full &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $BOB_KEYPAIR) ||
    exception "Can't view reporter Bob"

  echo "==> Creating reporter Carol"
  $CLI --keypair $AUTHORITY_KEYPAIR reporter add hapi.one $(solana-keygen pubkey $CAROL_KEYPAIR) Carol Tracer &&
    $CLI --keypair $AUTHORITY_KEYPAIR reporter view hapi.one $(solana-keygen pubkey $CAROL_KEYPAIR) ||
    exception "Can't view reporter Carol"

  echo "==> Creating case 0"
  $CLI --keypair $ALICE_KEYPAIR case report hapi.one case0 &&
    $CLI --keypair $ALICE_KEYPAIR case view hapi.one 0 ||
    exception "Can't view case0"

  echo "==> Creating case 1"
  $CLI --keypair $BOB_KEYPAIR case report hapi.one case1 --category Theft --category Scam &&
    $CLI --keypair $BOB_KEYPAIR case view hapi.one 1 ||
    exception "Can't view case1"

  echo "==> Attempting to create case 2 without correct credentials"
  $CLI --keypair $CAROL_KEYPAIR case report hapi.one case2 2>&1 >/dev/null &&
    exception "Shouldn't be able to report case by tracer" ||
    echo "Passed"

  echo "==> Reporting address 2Yy2..FRew"
  $CLI --keypair $CAROL_KEYPAIR address report hapi.one testcoin 2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew 1 5 Theft &&
    $CLI --keypair $CAROL_KEYPAIR address view hapi.one testcoin 2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew ||
    exception "Can't view address 2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"

  set -e
)

echo "==> Dumping test accounts"
echo "2viJmmn2pEfd6cogyqdDGWS9YkrVdnx87L994Qo3GwLx
  DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja
  GfwYi1NaoMFJUHzEXtTkXAQewxxqs7PbseAYnsfiNnS7
  7GFtavi6PpFjqmvhKMtW8D6W4JgFv69VhUurrnBQRbUL
  DSa28TFYUaomAUNTnRRcsxxmZmvrf1Pfim7obB21m5Jx
  63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk
  6vGsVQ1YMu5zkNUMJ5j5H1TVimfennBcYuYP9hXw1kB2
  EGP3s7nD3dFaT9jGtwT7UoZndi58W3VexaJ41N1y5yMm" |
  xargs -I{} sh -c "solana account --output=json {} >$OUTPUT_DIR/{}.json"

echo "==> Tests finished"

if [[ "$NO_CLEANUP" == "1" ]]; then
  cleanup
fi
