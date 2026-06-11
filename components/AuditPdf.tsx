// react-pdf/renderer primitives only — no DOM elements.
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { AGENT_LABELS, ACTION_TYPE_LABELS, type GovernanceEvent } from "@/types/governance";

const styles = StyleSheet.create({
  page:        { padding: 40, fontSize: 9, fontFamily: "Helvetica" },
  title:       { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle:    { fontSize: 10, color: "#666", marginBottom: 6 },
  section:     { marginTop: 18, marginBottom: 8, fontSize: 11, fontWeight: "bold", color: "#111" },
  divider:     { borderBottom: "1px solid #e5e7eb", marginBottom: 6 },
  row:         { flexDirection: "row", paddingVertical: 5, borderBottom: "0.5px solid #e5e7eb" },
  headerRow:   { flexDirection: "row", paddingVertical: 5, borderBottom: "1px solid #d1d5db", backgroundColor: "#f9fafb" },
  cell:        { flex: 1, paddingHorizontal: 3, color: "#374151" },
  cellHdr:     { flex: 1, paddingHorizontal: 3, fontWeight: "bold", color: "#111" },
  cellWide:    { flex: 3, paddingHorizontal: 3, color: "#374151" },
  cellHdrWide: { flex: 3, paddingHorizontal: 3, fontWeight: "bold", color: "#111" },
  badge:       { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, fontSize: 8 },
  statGrid:    { flexDirection: "row", gap: 12, marginTop: 4 },
  statBox:     { flex: 1, padding: 10, backgroundColor: "#f3f4f6", borderRadius: 6 },
  statLabel:   { fontSize: 7, color: "#6b7280", marginBottom: 3, textTransform: "uppercase" },
  statValue:   { fontSize: 14, fontWeight: "bold", color: "#111" },
});

function confidenceLabel(c: number | null): string {
  if (c === null) return "—";
  return `${(c * 100).toFixed(0)}%`;
}

interface Props {
  events: GovernanceEvent[];
  generatedAt: string;
  userEmail?: string;
  filters?: { dateFrom?: string; dateTo?: string; agents?: string[] };
}

export function AuditPdfDocument({ events, generatedAt, userEmail, filters }: Props) {
  const hilRequired    = events.filter((e) => e.human_in_loop === "required").length;
  const hilRecommended = events.filter((e) => e.human_in_loop === "recommended").length;
  const lowConf        = events.filter((e) => e.confidence !== null && e.confidence < 0.65).length;
  const avgConf        = events.filter((e) => e.confidence !== null).reduce((s, e) => s + (e.confidence ?? 0), 0) /
    (events.filter((e) => e.confidence !== null).length || 1);

  return (
    <Document
      title="DOME Governance Audit Report"
      author="Dome Governance Dashboard"
      creator="Dome Governance Dashboard"
    >
      <Page size="A4" style={styles.page}>
        {/* Cover */}
        <Text style={styles.title}>DOME Governance Audit Report</Text>
        <Text style={styles.subtitle}>Generated: {new Date(generatedAt).toLocaleString()}</Text>
        {userEmail && <Text style={styles.subtitle}>User: {userEmail}</Text>}
        {filters?.dateFrom && (
          <Text style={styles.subtitle}>
            Period: {filters.dateFrom}{filters.dateTo ? ` — ${filters.dateTo}` : ""}
          </Text>
        )}
        {filters?.agents?.length && (
          <Text style={styles.subtitle}>
            Tools: {filters.agents.map((a) => AGENT_LABELS[a] ?? a).join(", ")}
          </Text>
        )}

        <View style={styles.divider} />

        {/* Summary */}
        <Text style={styles.section}>Summary</Text>
        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total events</Text>
            <Text style={styles.statValue}>{events.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Review required</Text>
            <Text style={styles.statValue}>{hilRequired}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Review recommended</Text>
            <Text style={styles.statValue}>{hilRecommended}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Low confidence</Text>
            <Text style={styles.statValue}>{lowConf}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg confidence</Text>
            <Text style={styles.statValue}>{confidenceLabel(avgConf)}</Text>
          </View>
        </View>

        {/* Event table */}
        <Text style={styles.section}>Events ({events.length})</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.cellHdr, { flex: 2 }]}>Timestamp</Text>
          <Text style={styles.cellHdr}>Tool</Text>
          <Text style={styles.cellHdr}>Action</Text>
          <Text style={styles.cellHdrWide}>Summary</Text>
          <Text style={styles.cellHdr}>Confidence</Text>
          <Text style={styles.cellHdr}>Review</Text>
        </View>

        {events.map((ev) => (
          <View key={ev.id} style={styles.row}>
            <Text style={[styles.cell, { flex: 2 }]}>
              {new Date(ev.timestamp).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
            </Text>
            <Text style={styles.cell}>{AGENT_LABELS[ev.agent_id] ?? ev.agent_id}</Text>
            <Text style={styles.cell}>{ACTION_TYPE_LABELS[ev.action_type] ?? ev.action_type}</Text>
            <Text style={styles.cellWide}>{ev.output_summary.slice(0, 120)}{ev.output_summary.length > 120 ? "…" : ""}</Text>
            <Text style={styles.cell}>{confidenceLabel(ev.confidence)}</Text>
            <Text style={styles.cell}>{ev.human_in_loop === "not_required" ? "Not req." : ev.human_in_loop}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 7, color: "#9ca3af" }}>
            This report was generated by the DOME Governance Dashboard. Events are immutable audit records
            written by DOME AI tools and stored in a governed database with row-level security.
            Input hashes and timestamps provide tamper evidence.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
