import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import type { EvalMetrics } from "@/types/governance";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Validate dome_auth_token — presence is sufficient proof of active Supabase session.
  const token = req.cookies.get("dome_auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("governance_events")
    .select("timestamp, confidence, output_summary, metadata")
    .eq("action_type", "eval_judgment")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: EvalMetrics[] = (data ?? []).map((row) => {
    const m = (row.metadata ?? {}) as Record<string, unknown>;
    return {
      agent_id:        (m.agent_id        as string)  ?? "document-intelligence",
      judge_model:     (m.judge_model     as string)  ?? "",
      generator_model: (m.generator_model as string)  ?? "",
      n_objective:     (m.n_objective     as number)  ?? 0,
      n_agree:         (m.n_agree         as number)  ?? 0,
      agreement_rate:  (m.agreement_rate  as number)  ?? (row.confidence ?? 0),
      trustworthy:     (m.trustworthy     as boolean) ?? false,
      n_fuzzy_judged:  (m.n_fuzzy_judged  as number)  ?? 0,
      n_docs:          (m.n_docs          as number)  ?? 0,
      timestamp:       row.timestamp as string,
      output_summary:  row.output_summary as string,
    };
  });

  return NextResponse.json({ results });
}
