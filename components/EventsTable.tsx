"use client";

import Link from "next/link";
import { Badge } from "@dome-layer/dome-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AGENT_LABELS, ACTION_TYPE_LABELS, type GovernanceEvent } from "@/types/governance";
import { PAGE_SIZE } from "@/hooks/useGovernanceEvents";

function confidenceVariant(c: number | null) {
  if (c === null) return "default" as const;
  if (c >= 0.8)  return "success" as const;
  if (c >= 0.5)  return "warning" as const;
  return "error" as const;
}

function hilVariant(h: string) {
  if (h === "required")    return "error"   as const;
  if (h === "recommended") return "warning" as const;
  return "success" as const;
}

function Skeleton() {
  return (
    <div className="space-y-2 mt-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-10 rounded-dome" />
      ))}
    </div>
  );
}

interface Props {
  events: GovernanceEvent[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  loading: boolean;
  error: string | null;
}

export function EventsTable({ events, total, page, onPageChange, loading, error }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading) return <Skeleton />;
  if (error) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--color-error)" }}>
        {error}
      </p>
    );
  }
  if (!events.length) {
    return (
      <p className="text-sm py-12 text-center" style={{ color: "var(--color-text-tertiary)" }}>
        No events match the current filters.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
        {total} event{total !== 1 ? "s" : ""} · page {page} of {totalPages}
      </p>

      <div className="overflow-x-auto rounded-dome-card border" style={{ borderColor: "var(--color-border-default)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border-default)", background: "var(--color-bg-muted)" }}>
              {["Timestamp", "Tool", "Action", "Summary", "Confidence", "Review"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-dome whitespace-nowrap"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => (
              <tr
                key={ev.id}
                style={{
                  borderBottom: i < events.length - 1 ? "1px solid var(--color-border-subtle)" : undefined,
                  background: "var(--color-bg-base)",
                }}
              >
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {new Date(ev.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="accent">{AGENT_LABELS[ev.agent_id] ?? ev.agent_id}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {ACTION_TYPE_LABELS[ev.action_type] ?? ev.action_type}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <Link
                    href={`/events/${ev.id}`}
                    className="text-xs leading-snug hover:underline underline-offset-2 line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {ev.output_summary}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {ev.confidence !== null ? (
                    <Badge variant={confidenceVariant(ev.confidence)}>
                      {(ev.confidence * 100).toFixed(0)}%
                    </Badge>
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={hilVariant(ev.human_in_loop)}>
                    {ev.human_in_loop === "not_required" ? "Not required" : ev.human_in_loop.charAt(0).toUpperCase() + ev.human_in_loop.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-dome border disabled:opacity-40"
            style={{ borderColor: "var(--color-border-default)" }}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} style={{ color: "var(--color-text-secondary)" }} />
          </button>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-dome border disabled:opacity-40"
            style={{ borderColor: "var(--color-border-default)" }}
            aria-label="Next page"
          >
            <ChevronRight size={14} style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
