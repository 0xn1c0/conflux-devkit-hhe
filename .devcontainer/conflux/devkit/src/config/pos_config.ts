import path from "path";

import { PosConfig } from "./types";

const CONFLUX_NODE_ROOT = process.env.CONFLUX_NODE_ROOT || "";

// Create a TypeScript object based on the interfaces
export const posConfig: PosConfig = {
  base: {
    data_dir: path.join(CONFLUX_NODE_ROOT, "pos_config", "pos_db"),
    role: "validator",
    waypoint: {
      from_config: "",
    },
  },
  consensus: {
    round_initial_timeout_ms: 60000,
    safety_rules: {
      service: {
        type: "local",
      },
    },
  },
  execution: {
    genesis_file_location: path.join(
      CONFLUX_NODE_ROOT,
      "pos_config",
      "genesis_file",
    ),
  },
  logger: {
    file: path.join(CONFLUX_NODE_ROOT, "log", "pos.log"),
    level: "INFO",
  },
  // Uncomment the following lines if you need the storage configuration
  /*
  storage: {
    dir: path.join(CONFLUX_NODE_ROOT, 'pos_config', 'pos_db', 'db')
  }
  */
};
