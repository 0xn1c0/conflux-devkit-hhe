// Import required modules
const TOML = require("@iarna/toml"); // For parsing and stringifying TOML files
const fs = require("fs"); // For file system operations
const { PrivateKeyAccount: Account } = require("js-conflux-sdk"); // Conflux SDK for account creation
const path = require("path"); // For handling and transforming file paths

// Define the path to the configuration file, using an environment variable or a default value
const configPath = process.env.CONFIG_PATH || "/opt/conflux/develop.toml";

// Function to generate genesis secrets and configure mining account
function genesisSecrets() {
  try {
    // Read and parse the configuration file
    const configString = fs.readFileSync(configPath, "utf-8");
    const config = TOML.parse(configString);

    // Array to store generated private keys
    let secrets = [];

    // Generate 5 random accounts and store their private keys (without '0x' prefix) in the secrets array
    for (let i = 0; i < 5; i++) {
      const randomAccount = Account.random(undefined, config.chain_id);
      secrets.push(randomAccount.privateKey.replace("0x", ""));
    }

    // Append the generated secrets to the genesis secrets file
    fs.appendFile(config.genesis_secrets, secrets.join("\n"), (err) => {
      if (err) {
        console.error("Error appending secrets:", err.message);
      } else {
        console.log("Secrets generated and appended successfully!");
      }
    });

    // Generate a random mining account
    const miningAccount = Account.random(undefined, config.chain_id);

    // Update the configuration with the new mining account address
    config.mining_author = miningAccount.address;

    // Write the updated configuration back to the config file
    fs.writeFileSync(configPath, TOML.stringify(config));
    console.log("Configuration file updated successfully!");

    // Write the mining account's private key to a separate file
    const miningAccountPath = path.join(
      path.dirname(config.genesis_secrets),
      "mining_secret.txt",
    );
    fs.writeFileSync(miningAccountPath, miningAccount.privateKey);
    console.log(
      `Mining account configured successfully! Private key saved to ${miningAccountPath}`,
    );
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Execute the genesisSecrets function
genesisSecrets();
