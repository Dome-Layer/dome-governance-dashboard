"use client";

import { AuthGuard } from "@dome-layer/dome-ui";
import { useGovernanceEvent } from "@/hooks/useGovernanceEvents";
import { EventDetail } from "@/components/EventDetail";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { event, loading, error } = useGovernanceEvent(params.id);

  return (
    <AuthGuard>
      <main className="flex-1 max-w-[1152px] mx-auto w-full px-6 md:px-8 py-10">
        <EventDetail event={event} loading={loading} error={error} />
      </main>
    </AuthGuard>
  );
}
