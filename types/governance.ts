export interface GovernanceEvent {
  id: string;
  agent_id: string;
  action_type: string;
  timestamp: string;
  input_hash: string;
  input_type: string;
  output_summary: string;
  rules_applied: string[];
  rules_triggered: string[];
  confidence: number | null;
  human_in_loop: string;
  user_id: string | null;
  workflow_run_id: string | null;
  metadata: Record<string, unknown>;
}

export interface EventFilters {
  agent_ids?: string[];
  action_type?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  human_in_loop?: string;
  min_confidence?: number;
}

export const AGENT_IDS = [
  "process-analyzer",
  "llm-council",
  "document-intelligence",
  "data-intelligence",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export const AGENT_LABELS: Record<string, string> = {
  "process-analyzer":      "Process Analyzer",
  "llm-council":           "LLM Council",
  "document-intelligence": "Document Intelligence",
  "data-intelligence":     "Data Intelligence",
};

export const ACTION_TYPE_LABELS: Record<string, string> = {
  process_analysis:    "Analysis",
  deliberation:        "Deliberation",
  extraction:          "Extraction",
  eval_judgment:       "Eval Judgment",
  dashboard_generation:"Dashboard Gen",
  qa_query:            "Q&A Query",
};

export interface EvalMetrics {
  agent_id: string;
  judge_model: string;
  generator_model: string;
  n_objective: number;
  n_agree: number;
  agreement_rate: number;
  trustworthy: boolean;
  n_fuzzy_judged: number;
  n_docs: number;
  timestamp: string;
  output_summary: string;
}
