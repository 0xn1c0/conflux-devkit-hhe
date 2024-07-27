
import type { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { hhSetup, balance, faucet, node, accounts } from "./scripts/utils";

task("node", "Start the local Conflux development node")
  .addFlag("stop", "Stop the local Conflux development node")
  .addFlag("status", "Return the current node status")
  .setAction(node);

task("balance", "Show the balance for the configured networks").setAction(
  balance,
);

task("accounts", "Show the available accounts").setAction(accounts);

task("faucet", "Send CFX from the miner account to Core or Espace adresses")
  .addOptionalPositionalParam("amount")
  .addOptionalPositionalParam("address")
  .setAction(faucet);

let deployerPrivateKey: string[] = hhSetup.getSecrets();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      confluxESpaceTestnet: "<api-key>",
      confluxESpace: "<api-key>",
    },
    customChains: [
      {
        network: "confluxESpace",
        chainId: 1030,
        urls: {
          apiURL: "https://evmapi.confluxscan.net",
          browserURL: "https://evm.confluxscan.io/",
        },
      },
      {
        network: "confluxESpaceTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmapi-testnet.confluxscan.io/api/",
          browserURL: "https://evmtestnet.confluxscan.io/",
        },
      },
    ],
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    confluxCoreLocal: {
      url: "http://localhost:12537",
      accounts: deployerPrivateKey,
    },
    confluxCoreTestnet: {
      url: "https://test.confluxrpc.com",
      accounts: deployerPrivateKey,
    },
    confluxCore: {
      url: "https://main.confluxrpc.com",
      accounts: deployerPrivateKey,
    },
    confluxESpaceLocal: {
      url: "http://localhost:8545",
      accounts: deployerPrivateKey,
    },
    confluxESpaceTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: deployerPrivateKey,
    },
    confluxESpace: {
      url: "https://evm.confluxrpc.com",
      accounts: deployerPrivateKey,
    },
  },
};

export default config;
