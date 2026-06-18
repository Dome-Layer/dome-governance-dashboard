"use client";

import { AuthGuard, Badge } from "@dome-layer/dome-ui";
import Link from "next/link";
import { useWorkflowRuns, type WorkflowRun } from "@/hooks/useWorkflowRuns";

function money(amount: number | null, currency: string | null): string {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  } catch {
    return `${amount} ${currency ?? ""}`.trim();
  }
}

function TerminalBadge({ run }: { run: WorkflowRun }) {
  if (run.terminal === "invoice_approved") return <Badge variant="success">Approved</Badge>;
  if (run.terminal === "invoice_rejected") return <Badge variant="error">Rejected</Badge>;
  return <Badge variant="warning">In progress</Badge>;
}

export default function RunsPage() {
  const { runs, loading, error } = useWorkflowRuns();

  return (
    <AuthGuard>
      <main className="flex-1 max-w-[960px] mx-auto w-full px-6 md:px-8 py-10">
        <h1
          className="text-xl font-semibold mb-2 tracking-dome-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Workflow runs
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Cross-tool agent-flow executions reconstructed from the governance audit trail.
        </p>

        {loading && (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading…
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}
        {!loading && !error && runs.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No workflow runs yet — they appear once the Agent Flow emits a run.
          </p>
        )}

        <div className="grid gap-3">
          {runs.map((run) => (
            <Link key={run.workflow_run_id} href={`/runs/${run.workflow_run_id}`} className="block">
              <div
                className="rounded-dome-card p-4 section-animate"
                style={{
                  background: "var(--color-bg-base)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {run.vendor ?? "Workflow run"}
                      {run.amount != null && (
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          {" "}
                          · {money(run.amount, run.currency)}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {run.workflow_run_id}
                    </div>
                  </div>
                  <TerminalBadge run={run} />
                </div>
                <div
                  className="flex items-center gap-2 mt-3 text-xs flex-wrap"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span>{run.events.length} steps</span>
                  <span>·</span>
                  <span>{run.agents.length} tools</span>
                  <span>·</span>
                  <span>
                    {new Date(run.started_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
