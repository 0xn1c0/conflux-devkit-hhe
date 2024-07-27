#!/usr/bin/env node
import { Command } from "commander";

import {
  ClientTask,
  balance,
  faucet,
  genesisList,
  genesisToeSpace,
} from "./index";

const program = new Command();
const cfxNode = new ClientTask();
program
  .version("0.1.0")
  .description("DevKit CLI utils")
  .option("-l, --list", "List genesis accounts")
  .option("-b, --balance", "Balance of the genesis accounts")
  .option("-f, --faucet [value...]", "Faucet <amount> <address>")
  .option(
    "-e, --espace-genesis [value]",
    "Transfer from Core genesis address to eSpace",
  )
  .option("--start", "Start the development node")
  .option("--stop", "Stop the development node")
  .option("--status", "Show the node status")
  .option("--logs", "Show the node logs")
  .option("--stderr", "Show the errors the node produced in the stderr")
  .parse(process.argv);

const options = program.opts();

async function main() {
  const optionsKeys = Object.keys(options);
  let activeOption = optionsKeys.length > 0 ? optionsKeys[0] : undefined;

  switch (activeOption) {
    case "start":
      await cfxNode.start();
      console.log("bootstrap...");
      await cfxNode.status();
      console.log("Node started!");
      if (options.logs) {
        await cfxNode.logs();
      } else {
        process.exit(0);
      }
      break;
    case "stop":
      await cfxNode.stop();
      break;
    case "list":
      await genesisList.run(options);
      break;
    case "faucet":
      await faucet.run(options);
      break;
    case "espaceGenesis":
      await genesisToeSpace.run(options);
      break;
    case "balance":
      await balance.run(options);
      break;
    case "status":
      try {
        console.log(await cfxNode.status());
      } catch (error: any) {
        console.log(error);
      }
      break;
    case "logs":
      await cfxNode.logs();
      break;
    case "stderr":
      await cfxNode.stderr();
      break;
    default:
      if (!process.argv.slice(2).length) {
        program.outputHelp();
      }
      break;
  }
}

main().catch((error) => {
  process.exit(1);
});
