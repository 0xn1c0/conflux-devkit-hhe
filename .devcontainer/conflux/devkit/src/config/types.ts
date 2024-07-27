// Define TypeScript interfaces for Pos Configuration
interface Waypoint {
  from_config: string;
}

interface SafetyRulesService {
  type: string;
}

interface SafetyRules {
  service: SafetyRulesService;
}

interface Consensus {
  round_initial_timeout_ms: number;
  safety_rules: SafetyRules;
}

interface Execution {
  genesis_file_location: string;
}

interface Logger {
  file: string;
  level: string;
}

interface Base {
  data_dir: string;
  role: string;
  waypoint: Waypoint;
}

export interface PosConfig {
  base: Base;
  consensus: Consensus;
  execution: Execution;
  logger: Logger;
  // storage?: { dir: string }; // Uncomment this if you need the storage configuration
}

// logConfigTypes.ts

export interface Encoder {
  pattern: string;
}

export interface Filter {
  kind: string;
  level: string;
}

export interface Trigger {
  kind: string;
  limit: string;
}

export interface Roller {
  kind: string;
  pattern: string;
  count: number;
}

export interface Policy {
  kind: string;
  trigger: Trigger;
  roller: Roller;
}

export interface LogfileAppender {
  kind: string;
  path: string;
  encoder: Encoder;
  policy: Policy;
}

export interface Root {
  level: string;
  appenders: string[];
}

export interface Loggers {
  [key: string]: {
    level: string;
  };
}

export interface LogConfig {
  refresh_rate: string;
  appenders: {
    logfile: LogfileAppender;
  };
  root: Root;
  loggers: Loggers;
}

// config.ts
export interface NodeConfig {
  mode: string;
  dev_block_interval_ms: number;
  genesis_secrets: string;
  pos_config_path: string;
  pos_initial_nodes_path: string;
  pos_private_key_path: string;
  dev_pos_private_key_encryption_password: string;
  mining_author: string;
  log_conf: string;
  jsonrpc_ws_port: number;
  jsonrpc_http_port: number;
  jsonrpc_local_http_port: number;
  jsonrpc_http_eth_port: number;
  jsonrpc_ws_eth_port: number;
  public_rpc_apis: string;
  public_evm_rpc_apis: string;
  poll_lifetime_in_seconds: number;
  persist_block_number_index: boolean;
  persist_tx_index: boolean;
  conflux_data_dir: string;
  executive_trace: boolean;
  get_logs_filter_max_limit: number;
  chain_id: number;
  evm_chain_id: number;
  node_table_promotion_timeout_s: number;
  hydra_transition_number: number;
  hydra_transition_height: number;
  cip43_init_end_number: number;
  pos_reference_enable_height: number;
  dao_vote_transition_number: number;
  dao_vote_transition_height: number;
  cip78_patch_transition_number: number;
  cip90_transition_height: number;
  cip90_transition_number: number;
  cip105_transition_number: number;
  sigma_fix_transition_number: number;
  cip107_transition_number: number;
  cip112_transition_height: number;
  cip118_transition_number: number;
  cip119_transition_number: number;
  cip1559_transition_height: number;
  cancun_opcodes_transition_number: number;
  next_hardfork_transition_number: number;
  next_hardfork_transition_height: number;
}
