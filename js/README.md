# HAPI Solana client

This library provides three types of clients of [HAPI](https://hapi.one) smart contract on Solana:
- ReaderClient: a read-only client to fetch data from the smart contract
- AuthorityClient: a client to access community management smart contract methods
- ReporterClient: a client to access reporting methods of the smart contract

## Usage examples

```typescript
import { ReaderClient, u64, base58ToPublicKey } from '@hapi.one/solana-client';

// Create a client that connects to a Solana API endpoint
const reader = new ReaderClient({ endpoint: "https://api.mainnet-beta.solana.com" });

// Fetch info on "hapi.one" community
const communityInfo = await reader.getCommunity("hapi.one");

// Fetch info on "solana" network in "hapi.one" community
const networkInfo1 = await reader.getNetwork("solana", "hapi.one");

// You can set a contextual community
reader.switchCommunity("hapi.one");

// This and next calls to methods will use "hapi.one" community implicitly
const networkInfo2 = await reader.getNetwork("bitcoin");

const reporterAccount = new PublicKey("GNNtJU2WCuk1q8uLW6aXHwFcZvrgbzRrtwuQqYkaCKSY");

// You can get info on a particular reporter in the community by their public key
const reporterInfo = await reader.getReporter(reporterAccount);

// You can fetch info of a case in the community by it's ID
const caseInfo = await reader.getCase(new u64(420));

// You can get information about a particular address using a string representation of it's public key (for Solana blockchain)
const addressInfo1 = await reader.getAddress("9Y9eHFk6tyadkz3e4zpYxvAuTumkLHSXV2tZQhxjb6xf", "solana-mainnet");

// You'll have to convert addresses in other blockchains to a buffer and pad it to 32 bytes
const buffer = Buffer.alloc(32);
const pizzaTransactionAddress = Buffer.from("0046af3fb481837fadbb421727f9959c2d32a3682971c823e7", "hex");
buffer.set(pizzaTransactionAddress);

// ... then you can get that address info
const addressInfo2 = await reader.getAddress(buffer, "bitcoin-mainnet");
```
