"use client";

import Link from "next/link";
import { ArrowLeft, Hash } from "lucide-react";
import { Badge } from "@dome-layer/dome-ui";
import { AGENT_LABELS, ACTION_TYPE_LABELS, type GovernanceEvent } from "@/types/governance";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span className="text-xs font-semibold uppercase tracking-dome w-40 shrink-0 mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
      <div className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
        {children}
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.8 ? "var(--color-success)" : value >= 0.5 ? "var(--color-warning)" : "var(--color-error)";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-muted)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

interface Props {
  event: GovernanceEvent | null;
  loading: boolean;
  error: string | null;
}

export function EventDetail({ event, loading, error }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-6 w-48 rounded-dome" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-dome" />
        ))}
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          {error ?? "Event not found."}
        </p>
        <Link href="/events" className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
          ← Back to events
        </Link>
      </div>
    );
  }

  const hilVariant = event.human_in_loop === "required" ? "error" : event.human_in_loop === "recommended" ? "warning" : "success";

  return (
    <div className="section-animate section-delay-0">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-xs mb-6 font-medium"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <ArrowLeft size={13} /> Events
      </Link>

      <h1 className="text-lg font-semibold mb-1 tracking-dome-tight" style={{ color: "var(--color-text-primary)" }}>
        Event detail
      </h1>
      <p className="text-xs mb-6 font-mono" style={{ color: "var(--color-text-tertiary)" }}>{event.id}</p>

      <div
        className="rounded-dome-card border"
        style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border-default)" }}
      >
        <div className="px-6">
          <Row label="Timestamp">
            <span className="tabular-nums">
              {new Date(event.timestamp).toLocaleString(undefined, {
                dateStyle: "long",
                timeStyle: "medium",
              })}
            </span>
          </Row>

          <Row label="Tool">
            <Badge variant="accent">{AGENT_LABELS[event.agent_id] ?? event.agent_id}</Badge>
          </Row>

          <Row label="Action">
            <span style={{ color: "var(--color-text-secondary)" }}>
              {ACTION_TYPE_LABELS[event.action_type] ?? event.action_type}
            </span>
          </Row>

          <Row label="Summary">
            <span className="leading-relaxed">{event.output_summary}</span>
          </Row>

          {event.confidence !== null && (
            <Row label="Confidence">
              <ConfidenceBar value={event.confidence} />
            </Row>
          )}

          <Row label="Human review">
            <Badge variant={hilVariant}>
              {event.human_in_loop === "not_required"
                ? "Not required"
                : event.human_in_loop.charAt(0).toUpperCase() + event.human_in_loop.slice(1)}
            </Badge>
          </Row>

          {event.rules_applied.length > 0 && (
            <Row label="Rules applied">
              <div className="flex flex-wrap gap-1.5">
                {event.rules_applied.map((r) => (
                  <Badge key={r} variant={event.rules_triggered.includes(r) ? "warning" : "default"}>
                    {r}
                  </Badge>
                ))}
              </div>
            </Row>
          )}

          {event.rules_triggered.length > 0 && (
            <Row label="Rules triggered">
              <div className="flex flex-wrap gap-1.5">
                {event.rules_triggered.map((r) => (
                  <Badge key={r} variant="error">{r}</Badge>
                ))}
              </div>
            </Row>
          )}

          <Row label="Input hash">
            <span className="font-mono text-xs flex items-center gap-1.5" style={{ color: "var(--color-text-tertiary)" }}>
              <Hash size={11} />
              {event.input_hash.slice(0, 16)}…
            </span>
          </Row>

          {event.workflow_run_id && (
            <Row label="Workflow run">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {event.workflow_run_id}
              </span>
            </Row>
          )}

          {Object.keys(event.metadata).length > 0 && (
            <Row label="Metadata">
              <pre
                className="text-xs overflow-x-auto rounded-dome p-3 font-mono leading-relaxed"
                style={{ background: "var(--color-bg-muted)", color: "var(--color-text-secondary)" }}
              >
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}
