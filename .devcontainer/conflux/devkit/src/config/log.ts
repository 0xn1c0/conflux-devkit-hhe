import path from "path";

import { LogConfig } from "./types";

const CONFLUX_NODE_ROOT = process.env.CONFLUX_NODE_ROOT || "";

// Create a TypeScript object based on the interfaces
export const logConfig: LogConfig = {
  refresh_rate: "30 seconds",
  appenders: {
    logfile: {
      kind: "rolling_file",
      path: path.join(CONFLUX_NODE_ROOT, "log", "conflux.log"),
      encoder: {
        pattern: "{d} {h({l}):5.5} {T:<20.20} {t:12.12} - {m:.20000}{n}",
      },
      policy: {
        kind: "compound",
        trigger: {
          kind: "size",
          limit: "2000 mb",
        },
        roller: {
          kind: "fixed_window",
          pattern: path.join(
            CONFLUX_NODE_ROOT,
            "log",
            "archive",
            "conflux.{}.gz",
          ),
          count: 50,
        },
      },
    },
    // Uncomment the following lines if you need the console appender
    /*
    stdout: {
      kind: 'console',
      encoder: {
        pattern: "{d} {h({l}):5.5} {T:<20.20} {t:12.12} - {m:10.20000}{n}"
      },
      filters: [
        {
          kind: 'threshold',
          level: 'info'
        }
      ]
    }
    */
  },
  root: {
    level: "info",
    appenders: [
      // "stdout", // Uncomment this if you need the console appender
      "logfile",
    ],
  },
  loggers: {
    network: {
      level: "info",
    },
    cfxcore: {
      level: "info",
    },
    rpc: {
      level: "info",
    },
    blockgen: {
      level: "info",
    },
    client: {
      level: "info",
    },
    cfx_storage: {
      level: "info",
    },
    cfx_statedb: {
      level: "info",
    },
  },
};
