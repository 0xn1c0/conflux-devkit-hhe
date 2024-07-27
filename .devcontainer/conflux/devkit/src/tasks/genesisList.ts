import { privateKeyToAccount } from "viem/accounts";

import { ClientTask } from "./task";

export class GenesisList extends ClientTask {
  async execute(options: any) {
    const secrets: string[] = this.readSecrets();
    secrets.forEach((privateKey: string, i: number) => {
      if (privateKey.length) {
        try {
          // Add the private key to Conflux wallet
          const account = this.coreClient!.wallet.addPrivateKey(
            `0x${privateKey}`,
          );

          // Generate eSpace address from the private key
          const eSpaceAddress: string = privateKeyToAccount(
            `0x${privateKey}`,
          ).address;

          // Log account details
          console.group(`\n######  ACCOUNT ${i}  ######`);
          console.warn(`Private Key`.padEnd(14), `: 0x${privateKey}`);
          console.log(`Core Address`.padEnd(14), `: ${account.address}`);
          console.log(`eSpace Address`.padEnd(14), `: ${eSpaceAddress}`);
          console.groupEnd();
        } catch (error) {
          console.error(
            `Failed to process private key ${privateKey}:`,
            (error as Error).message,
          );
        } finally {
          if (this.coreClient) {
            this.coreClient.close();
          }
        }
      }
    });
  }
}

export const genesisList = new GenesisList();
