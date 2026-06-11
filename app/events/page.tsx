"use client";

import { AuthGuard } from "@dome-layer/dome-ui";
import { useGovernanceEvents } from "@/hooks/useGovernanceEvents";
import { EventsTable } from "@/components/EventsTable";
import { EventFilters } from "@/components/EventFilters";
import { useState } from "react";
import type { EventFilters as Filters } from "@/types/governance";

export default function EventsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const { events, total, loading, error } = useGovernanceEvents(filters, page);

  return (
    <AuthGuard>
      <main className="flex-1 max-w-[1152px] mx-auto w-full px-6 md:px-8 py-10">
        <h1
          className="text-xl font-semibold mb-6 tracking-dome-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Event Log
        </h1>
        <EventFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        <EventsTable
          events={events}
          total={total}
          page={page}
          onPageChange={setPage}
          loading={loading}
          error={error}
        />
      </main>
    </AuthGuard>
  );
}
