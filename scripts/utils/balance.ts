import { ClientTask } from "devkit";
import { Conflux, Drip } from "js-conflux-sdk";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from 'ethers';

type NetworkConfig = {
  url: string;
  accounts: string[];
};

export class Balance extends ClientTask {
  networks: { [key: string]: NetworkConfig };

  constructor(
    hre_networks: { [key: string]: NetworkConfig } = {
      confluxCoreLocal: { url: "", accounts: [] },
    },
  ) {
    super();
    this.networks = hre_networks;
  }

  async execute() {
    const toFixed = (n: number, fixed: number) =>
      ~~(Math.pow(10, fixed) * n) / Math.pow(10, fixed);

    for (const networkName of Object.keys(this.networks)) {
      const network = this.networks[networkName];
      if (!("url" in network)) continue;

      const accounts = network.accounts;
      const results: { [network: string]: { [key: string]: number } } = {};

      for (const privateKey of accounts) {
        const shortPrivateKey = `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}`;
        let address: string;
        let balance: string;

        try {
          // Attempt to use Conflux client
          const confluxClient = new Conflux({ url: network.url });
          await confluxClient.updateNetworkId();

          address = confluxClient.wallet.addPrivateKey(privateKey).address;
          const balanceBigInt = await confluxClient.cfx.getBalance(address);
          balance = new Drip(balanceBigInt).toCFX();
        } catch (confluxError) {
          try {
            // Fallback to Ethers.js provider if Conflux client fails
            const provider = new ethers.JsonRpcProvider(network.url);
            const wallet = new ethers.Wallet(privateKey, provider);
            address = await wallet.getAddress();
            const balanceBigInt = await provider.getBalance(address);
            balance = ethers.formatUnits(balanceBigInt, 18);
          } catch (ethersError) {
            console.error("Conflux client error:", (confluxError as Error).message);
            console.error("Ethers.js client error:", (ethersError as Error).message);
            continue;
          }
        }
        const networkNamePadded = networkName.padEnd(20);
        if (!results[networkNamePadded]) {
          results[networkNamePadded] = {};
        }
        results[networkNamePadded][shortPrivateKey] = toFixed(
          Number(balance),
          2,
        );
      }
      if (Object.keys(results).length) {
        console.table(results);
      } else {
        console.error("Unable to retrieve data from", networkName);
      }
    }
  }
}

export async function balance(
  taskArguments: string[],
  hre: HardhatRuntimeEnvironment,
  runSuper: unknown,
) {
  const _ = runSuper;
  const networks = hre.config.networks;
  const networkNames = Object.keys(networks).filter(
    (element) => element !== "hardhat" && element !== "localhost",
  );

  const filteredNetworks = networkNames.reduce(
    (acc, networkName) => {
      acc[networkName] = networks[networkName] as NetworkConfig;
      return acc;
    },
    {} as { [key: string]: NetworkConfig },
  );
  const devkit_balance = new Balance(filteredNetworks);
  await devkit_balance.run({});
}
