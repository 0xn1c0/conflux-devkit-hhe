import { readFileSync, writeFileSync } from "fs"; // For file system operations
import { createInterface } from "readline"; // For reading user input from CLI
import { resolve } from "path"; // For handling file paths

function main() {
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("DEPLOYER_PRIVATE_KEY already set");
    return;
  }
  const secrets = readFileSync("/opt/conflux/genesis_secrets.txt", "utf-8");

  // Split the secrets file into lines and store them
  const privateKeys = secrets.split(/\r?\n/);

  // Print all keys with their index
  privateKeys.forEach((privateKey: string, i: number) => {
    console.log(`${i}: 0x${privateKey}`);
  });

  // Create an interface for reading user input
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask the user which key they want to print
  rl.question(
    "Which key do you want to save as an environment variable? Enter the index: ",
    (index: string) => {
      const idx = parseInt(index, 10);

      if (isNaN(idx) || idx < 0 || idx >= privateKeys.length) {
        console.log("Invalid index.");
      } else {
        const selectedKey = `0x${privateKeys[idx]}`;
        console.log(`Selected key: ${selectedKey}`);

        // Write the selected key to the .env file
        const envFilePath = resolve(__dirname, "../.env");
        const envContent = `DEPLOYER_PRIVATE_KEY=${selectedKey}\n`;

        writeFileSync(envFilePath, envContent, { flag: "w" });
        console.log(`The key has been saved to ${envFilePath}`);
      }

      rl.close();
    },
  );
}

main();
