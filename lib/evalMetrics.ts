import { getSupabaseClient } from "@/lib/supabase";
import type { EvalMetrics } from "@/types/governance";

interface EvalRow {
  timestamp: string;
  confidence: number | null;
  output_summary: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * The latest eval-harness judgments for the compliance view, through the eval_metrics() database
 * function (dome-docs migration 009). It replaced the /api/eval-metrics route handler when the
 * dashboard became a static export (Sprint H phase 2): the function runs with the signed-in
 * user's token and refuses anyone else, where the handler used the service-role key and only
 * checked that a cookie was present. Returns null when the call fails, as the handler did.
 */
export async function fetchEvalMetrics(): Promise<EvalMetrics[] | null> {
  const { data, error } = await getSupabaseClient().rpc("eval_metrics");
  if (error) return null;
  return ((data ?? []) as EvalRow[]).map(toEvalMetrics);
}

export function toEvalMetrics(row: EvalRow): EvalMetrics {
  const m = row.metadata ?? {};
  return {
    agent_id: (m.agent_id as string) ?? "document-intelligence",
    judge_model: (m.judge_model as string) ?? "",
    generator_model: (m.generator_model as string) ?? "",
    n_objective: (m.n_objective as number) ?? 0,
    n_agree: (m.n_agree as number) ?? 0,
    agreement_rate: (m.agreement_rate as number) ?? (row.confidence ?? 0),
    trustworthy: (m.trustworthy as boolean) ?? false,
    n_fuzzy_judged: (m.n_fuzzy_judged as number) ?? 0,
    n_docs: (m.n_docs as number) ?? 0,
    timestamp: row.timestamp,
    output_summary: row.output_summary as string,
  };
}
