// Import required modules
const TOML = require("@iarna/toml"); // For parsing TOML files
const fs = require("fs"); // For file system operations
const { Conflux, Drip } = require("js-conflux-sdk"); // Conflux SDK for blockchain interactions
const { privateToAddress } = require("ethereumjs-util"); // Utility for converting private key to address

// Define paths and RPC host from environment variables or default values
const configPath = process.env.CONFIG_PATH || "/opt/conflux/develop.toml";
const rpcHost = process.env.RPC_HOST || "localhost";

// Main function to handle the genesis to eSpace transfer
async function genesisToeSpace() {
  try {
    // Read and parse the configuration file
    const configString = fs.readFileSync(configPath, "utf-8");
    const config = TOML.parse(configString);

    // Initialize Conflux instance with RPC URL and network ID from config
    const conflux = new Conflux({
      url: `http://${rpcHost}:${config.jsonrpc_http_port}`,
      networkId: config.chain_id,
    });

    // Validate the connection
    await conflux.cfx.getStatus();
    console.log("Connected to Conflux node");

    // Initialize CrossSpaceCall internal contract for cross-space transactions
    const crossSpaceCall = conflux.InternalContract("CrossSpaceCall");

    // Async function to handle cross-space call transactions
    async function crossSpaceCallFx(privateKey) {
      try {
        // Add account to Conflux wallet using the private key
        const account = conflux.wallet.addPrivateKey(`0x${privateKey}`);
        // Generate eSpace address from the private key
        const eSpaceAddress = `0x${privateToAddress(Buffer.from(privateKey, "hex")).toString("hex")}`;

        // Send transaction to transfer 1000 CFX to the eSpace address
        const receipt = await crossSpaceCall
          .transferEVM(eSpaceAddress)
          .sendTransaction({
            from: account,
            value: Drip.fromCFX(1000), // Transfer 1000 CFX
          })
          .executed();

        // Log the result of the transaction
        if (receipt.outcomeStatus === 0) {
          console.log(
            `Transfer from ${account.address} to ${eSpaceAddress} succeeded`,
          );
        } else {
          console.error(
            `Transfer from ${account.address} to ${eSpaceAddress} failed`,
          );
        }
      } catch (error) {
        console.error(
          `Failed to process private key ${privateKey}:`,
          error.message,
        );
      }
    }

    // Read and process the genesis secrets file
    const secrets = fs.readFileSync(config.genesis_secrets, "utf-8");
    // Split the secrets file into lines and process each line
    secrets.split(/\r?\n/).forEach((line) => {
      if (line.length) {
        crossSpaceCallFx(line);
      }
    });
  } catch (error) {
    // Handle errors
    if (error.errno === -111) {
      console.warn(
        `Failed to connect to ${error.address}:${error.port}. Have you started the local node with the "dev_node" command?`,
      );
    } else {
      console.error("An error occurred:", error.message);
    }
    process.exit(1);
  }
}

// Execute the genesisToeSpace function
genesisToeSpace();
