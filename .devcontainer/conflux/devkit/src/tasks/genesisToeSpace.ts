import { ClientTask } from "./task";

export class GenesisToeSpace extends ClientTask {
  async execute(options: any) {
    const amount =
      options.espaceGenesis === true ? "5000" : options.espaceGenesis;
    try {
      await this.status();
      // Read and process the genesis secrets file
      const secrets: string[] = this.readSecrets();
      // Split the secrets file into lines and process each line
      if (this.coreClient) {
        secrets.forEach((secret: string) => {
          if (secret.length) {
            const account = this.coreClient!.wallet.addPrivateKey(
              `0x${secret}`,
            );
            this.crossCall(account, amount, undefined);
          }
        });
      } else {
        throw "core client not found";
      }
    } catch (error: any) {
      throw error;
    } finally {
      if (this.coreClient) {
        this.coreClient.close();
      }
    }
  }
}

export const genesisToeSpace = new GenesisToeSpace();
