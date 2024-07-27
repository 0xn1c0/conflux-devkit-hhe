import { Address, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { ClientTask } from "./task";

export class Balance extends ClientTask {
  async execute(options: any) {
    // Validate the connection
    await this.status();

    // Read and process the genesis secrets file
    const secrets: string[] = this.readSecrets();
    // Split the secrets file into lines and process each line
    secrets.forEach(async (line: string, index: number) => {
      if (line.length) {
        const coreAddress: string = this.coreClient!.wallet.addPrivateKey(
          `0x${line}`,
        ).address;
        const eSpaceAddress: string = privateKeyToAccount(`0x${line}`).address;
        const coreBalance: string = await this.getCoreBalance(coreAddress);
        const eSpaceBalance = formatEther(
          await this.eSpaceClient.getBalance({
            address: eSpaceAddress as Address,
          }),
        );
        console.log(
          "Account",
          index,
          "Core:",
          coreBalance,
          "eSpace:",
          eSpaceBalance,
        );
      }
    });
    this.coreClient!.close();
  }
}

export const balance = new Balance();
