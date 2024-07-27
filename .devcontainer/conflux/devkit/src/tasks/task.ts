// Import required modules
import * as fs from "fs";
import { Conflux, Drip } from "js-conflux-sdk";
// For file system operations
import { PrivateKeyAccount } from "js-conflux-sdk";
import yaml from "js-yaml";
import { promisify } from "util";
// Conflux SDK for blockchain interactions
import { createPublicClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { parse, stringify } from "@iarna/toml";
import TailFile from "@logdna/tail-file";

import { develop, logConfig, posConfig } from "../config";

// Conflux SDK for blockchain interactions
import path = require("path");
// For parsing TOML files

export class BaseTask {
  exec: any = promisify(require("child_process").exec);
  config: any;

  constructor() {}

  async run(options: any) {
    try {
      return await this.execute(options);
    } catch (error: any) {
      if (error.errno === -111) {
        console.warn(
          `Failed to connect to ${error.address}:${error.port}. Have you started the local node with 'devkit --start' command?`,
        );
      } else {
        console.error("An error occurred:", error.message);
      }
    }
  }

  async execCmd(cmd: string) {
    const execOut = await this.exec(cmd);
    const std = { out: execOut.stdout.trim(), err: execOut.stderr.trim() };
    if (std.err) {
      console.error(std.err);
      process.exit(1);
    }
    return std.out;
  }

  async execute(options: any) {
    // main function
    return options;
  }
}

export class SetupTask extends BaseTask {
  rootPath: fs.PathLike;
  configPath: fs.PathLike;
  chainID: number;
  evmChainID: number;
  secretsPath: fs.PathLike;
  minerSecretPath: fs.PathLike;
  templatesPath: fs.PathLike;
  secrets: string[];
  constructor() {
    super();
    this.rootPath = process.env.CONFLUX_NODE_ROOT as fs.PathLike;
    this.configPath = process.env.CONFIG_PATH as fs.PathLike;
    this.chainID = Number(process.env.CHAIN_ID);
    this.evmChainID = Number(process.env.EVM_CHAIN_ID);
    this.secretsPath = process.env.SECRETS_PATH as fs.PathLike;
    this.templatesPath = process.env.TEMPLATES_PATH as fs.PathLike;
    this.minerSecretPath = "";
    this.secrets = [];
  }
  async setup() {
    try {
      this.checkVars();
      await this.generateConfig();
      await this.generateLogConfig();
      await this.generatePosConfig();
      await this.generateMinerSecrets();
      this.generateSecrets();
    } catch (error: any) {
      console.error("An error occurred during initialization:", error.message);
      process.exit(1);
    }
  }

  async run(options: any) {
    this.setup();
    try {
      return await this.execute(options);
    } catch (error: any) {
      if (error.errno === -111) {
        console.warn(
          `Failed to connect to ${error.address}:${error.port}. Have you started the local node with 'devkit --start' command?`,
        );
      } else {
        console.error("An error occurred:", error.message);
      }
    }
  }

  randomAccount() {
    return PrivateKeyAccount.random(
      // @ts-ignore
      undefined,
      this.chainID,
    );
  }
  async generateMinerSecrets() {
    this.minerSecretPath = path.join(
      path.dirname(this.secretsPath as string),
      "mining_secret.txt",
    );
    if (fs.existsSync(this.minerSecretPath)) {
      return;
    }

    const miningAccount = this.randomAccount();

    this.config.mining_author = miningAccount.address;
    // Write the updated configuration back to the config file
    fs.writeFileSync(this.configPath, stringify(this.config));
    console.log(`Configuration update: ${this.configPath}`);

    // Write the mining account's private key to a separate file
    fs.writeFileSync(this.minerSecretPath, miningAccount.privateKey);
    console.log(`Mining account configured: ${this.minerSecretPath}`);
  }

  secretExist() {
    return fs.existsSync(this.secretsPath);
  }
  writeSecrets() {
    let genesis: string[] = [];
    this.secrets.forEach((privateKey: string) => {
      genesis.push(privateKey.replace("0x", ""));
    });
    fs.appendFileSync(this.secretsPath, genesis.join("\n") + "\n");
    console.log("Secrets generated:" + this.secretsPath);
  }
  generateSecrets() {
    if (this.secretExist()) {
      this.secrets = this.readSecrets();
      return;
    }
    // Generate 5 random accounts and store their private keys (without '0x' prefix) in the secrets array
    for (let i = 0; i < 5; i++) {
      const randomAccount = this.randomAccount();
      this.secrets.push(randomAccount.privateKey);
    }
    this.writeSecrets();
  }

  async generatePosConfig() {
    const posPath = path.join(this.rootPath as string, "pos_config");

    if (!fs.existsSync(posPath)) {
      fs.mkdirSync(posPath);
      await this.exec(
        `(cd ${posPath} && pos-genesis-tool random --initial-seed=0000000000000000000000000000000000000000000000000000000000000000 --num-validator=1 --num-genesis-validator=1 --chain-id=${this.chainID})`,
      );
      let pos = posConfig;
      pos.base.waypoint.from_config = fs
        .readFileSync(path.join(posPath, "waypoint_config"), "utf-8")
        .trim();
      fs.writeFileSync(
        path.join(posPath, "pos_config.yaml"),
        yaml.dump(pos),
        "utf8",
      );
    }
  }
  async generateLogConfig() {
    const logPath = path.join(this.rootPath as string, "log");
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath);
      fs.writeFileSync(
        path.join(this.rootPath as string, "log.yaml"),
        yaml.dump(logConfig),
        "utf8",
      );
    }
  }
  async generateConfig() {
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, stringify(develop as any));
      this.config = develop;
    } else {
      this.config = parse(fs.readFileSync(this.configPath, "utf-8"));
    }
  }
  checkVars() {
    if (!this.rootPath || !this.configPath) {
      throw new Error(
        "CONFLUX_NODE_ROOT and CONFIG_PATH environment variables must be set.",
      );
    }
    if (!this.chainID) {
      throw new Error("CHAIN_ID environment variables must be set.");
    }
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath);
    }
  }
  readSecrets() {
    return fs
      .readFileSync(this.secretsPath, "utf-8")
      .split(/\r?\n/)
      .filter((element) => element !== "");
  }
}

