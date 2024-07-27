# Conflux DevKit HardHat Ignition ethers

## Description

This project enhances Hardhat's ethers sample project with Hardhat Ignition for Conflux eSpace and js-conflux-sdk for Conflux Core. It is based on the Conflux DevKit devcontainer. For more details, refer to the [Conflux Devkit README](https://github.com/SPCFXDA/conflux-devkit/blob/main/README.md). You can use this repository in GitHub Codespaces or with VS Code devcontainer support.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Local Chain](#local-chain)
  - [Deploy to eSpace](#deploy-to-espace)
  - [Deploy to Core](#deploy-to-core)

## Installation

To install the package, use npm:

```bash
npm install
```

Additionally, to enable Hardhat CLI completion, use the following command:

```bash
hardhat-completion install
```

Follow the instructions and select `bash` and `y`. To reload the shell, type `bash` in the terminal.

## Usage

### Local Chain

The system will auto-generate 5 private keys. If you want to add your development private keys to the system, use the following command before starting the node:

```bash
hh vars set DEPLOYER_PRIVATE_KEY
```

To start the development node, use:

```bash
hh node
```

This will start the local Conflux node and fund the genesis accounts on Core. 

Other available commands:

To stop the node:

```bash
hh node --stop
```

To get the status:

```bash
hh node --status
```

To get the balance of the configured keys:

```bash
hh balance
```

To add funds to a specific address on the local node:

```bash
hh faucet 100 0x1231231231123
```

To list all available genesis accounts:

```bash
hh accounts
```

Once the accounts are funded and the chain is running, you can deploy contracts using the following commands:

### Deploy to eSpace

To deploy a contract on the local eSpace using Ignition, use:

```bash
hh ignition deploy ./ignition/modules/LockModule.ts --network confluxESpaceLocal
```

### Deploy to Core

To deploy a contract on the local Core using js-conflux-sdk, use:

```bash
hh run scripts/LockDeploy_Core.ts --network confluxCoreLocal
```

This will use `LockModule.ts` and `LockDeploy_Core.ts` to deploy the contracts on eSpace and Core, respectively.