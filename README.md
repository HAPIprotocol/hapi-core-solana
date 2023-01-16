# HAPI Core Solana

**WARNING**: This is a deprecated version of HAPI Core contract. Please go to https://github.com/HAPIprotocol/hapi-core to see the current one.

HAPI Core Solana is the core part of [HAPI Protocol](https://hapi.one/). It is responsible for key data storage and protocol governance.

# Components

This repository consists of the following components:
- `program` is the smart contract (or program in Solana terms)
- `cli` is a command line client to interact with the contract
- `js` is a Javascript/Typescript [client library](https://www.npmjs.com/package/@hapi.one/solana-client) to interact with the contract on chain

# Entities

## Community

Community is the central entity of the smart contract. Official HAPI Protocol community has a name "hapi.one". An authority is assigned to community to manage it's networks and reporters.

## Network

Network is an entity representing a particular blockchain network (i.e. Solana, Ethereum, Near or else).

## Reporter

Reporter is an entity that represents an external actor that can add case and address data to the smart contract.

## Case

Case is a group of addresses that have something in common. For example, it can be a group of addresses traced from a particular exchange hack or associated with a darknet market.

## Address

Address entity stores security data (category and risk score) for an address in a particular network.
