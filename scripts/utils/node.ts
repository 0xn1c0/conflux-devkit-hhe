import { ClientTask } from "devkit";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const cfxNode = new ClientTask();
export async function node(
  taskArguments: { stop: boolean; status: boolean },
  hre: HardhatRuntimeEnvironment,
  runSuper: unknown,
) {
  const _ = runSuper;
  if (taskArguments.stop) {
    await cfxNode.stop();
    return;
  }
  if (taskArguments.status) {
    console.log(await cfxNode.status());
    return;
  }
  await cfxNode.start();
  console.log("bootstrap...");
  await cfxNode.status();
  console.log("Node started!");
}
