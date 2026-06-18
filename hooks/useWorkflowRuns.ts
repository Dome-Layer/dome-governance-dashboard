"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { GovernanceEvent } from "@/types/governance";

const TERMINAL = ["invoice_approved", "invoice_rejected"];

export interface WorkflowRun {
  workflow_run_id: string;
  events: GovernanceEvent[];
  started_at: string;
  last_at: string;
  agents: string[];
  terminal: string | null; // invoice_approved | invoice_rejected | null
  vendor: string | null;
  amount: number | null;
  currency: string | null;
}

function metaString(ev: GovernanceEvent | undefined, key: string): string | null {
  const v = ev?.metadata?.[key];
  return typeof v === "string" ? v : null;
}

function metaNumber(ev: GovernanceEvent | undefined, key: string): number | null {
  const v = ev?.metadata?.[key];
  return typeof v === "number" ? v : null;
}

function summarise(id: string, events: GovernanceEvent[]): WorkflowRun {
  const ordered = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const terminalEv = ordered.find((e) => TERMINAL.includes(e.action_type));
  const rulesEv = ordered.find((e) => e.action_type === "rules_evaluated");
  const ref = terminalEv ?? rulesEv;
  return {
    workflow_run_id: id,
    events: ordered,
    started_at: ordered[0]?.timestamp ?? "",
    last_at: ordered[ordered.length - 1]?.timestamp ?? "",
    agents: Array.from(new Set(ordered.map((e) => e.agent_id))),
    terminal: terminalEv?.action_type ?? null,
    vendor: metaString(ref, "vendor"),
    amount: metaNumber(ref, "amount"),
    currency: metaString(ref, "currency"),
  };
}

// Group all workflow_run_id-stamped events into runs, client-side (demo scale).
export function useWorkflowRuns() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { data, error: qErr } = await supabase
        .from("governance_events")
        .select("*")
        .not("workflow_run_id", "is", null)
        .order("timestamp", { ascending: false })
        .limit(500);
      if (qErr) {
        setError(qErr.message);
        setLoading(false);
        return;
      }
      const groups = new Map<string, GovernanceEvent[]>();
      for (const ev of (data ?? []) as GovernanceEvent[]) {
        const key = ev.workflow_run_id as string;
        const arr = groups.get(key);
        if (arr) arr.push(ev);
        else groups.set(key, [ev]);
      }
      const list = Array.from(groups.entries()).map(([id, evs]) => summarise(id, evs));
      list.sort((a, b) => b.started_at.localeCompare(a.started_at));
      setRuns(list);
      setLoading(false);
    })();
  }, []);

  return { runs, loading, error };
}

export function useWorkflowRun(runId: string) {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { data, error: qErr } = await supabase
        .from("governance_events")
        .select("*")
        .eq("workflow_run_id", runId)
        .order("timestamp", { ascending: true });
      if (qErr) setError(qErr.message);
      else if (!data || data.length === 0) setError("Run not found.");
      else setRun(summarise(runId, data as GovernanceEvent[]));
      setLoading(false);
    })();
  }, [runId]);

  return { run, loading, error };
}
