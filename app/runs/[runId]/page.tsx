"use client";

import { AuthGuard, Badge } from "@dome-layer/dome-ui";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkflowRun } from "@/hooks/useWorkflowRuns";
import { AGENT_LABELS, ACTION_TYPE_LABELS, type GovernanceEvent } from "@/types/governance";

type BadgeVariant = "default" | "accent" | "warning" | "error" | "success";

function hilVariant(hil: string): BadgeVariant {
  if (hil === "required") return "error";
  if (hil === "recommended") return "warning";
  if (hil === "completed") return "success";
  return "default";
}

function TimelineItem({ ev, last }: { ev: GovernanceEvent; last: boolean }) {
  return (
    <li className="relative pl-8 pb-6">
      {!last && (
        <span
          className="absolute left-[7px] top-3 bottom-0 w-px"
          style={{ background: "var(--color-border-default)" }}
          aria-hidden
        />
      )}
      <span
        className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-base)" }}
        aria-hidden
      />
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="accent">{AGENT_LABELS[ev.agent_id] ?? ev.agent_id}</Badge>
        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {ACTION_TYPE_LABELS[ev.action_type] ?? ev.action_type}
        </span>
        <span className="text-xs tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
          {new Date(ev.timestamp).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        {ev.output_summary}
      </p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {ev.confidence !== null && (
          <span className="text-xs tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
            confidence {Math.round(ev.confidence * 100)}%
          </span>
        )}
        {ev.human_in_loop && ev.human_in_loop !== "not_required" && (
          <Badge variant={hilVariant(ev.human_in_loop)}>{ev.human_in_loop.replace("_", " ")}</Badge>
        )}
        {ev.rules_triggered.map((r) => (
          <Badge key={r} variant="error">
            {r}
          </Badge>
        ))}
      </div>
    </li>
  );
}

export default function WorkflowRunPage() {
  const params = useParams<{ runId: string }>();
  const runId = (params?.runId as string) ?? "";
  const { run, loading, error } = useWorkflowRun(runId);

  return (
    <AuthGuard>
      <main className="flex-1 max-w-[820px] mx-auto w-full px-6 md:px-8 py-10">
        <Link href="/runs" className="text-sm" style={{ color: "var(--color-text-accent)" }}>
          ← Back to workflow runs
        </Link>

        {loading && (
          <p className="text-sm mt-6" style={{ color: "var(--color-text-secondary)" }}>
            Loading…
          </p>
        )}
        {error && (
          <p className="text-sm mt-6" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        {run && (
          <>
            <h1
              className="text-xl font-semibold mt-4 mb-1 tracking-dome-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {run.vendor ?? "Workflow run"}
            </h1>
            <p className="font-mono text-xs mb-6" style={{ color: "var(--color-text-tertiary)" }}>
              {run.workflow_run_id}
            </p>
            <ol className="mt-2">
              {run.events.map((ev, i) => (
                <TimelineItem key={ev.id} ev={ev} last={i === run.events.length - 1} />
              ))}
            </ol>
          </>
        )}
      </main>
    </AuthGuard>
  );
}
