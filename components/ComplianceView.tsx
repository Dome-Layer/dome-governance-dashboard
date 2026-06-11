"use client";

import { useState, useEffect } from "react";
import { Badge } from "@dome-layer/dome-ui";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import {
  AGENT_IDS,
  AGENT_LABELS,
  type GovernanceEvent,
  type EvalMetrics,
} from "@/types/governance";

interface Aggregates {
  total: number;
  byAgent: Record<string, number>;
  byHil: Record<string, number>;
  rulesTriggered: Array<{ rule: string; count: number }>;
  lowConfidence: GovernanceEvent[];
}

function aggregate(events: GovernanceEvent[]): Aggregates {
  const byAgent: Record<string, number> = {};
  const byHil: Record<string, number> = {};
  const ruleCounts: Record<string, number> = {};
  const lowConfidence: GovernanceEvent[] = [];

  for (const ev of events) {
    byAgent[ev.agent_id] = (byAgent[ev.agent_id] ?? 0) + 1;
    byHil[ev.human_in_loop] = (byHil[ev.human_in_loop] ?? 0) + 1;
    for (const r of ev.rules_triggered) {
      ruleCounts[r] = (ruleCounts[r] ?? 0) + 1;
    }
    if (ev.confidence !== null && ev.confidence < 0.65) {
      lowConfidence.push(ev);
    }
  }

  const rulesTriggered = Object.entries(ruleCounts)
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { total: events.length, byAgent, byHil, rulesTriggered, lowConfidence };
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="p-5 rounded-dome-card border"
      style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border-default)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-dome mb-1" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

export function ComplianceView() {
  const [events, setEvents]     = useState<GovernanceEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [evalData, setEvalData] = useState<EvalMetrics[] | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error: qErr } = await supabase
        .from("governance_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500);
      if (qErr) { setError(qErr.message); }
      else       { setEvents((data ?? []) as GovernanceEvent[]); }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    fetch("/api/eval-metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEvalData(d?.results ?? null))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-dome-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm py-8 text-center" style={{ color: "var(--color-error)" }}>{error}</p>;
  }

  const agg = aggregate(events);
  const hilRequired = agg.byHil["required"] ?? 0;

  return (
    <div className="space-y-8 section-animate section-delay-0">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total events" value={agg.total} />
        <StatCard label="Human review required" value={hilRequired} />
        <StatCard label="Low confidence" value={agg.lowConfidence.length} />
        <StatCard label="Rules triggered" value={agg.rulesTriggered.length > 0 ? agg.rulesTriggered[0].count : 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by tool */}
        <Section title="Events by tool">
          <div className="space-y-2.5">
            {AGENT_IDS.map((id) => {
              const count = agg.byAgent[id] ?? 0;
              const pct = agg.total > 0 ? (count / agg.total) * 100 : 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-xs w-44 shrink-0" style={{ color: "var(--color-text-secondary)" }}>
                    {AGENT_LABELS[id]}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--color-accent)" }}
                    />
                  </div>
                  <span className="text-xs tabular-nums w-8 text-right" style={{ color: "var(--color-text-tertiary)" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Human-in-loop distribution */}
        <Section title="Human review distribution">
          <div className="space-y-2.5">
            {[
              { key: "required",    label: "Required",     variant: "error"   as const },
              { key: "recommended", label: "Recommended",  variant: "warning" as const },
              { key: "not_required",label: "Not required", variant: "success" as const },
            ].map(({ key, label, variant }) => {
              const count = agg.byHil[key] ?? 0;
              const pct = agg.total > 0 ? (count / agg.total) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <Badge variant={variant} className="w-28 justify-center shrink-0">{label}</Badge>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: variant === "error" ? "var(--color-error)" : variant === "warning" ? "var(--color-warning)" : "var(--color-success)",
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums w-8 text-right" style={{ color: "var(--color-text-tertiary)" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Rules triggered */}
      {agg.rulesTriggered.length > 0 && (
        <Section title="Top rules triggered">
          <div className="space-y-2">
            {agg.rulesTriggered.map(({ rule, count }) => (
              <div key={rule} className="flex items-center justify-between gap-4 py-1.5" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>{rule}</span>
                <Badge variant="warning">{count}</Badge>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Low-confidence events */}
      {agg.lowConfidence.length > 0 && (
        <Section title={`Low-confidence events (confidence < 65%) — ${agg.lowConfidence.length}`}>
          <div className="space-y-1.5">
            {agg.lowConfidence.slice(0, 10).map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="flex items-start gap-3 py-2 rounded-dome hover:bg-[var(--color-bg-muted)] px-2 transition-colors"
              >
                <Badge variant="error">{ev.confidence !== null ? `${(ev.confidence * 100).toFixed(0)}%` : "—"}</Badge>
                <div className="min-w-0">
                  <p className="text-xs leading-snug line-clamp-1" style={{ color: "var(--color-text-primary)" }}>
                    {ev.output_summary}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    {AGENT_LABELS[ev.agent_id] ?? ev.agent_id} · {new Date(ev.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Eval quality */}
      <Section title="Model evaluation quality (Document Intelligence)">
        {evalData === null ? (
          <p className="text-xs py-2" style={{ color: "var(--color-text-tertiary)" }}>
            No eval runs found in the audit log. Run <code className="font-mono">make eval</code> in dome-document-intelligence to populate.
          </p>
        ) : (
          <div className="space-y-4">
            {evalData.map((run, i) => (
              <div key={i} className="rounded-dome border p-4 space-y-3" style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-muted)" }}>
                <div className="flex items-center justify-between">
                  <Badge variant={run.trustworthy ? "success" : "error"}>
                    {run.trustworthy ? "Trustworthy" : "Below threshold"}
                  </Badge>
                  <span className="text-xs tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
                    {new Date(run.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{run.output_summary}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <KV k="Agreement" v={`${(run.agreement_rate * 100).toFixed(1)}%`} />
                  <KV k="Objective fields" v={`${run.n_agree}/${run.n_objective}`} />
                  <KV k="Docs evaluated" v={String(run.n_docs)} />
                  <KV k="Judge model" v={run.judge_model} mono />
                  <KV k="Generator" v={run.generator_model} mono />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-dome-card border p-6"
      style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border-default)" }}
    >
      <h2 className="text-sm font-semibold mb-4 tracking-dome-tight" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <p style={{ color: "var(--color-text-tertiary)" }}>{k}</p>
      <p className={mono ? "font-mono" : "font-medium"} style={{ color: "var(--color-text-primary)" }}>{v}</p>
    </div>
  );
}
