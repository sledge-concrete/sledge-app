import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import type { DailyReport } from "./mock/daily-reports";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    marginBottom: 4,
    color: "#ccc",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginRight: 10,
  },
  gridItemLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  label: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 2,
    borderColor: "#333",
    padding: 8,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: "#333",
  },
  signature: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    height: 100,
  },
  signatureImage: {
    width: "100%",
    height: "100%",
  },
});

interface DailyReportPDFProps {
  report: DailyReport;
}

function DailyReportPDF({ report }: DailyReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{report.jobName}</Text>
          <Text style={styles.headerSubtitle}>Project: {report.projectNumber}</Text>
          <Text style={styles.headerSubtitle}>Company: {report.company}</Text>
          <Text style={styles.headerSubtitle}>Date: {report.date}</Text>
        </View>

        {/* Weather Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather</Text>
          <View style={styles.gridContainer}>
            {report.weather.map((snap, idx) => (
              <View
                key={idx}
                style={idx === report.weather.length - 1 ? styles.gridItemLast : styles.gridItem}
              >
                <Text style={styles.label}>{snap.time}</Text>
                <Text style={styles.value}>{snap.temp}°C</Text>
                <Text style={styles.label}>
                  Precip: {snap.precip}mm
                </Text>
                <Text style={styles.label}>Wind: {snap.wind}km/h</Text>
                <Text style={styles.label}>Humidity: {snap.humidity}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Summary</Text>
          <Text style={{ fontSize: 10, color: "#333", lineHeight: 1.5 }}>{report.progressSummary}</Text>
        </View>

        {/* Employee Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Summary</Text>
          <Text style={{ fontSize: 10, color: "#666", marginBottom: 8 }}>
            On Site: {report.employeeSummary.onSiteCount} / {report.employeeSummary.plannedCount}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Name</Text>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Role</Text>
              <Text style={[styles.tableCell, { fontWeight: "bold", textAlign: "right" }]}>Hours</Text>
            </View>
            {report.employeeSummary.attendance.map((att, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{att.name}</Text>
                <Text style={styles.tableCell}>{att.role}</Text>
                <Text style={[styles.tableCell, { textAlign: "right" }]}>{att.hoursWorked}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Section */}
        {report.safety && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Hazards</Text>
                <Text style={styles.value}>{report.safety.hazardsIdentified}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Controls</Text>
                <Text style={styles.value}>{report.safety.controlsImplemented}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Incidents</Text>
                <Text style={styles.value}>{report.safety.incidents}</Text>
              </View>
              <View style={styles.gridItemLast}>
                <Text style={styles.label}>Near Misses</Text>
                <Text style={styles.value}>{report.safety.nearMisses}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Signature */}
        {report.signature && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sign-Off</Text>
            <View style={styles.signature}>
              <Image source={report.signature.dataUrl} style={styles.signatureImage} />
            </View>
            <View style={{ marginTop: 10, display: "flex", flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Printed Name</Text>
                <Text style={styles.value}>{report.signature.printedName}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{report.signature.date}</Text>
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateDailyReportPDF(report: DailyReport, filename: string) {
  if (typeof window === "undefined") {
    throw new Error("PDF generation only works in the browser");
  }

  const doc = <DailyReportPDF report={report} />;
  const pdfBlob = await pdf(doc).toBlob();

  // Create download link
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
