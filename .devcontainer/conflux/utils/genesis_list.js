// Import required modules
const TOML = require("@iarna/toml"); // For parsing TOML files
const fs = require("fs"); // For file system operations
const { Conflux } = require("js-conflux-sdk"); // Conflux SDK for blockchain interactions
const { privateToAddress } = require("ethereumjs-util"); // Utility for converting private key to address

// Define paths and RPC host from environment variables or default values
const configPath = process.env.CONFIG_PATH || "/opt/conflux/develop.toml";
const rpcHost = process.env.RPC_HOST || "localhost";

// Main function to list genesis accounts
function genesisList() {
  try {
    // Read and parse the configuration file
    const configString = fs.readFileSync(configPath, "utf-8");
    const config = TOML.parse(configString);

    // Initialize Conflux instance with RPC URL and network ID from config
    const conflux = new Conflux({
      url: `http://${rpcHost}:${config.jsonrpc_http_port}`,
      networkId: config.chain_id,
    });

    // Read and process the genesis secrets file
    const secrets = fs.readFileSync(config.genesis_secrets, "utf-8");

    // Split the secrets file into lines and process each
    let i = 0;
    secrets.split(/\r?\n/).forEach((privateKey) => {
      if (privateKey.length) {
        try {
          // Add the private key to Conflux wallet
          const account = conflux.wallet.addPrivateKey(`0x${privateKey}`);

          // Generate eSpace address from the private key
          const eSpaceAddress = `0x${privateToAddress(Buffer.from(privateKey, "hex")).toString("hex")}`;

          // Log account details
          console.log(`\n######  ACCOUNT ${i}  ######`);
          console.log(`Core Address: ${account.address}`);
          console.log(`eSpace Address: ${eSpaceAddress}`);
          console.log(`Private Key: 0x${privateKey}`);
          i++;
        } catch (error) {
          console.error(
            `Failed to process private key ${privateKey}:`,
            error.message,
          );
        }
      }
    });
  } catch (error) {
    // Handle errors
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Execute the genesisList function
genesisList();
