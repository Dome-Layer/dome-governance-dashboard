"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { GovernanceEvent, EventFilters } from "@/types/governance";

export const PAGE_SIZE = 20;

function buildQuery(
  supabase: ReturnType<typeof getSupabaseClient>,
  filters: EventFilters,
) {
  let q = supabase.from("governance_events").select("*", { count: "exact" });
  if (filters.agent_ids?.length) q = q.in("agent_id", filters.agent_ids);
  if (filters.action_type)       q = q.eq("action_type", filters.action_type);
  if (filters.date_from)         q = q.gte("timestamp", filters.date_from + "T00:00:00Z");
  if (filters.date_to)           q = q.lte("timestamp", filters.date_to   + "T23:59:59Z");
  if (filters.human_in_loop)     q = q.eq("human_in_loop", filters.human_in_loop);
  if (filters.min_confidence !== undefined) q = q.gte("confidence", filters.min_confidence);
  return q;
}

export function useGovernanceEvents(filters: EventFilters, page: number) {
  const [events, setEvents] = useState<GovernanceEvent[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    const offset = (page - 1) * PAGE_SIZE;
    const { data, count, error: qErr } = await buildQuery(supabase, filters)
      .order("timestamp", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (qErr) {
      setError(qErr.message);
    } else {
      setEvents((data ?? []) as GovernanceEvent[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  return { events, total, loading, error };
}

export function useGovernanceEvent(id: string) {
  const [event, setEvent]   = useState<GovernanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error: qErr } = await supabase
        .from("governance_events")
        .select("*")
        .eq("id", id)
        .single();
      if (qErr) {
        setError(qErr.code === "PGRST116" ? "Event not found." : qErr.message);
      } else {
        setEvent(data as GovernanceEvent);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return { event, loading, error };
}

export async function loadAllForExport(filters: EventFilters): Promise<GovernanceEvent[]> {
  const supabase = getSupabaseClient();
  const { data } = await buildQuery(supabase, filters)
    .order("timestamp", { ascending: false })
    .limit(1000);
  return (data ?? []) as GovernanceEvent[];
}
