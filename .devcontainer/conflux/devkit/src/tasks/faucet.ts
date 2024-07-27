import { readFileSync } from "fs";
import { Drip, address } from "js-conflux-sdk";
import { isAddress } from "viem";

import { ClientTask } from "./task";

export class Faucet extends ClientTask {
  async execute(options: any) {
    // Validate the connection
    await this.status();
    // Read secret and config files
    const secretString: string = readFileSync(this.minerSecretPath, "utf-8");

    // Add miner private key to Conflux wallet and get balance
    const miner = this.coreClient!.wallet.addPrivateKey(secretString);
    const balance: string = await this.getCoreBalance(miner.address);
    console.log(`Faucet balance is ${balance} CFX`);

    // Exit if no arguments are provided
    if (options.faucet.length !== 2) {
      console.warn(
        "Please provide the request amount and destination address (faucet <amount> <address>).",
      );
      return;
    }

    // Retrieve request amount and destination address from arguments
    const requestAmount: string = options.faucet[0];
    const destinationAddress: string = options.faucet[1];

    // Check if the request amount is numeric
    if (!this.isNumeric(requestAmount)) {
      console.error("Requested amount is not a valid number.");
      return;
    }

    // Check if the request amount exceeds the faucet balance
    if (parseFloat(requestAmount) >= parseFloat(balance)) {
      console.error("Requested amount exceeds faucet balance.");
      return;
    }

    // Check if the destination address is a valid Conflux address
    if (address.isValidCfxAddress(destinationAddress)) {
      // Send transaction to the Conflux address
      await this.coreClient!.cfx.sendTransaction({
        from: miner.address,
        to: destinationAddress,
        value: Drip.fromCFX(parseFloat(requestAmount)),
      });
      console.log(
        `${requestAmount} CFX successfully sent to ${destinationAddress}`,
      );
      return;
    }

    // Check if the destination address is a valid Ethereum address
    if (isAddress(destinationAddress)) {
      // Execute cross-space call
      await this.crossCall(miner, requestAmount, destinationAddress);
      return;
    }

    // Log error if the destination address is invalid
    console.error("Invalid destination address.");
    this.coreClient!.close();
  }
  isNumeric(value: string): boolean {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  }
}

export const faucet = new Faucet();
