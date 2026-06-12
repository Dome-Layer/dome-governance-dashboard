"use client";

import Link from "next/link";
import { AuthGuard } from "@dome-layer/dome-ui";
import { LayoutGrid, FileText, ShieldCheck, Download } from "lucide-react";

const sections = [
  {
    href: "/events",
    icon: LayoutGrid,
    label: "Event Log",
    desc: "Browse and filter all governance events across every tool.",
  },
  {
    href: "/compliance",
    icon: ShieldCheck,
    label: "Compliance",
    desc: "Rules triggered, human-in-loop decisions, and confidence distribution.",
  },
  {
    href: "/export",
    icon: Download,
    label: "PDF Export",
    desc: "Generate a downloadable audit report for any date range.",
  },
];

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="flex-1 max-w-[1152px] mx-auto w-full px-6 md:px-8 py-12 section-animate section-delay-0">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText
              size={22}
              strokeWidth={1.5}
              style={{ color: "var(--color-accent)" }}
            />
            <h1
              className="text-2xl font-semibold tracking-dome-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Governance Dashboard
            </h1>
          </div>
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Audit trail and compliance reporting for all DOME AI tools — Process
            Analyzer, LLM Council, Document Intelligence, and Data Intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ href, icon: Icon, label, desc }, i) => (
            <Link
              key={href}
              href={href}
              className={`block p-6 rounded-dome-card border transition-colors section-animate section-delay-${i + 1}`}
              style={{
                background: "var(--color-bg-base)",
                borderColor: "var(--color-border-default)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  style={{ color: "var(--color-accent)" }}
                />
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {label}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
