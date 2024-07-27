import { SetupTask } from "devkit";
import { vars } from "hardhat/config";

export class HardHatSetup extends SetupTask {
  generateSecrets() {
    if (this.secretExist()) {
      this.secrets = this.readSecrets();
      return;
    }
    if (vars.has("DEPLOYER_PRIVATE_KEY")) {
      this.secrets.push(vars.get("DEPLOYER_PRIVATE_KEY"));
    }
    // Generate 5 random accounts and store their private keys (without '0x' prefix) in the secrets array
    for (let i = 0; i < 5; i++) {
      const randomAccount = this.randomAccount();
      this.secrets.push(randomAccount.privateKey);
    }
    this.writeSecrets();
  }
  getSecrets() {
    this.generateSecrets();
    return this.secrets;
  }
}

export const hhSetup = new HardHatSetup();
