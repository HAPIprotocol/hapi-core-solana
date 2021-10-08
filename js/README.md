# HAPI Solana client

This library provides three types of clients of [HAPI](https://hapi.one) smart contract on Solana:
- ReaderClient: a read-only client to fetch data from the smart contract
- AuthorityClient: a client to access community management smart contract methods
- ReporterClient: a client to access reporting methods of the smart contract

## Usage examples

### ReaderClient

```typescript
import { ReaderClient, u64 } from '@hapi.one/solana-client';

// Create a client that connects to a Solana API endpoint
const reader = new ReaderClient({ endpoint: "https://api.mainnet-beta.solana.com" });

// Fetch info on "hapi.one" community
const communityInfo = await reader.getCommunity("hapi.one");

// Fetch info on "solana" network in "hapi.one" community
const networkInfo1 = await reader.getNetwork("solana", "hapi.one");

// You can set a contextual community
reader.switchCommunity("hapi.one");

// Alternatively, you can initialize the client with default community name specified
const reader2 = new ReaderClient({ endpoint: "https://api.mainnet-beta.solana.com", communityName: "hapi.one" });

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

### ReporterClient

`ReporterClient` extends `ReaderClient`, so all the getter methods are the same.

```typescript
import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { ReporterClient, u64, Category } from '@hapi.one/solana-client';

// You'll need a keypair to operate reporter client
const payer = Keypair.generate();

// Payer should be passed to the client on instantiation
const reporter = new ReporterClient({ endpoint: "https://api.mainnet-beta.solana.com", payer });

// You can set community name contextually, as in ReaderClient
reporter.switchCommunity("hapi.one");

// Create a new case with a name and a category
const resultCase = await reporter.createCase("Exchange hack 2021-10-08", [Category.Theft]);

// Create a new address record for an address exposed in this case
const resultAddress = await reporter.createAddress(
    "solana",
    new PublicKey("vwiVuBCPvFW5GJTM9Z2CbAuard5xP4Cyjn8gFjnUxy4"),
    resultCase.meta.caseId,
    Category.Theft,
    5,
);

// Alternatively, you can set up a client with only a public key of the payer, 
// but you'll need to sign transactions externally (e.g. via wallet)
const payer2 = new PublicKey("9Y9eHFk6tyadkz3e4zpYxvAuTumkLHSXV2tZQhxjb6xf");
const reporter2 = new ReporterClient({ endpoint: "https://api.mainnet-beta.solana.com", payer: payer2 });

// You can create an unsigned transaction so you can sign it with a connected wallet and 
const transaction = await reporter2.createCaseTransaction("Rug pull", [Category.Scam]);

// ...sign transaction here

// Send signed transaction via @solana/web3.js
const conn = new Connection("https://api.mainnet-beta.solana.com");
await conn.sendRawTransaction(transaction.serialize());
```
