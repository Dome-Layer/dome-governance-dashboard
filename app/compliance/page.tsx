"use client";

import { AuthGuard } from "@dome-layer/dome-ui";
import { ComplianceView } from "@/components/ComplianceView";

export default function CompliancePage() {
  return (
    <AuthGuard>
      <main className="flex-1 max-w-[1152px] mx-auto w-full px-6 md:px-8 py-10">
        <h1
          className="text-xl font-semibold mb-6 tracking-dome-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Compliance
        </h1>
        <ComplianceView />
      </main>
    </AuthGuard>
  );
}