export class NodeTask extends SetupTask {
  getPidCmd =
    "ls -l /proc/*/exe 2>/dev/null | grep '/usr/bin/conflux' | awk '{print $9}' | cut -d'/' -f3";
  startNodeCmd =
    "ulimit -n 10000 && \
   export RUST_BACKTRACE=1 && \
   conflux --config $CONFIG_PATH 2> $CONFLUX_NODE_ROOT/log/stderr.txt& 1> /dev/null";

  constructor() {
    super();
  }

  async start() {
    await this.setup();
    const pid = await this.getPid();
    if (pid) {
      console.log(`Node is already running (PID: ${pid}), not starting again.`);
      process.exit(0);
    }
    console.log("Node starting...");
    this.exec(this.startNodeCmd);

    console.log(`Node started with PID: ${await this.getPid()}`);
  }
  async stop() {
    const pid = await this.getPid();
    if (!pid) {
      console.log("PID not found, is the node running?");
      return;
    }
    console.log(`Found PID: ${pid}`);

    // Kill the process
    await this.exec(`kill ${pid}`);
    console.log("Node stopped");
  }

  async getPid() {
    return await this.execCmd(this.getPidCmd);
  }
  async logs() {
    const logConfigString: string = fs.readFileSync(
      this.rootPath + "/log.yaml",
      "utf-8",
    );
    type logConfType = { appenders: { logfile: { path: string } } };
    const logConfig = yaml.load(logConfigString) as logConfType;
    let position: number; // Can be used to resume the last position from a new instance

    const tail = new TailFile(logConfig.appenders.logfile.path);
    process.on("SIGINT", () => {
      tail
        .quit()
        .then(() => {
          // console.log(`The last read file position was: ${position}`);
        })
        .catch((err: any) => {
          process.nextTick(() => {
            console.error("Error during TailFile shutdown", err);
          });
        });
    });

    await tail
      .on("flush", ({ lastReadPosition }) => {
        position = lastReadPosition;
      })
      .on("data", (chunk) => {
        console.log(chunk.toString());
      })
      .start()
      .catch((err) => {
        console.error("Cannot start.  Does the file exist?", err);
        throw err;
      });
  }

