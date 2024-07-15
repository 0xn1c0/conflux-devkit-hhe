# Conflux DevKit HardHat Ignition Ethers

## Description

This project extends Hardhat's ethers sample project with Hardhat Ignition for Conflux eSpace and js-conflux-sdk for Conflux Core.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

To install the package, use npm:

```bash
npm install
```

**Note**: `npm audit` post-install will report 4 high severity vulnerabilities. This is a false positive. You can check the correct audit with the following command:

```bash
npm audit --omit=dev
```

## Usage

### Local Chain

First, start the local network with the following command:

```bash
npm run chain
```

This will start the local Conflux node and fund the genesis accounts. The Hardhat config will use the first account (0) as the default deployer. Once the chain is running, you can open another terminal and use the following commands:

```bash
genesis_list
```

This command will list the available genesis addresses.

```bash
genesis_espace
```

This command will transfer 1000 CFX to the eSpace addresses to enable local code deployment. Since the chain saves the blocks, these commands are only needed once until all the funds are spent or the Docker image is rebuilt.

For more details, refer to the [Conflux Devkit README](https://github.com/SPCFXDA/conflux-devkit/blob/main/README.md).

Once the accounts are funded and the chain is running, you can invoke the deployment examples with the following commands:

### Deploy to eSpace

```bash
npm run deploy_espace
```

This will use [LockModule.ts](/ignition/modules/LockModule.ts) with Ignition to deploy the contract on the local eSpace.

### Deploy to Core

```bash
npm run deploy_core
```

This will use [LockDeploy_Core.ts](/scripts/LockDeploy_Core.ts) with js-conflux-sdk to deploy on the local Core.
