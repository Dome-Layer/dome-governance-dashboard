"use client";

import { useState } from "react";
import { Download, Loader } from "lucide-react";
import { Badge } from "@dome-layer/dome-ui";
import { useAuth } from "@/context/AuthContext";
import { AGENT_IDS, AGENT_LABELS, type EventFilters } from "@/types/governance";
import { loadAllForExport } from "@/hooks/useGovernanceEvents";
import { createElement } from "react";

const inputBase =
  "text-sm rounded-dome border px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] w-full";

export function ExportView() {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [agents, setAgents]     = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function toggleAgent(id: string) {
    setAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const filters: EventFilters = {
        agent_ids: agents.length ? agents : undefined,
        date_from: dateFrom || undefined,
        date_to:   dateTo   || undefined,
      };

      const events = await loadAllForExport(filters);
      if (!events.length) {
        setError("No events match the selected filters.");
        setGenerating(false);
        return;
      }

      // Dynamic import to avoid SSR — react-pdf needs browser Canvas API.
      const [{ pdf }, { AuditPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./AuditPdf"),
      ]);

      const element = createElement(AuditPdfDocument, {
        events,
        generatedAt: new Date().toISOString(),
        userEmail: user?.email,
        filters: {
          dateFrom: dateFrom || undefined,
          dateTo:   dateTo   || undefined,
          agents:   agents.length ? agents : undefined,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `dome-audit-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed.");
    }
    setGenerating(false);
  }

  return (
    <div
      className="rounded-dome-card border p-8 max-w-lg section-animate section-delay-0"
      style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border-default)" }}
    >
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        Generate a PDF audit report from your governance events. The report includes a
        summary and a full event table with confidence scores and review decisions.
      </p>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-dome block mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputBase}
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-dome block mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputBase}
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
          />
        </div>
      </div>

      {/* Agent filter */}
      <div className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-dome block mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
          Tools (leave empty for all)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AGENT_IDS.map((id) => {
            const active = agents.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggleAgent(id)}>
                <Badge variant={active ? "accent" : "default"}>{AGENT_LABELS[id]}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-xs mb-4" style={{ color: "var(--color-error)" }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <Loader size={14} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Download size={14} />
            Generate PDF
          </>
        )}
      </button>

      <p className="text-xs mt-3 text-center" style={{ color: "var(--color-text-tertiary)" }}>
        Reports include up to 1 000 events, newest first.
      </p>
    </div>
  );
}