  async stderr(): Promise<void> {
    try {
      const data = await fs.promises.readFile(
        this.rootPath + "/log/stderr.txt",
        "utf8",
      );
      if (data.trim().length === 0) {
        console.log("No content to display from stderr.");
        return;
      }
      process.stdout.write(data);
    } catch (error: any) {
      console.error(`Error reading file`, error.message);
      process.exit(1);
    }
  }
}

export class ClientTask extends NodeTask {
  coreClient: Conflux | undefined;
  eSpaceClient: any;
  crossSpaceCall: any;
  constructor() {
    super();
    this.coreClient = undefined;
    this.eSpaceClient = undefined;
    this.crossSpaceCall = undefined;
  }

  async run(options: any) {
    this.setup();
    try {
      this.coreClient = this.getCoreClient();
      this.eSpaceClient = this.getESpaceClient();
      this.crossSpaceCall = this.coreClient.InternalContract("CrossSpaceCall");
      return await this.execute(options);
    } catch (error: any) {
      if (error.errno === -111) {
        console.warn(
          `Failed to connect to ${error.address}:${error.port}. Have you started the local node with 'devkit --start' command?`,
        );
      } else {
        console.error("An error occurred:", error.message);
      }
    }
  }

  getCoreClient(): Conflux {
    return new Conflux({
      url: `http://localhost:${this.config.jsonrpc_http_port}`,
      networkId: this.config.chain_id,
    });
  }

  async getCoreBalance(address: string) {
    if (this.coreClient) {
      return new Drip(await this.coreClient.cfx.getBalance(address)).toCFX();
    } else {
      throw "core client not found";
    }
  }

  getESpaceClient() {
    return createPublicClient({
      chain: defineChain({
        id: this.config.evm_chain_id,
        name: "eSpaceLocal",
        nativeCurrency: {
          decimals: 18,
          name: "Conflux",
          symbol: "CFX",
        },
        rpcUrls: {
          default: {
            http: [`http://localhost:${this.config.jsonrpc_http_eth_port}`],
            webSocket: [`wss://localhost:${this.config.jsonrpc_ws_eth_port}`],
          },
        },
      }),
      transport: http(),
    });
  }

  async status(): Promise<void> {
    const pid = await this.getPid();
    if (!pid) {
      console.log("PID not found, is the node running?");
      throw "PID not found";
    }

    let status_err: any;
    // Returns a Promise that resolves after "ms" Milliseconds
    const timer = (ms: number | undefined) =>
      new Promise((res) => setTimeout(res, ms));
    let coreClient: Conflux;
    if (this.coreClient) {
      coreClient = this.coreClient;
    } else {
      this.setup();
      coreClient = this.getCoreClient();
    }
    async function checkStatus() {
      for (var i = 1; i <= 5; i++) {
        try {
          // Validate the connection
          if (coreClient) {
            return await coreClient.cfx.getStatus();
          } else {
            throw "core client not found";
          }
        } catch (error: any) {
          // Handle errors
          status_err = error;
        }
        console.log(`[...]`);
        await timer(3000); // then the created Promise can be awaited
      }
      throw status_err;
    }
    return await checkStatus();
  }

  async crossCall(
    account: any,
    amount: string,
    eSpaceAddress: string | undefined,
  ): Promise<void> {
    try {
      // Generate eSpace address from the private key
      const balance: string = await this.getCoreBalance(account.address);
      if (Number(balance) < Number(amount)) {
        console.log(
          `Insufficent balance ( ${account.address} : ${balance} CFX)`,
        );
        return;
      }
      const address = eSpaceAddress
        ? eSpaceAddress
        : privateKeyToAccount(account.privateKey).address;

      // Send transaction to transfer 1000 CFX to the eSpace address
      const receipt = await this.crossSpaceCall
        .transferEVM(address)
        .sendTransaction({
          from: account,
          value: Drip.fromCFX(Number(amount)), // Transfer 1000 CFX
        })
        .executed();

      // Log the result of the transaction
      if (receipt.outcomeStatus === 0) {
        console.log(
          `Transfer of ${amount} CFX from ${account.address} to ${address} succeeded`,
        );
      } else {
        console.error(`Transfer from ${account.address} to ${address} failed`);
      }
    } catch (error: any) {
      console.error(
        `Failed to process private key ${account.privateKey}:`,
        error.message,
      );
    }
  }
}
