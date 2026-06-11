"use client";

import { Badge } from "@dome-layer/dome-ui";
import { AGENT_IDS, AGENT_LABELS, type EventFilters } from "@/types/governance";

interface Props {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

const inputBase =
  "text-sm rounded-dome border px-3 py-1.5 bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export function EventFilters({ filters, onChange }: Props) {
  function update(patch: Partial<EventFilters>) {
    onChange({ ...filters, ...patch });
  }

  function toggleAgent(id: string) {
    const current = filters.agent_ids ?? [];
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    update({ agent_ids: next.length ? next : undefined });
  }

  const hasFilters =
    (filters.agent_ids?.length ?? 0) > 0 ||
    filters.date_from ||
    filters.date_to ||
    filters.human_in_loop ||
    filters.min_confidence !== undefined;

  return (
    <div
      className="mb-6 p-4 rounded-dome-card border"
      style={{
        background: "var(--color-bg-base)",
        borderColor: "var(--color-border-default)",
      }}
    >
      <div className="flex flex-wrap gap-4 items-end">
        {/* Agent filter */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-dome"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Tool
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AGENT_IDS.map((id) => {
              const active = (filters.agent_ids ?? []).includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleAgent(id)}
                >
                  <Badge variant={active ? "accent" : "default"}>
                    {AGENT_LABELS[id]}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-dome"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              From
            </label>
            <input
              type="date"
              value={filters.date_from ?? ""}
              onChange={(e) => update({ date_from: e.target.value || undefined })}
              className={inputBase}
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-dome"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              To
            </label>
            <input
              type="date"
              value={filters.date_to ?? ""}
              onChange={(e) => update({ date_to: e.target.value || undefined })}
              className={inputBase}
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
            />
          </div>
        </div>

        {/* Human-in-loop */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-dome"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Human review
          </label>
          <select
            value={filters.human_in_loop ?? ""}
            onChange={(e) => update({ human_in_loop: e.target.value || undefined })}
            className={inputBase}
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
          >
            <option value="">All</option>
            <option value="required">Required</option>
            <option value="recommended">Recommended</option>
            <option value="not_required">Not required</option>
          </select>
        </div>

        {/* Min confidence */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-dome"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Min confidence
          </label>
          <select
            value={filters.min_confidence ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update({ min_confidence: v === "" ? undefined : parseFloat(v) });
            }}
            className={inputBase}
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
          >
            <option value="">Any</option>
            <option value="0.8">≥ 0.8 (high)</option>
            <option value="0.65">≥ 0.65 (medium)</option>
            <option value="0.5">≥ 0.5 (low)</option>
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-xs font-medium underline underline-offset-2 self-end pb-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
