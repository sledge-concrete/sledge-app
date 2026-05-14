import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FlhaSession } from "@/lib/flha-types";
import { getSafetyJob } from "@/lib/mock/flha";

export function FlhaPdfDocument({ session }: { session: FlhaSession }) {
  const job = getSafetyJob(session.job_id);

  return (
    <Document title={`FLHA ${job?.name ?? session.job_id} ${session.session_date}`}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.mainTitle}>Job Hazard Assessment</Text>

        {/* Purpose Statement */}
        <View style={styles.purposeBox}>
          <Text style={styles.purposeText}>
            This purpose of this assessment is to identify &quot;day-of-the-job&quot; hazards associated with work tasks, to ensure hazards are controlled prior to starting work. Complete this
            assessment prior to the start of each new conditions of work have changed. Always check the condition of all tools and equipment and your work area for hazards prior to starting
            work. Provide completed copies of this form to your foreman. For assistance contact your supervisor or the Occupational Health and Safety Coordinator.
          </Text>
        </View>

        {/* Top Section with Location, SR#, and Crew */}
        <View style={styles.topGrid}>
          <View style={{ ...styles.topCell, width: "55%" }}>
            <Text style={styles.fieldLabel}>WORK LOCATION:</Text>
            <Text style={styles.fieldValue}>{session.work_location}</Text>
          </View>
          <View style={{ ...styles.topCell, width: "22.5%", borderLeft: "1px solid black" }}>
            <Text style={styles.fieldLabel}>SR# (Service Request)</Text>
            <Text style={styles.fieldValue}>{session.sr_number}</Text>
          </View>
          <View style={{ ...styles.topCell, width: "22.5%", borderLeft: "1px solid black" }}>
            <Text style={styles.fieldLabel}>Work Crew:</Text>
            <Text style={styles.fieldValue}>{Array.isArray(session.work_crew) ? session.work_crew.join(", ") : session.work_crew}</Text>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.fullWidthCell}>
          <Text style={styles.fieldLabel}>DESCRIPTION OF JOB or TASK:</Text>
          <Text style={styles.fieldValue}>{session.job_description}</Text>
        </View>

        {/* Supervisor and Phone */}
        <View style={styles.topGrid}>
          <View style={{ ...styles.topCell, width: "55%" }}>
            <Text style={styles.fieldLabel}>SUPERVISOR IN CHARGE:</Text>
            <Text style={styles.fieldValue}>{session.supervisor_name}</Text>
          </View>
          <View style={{ ...styles.topCell, width: "45%", borderLeft: "1px solid black" }}>
            <Text style={styles.fieldLabel}>PHONE/CELL:</Text>
            <Text style={styles.fieldValue}>{session.supervisor_phone}</Text>
          </View>
        </View>

        {/* Assessment Date and Completed By */}
        <View style={styles.topGrid}>
          <View style={{ ...styles.topCell, width: "55%" }}>
            <Text style={styles.fieldLabel}>ASSESSMENT DATE (D/M/Y):</Text>
            <Text style={styles.fieldValue}>{session.session_date}</Text>
          </View>
          <View style={{ ...styles.topCell, width: "45%", borderLeft: "1px solid black" }}>
            <Text style={styles.fieldLabel}>COMPLETED BY:</Text>
            <Text style={styles.fieldValue}>{session.filled_by}</Text>
          </View>
        </View>

        {/* Potential Hazards Section */}
        <Text style={styles.sectionHeading}>POTENTIAL HAZARDS (Check all that apply and add others as required if )</Text>
        <HazardCheckGrid hazards={session.hazards} />

        {/* Other Hazards */}
        <View style={styles.fullWidthCell}>
          <Text style={styles.fieldLabel}>OTHER HAZARDS OR INFORMATION:</Text>
          <Text style={styles.fieldValue}>{session.other_hazards.filter((h) => h.trim()).join(" | ") || " "}</Text>
        </View>

        {/* Required Controls Section */}
        <Text style={styles.sectionHeading}>REQUIRED HAZARD CONTROLS (Check all that apply and additional controls in the available space).</Text>
        <ControlCheckGrid controls={session.controls} otherControl={session.other_controls} />

        {/* Additional Info */}
        <View style={styles.fullWidthCell}>
          <Text style={styles.fieldLabel}>Additional Information or Comments (use back of page if necessary):</Text>
          <Text style={styles.fieldValue}>{session.comments || " "}</Text>
        </View>

        {/* Signature Section */}
        {session.signatures.length > 0 && (
          <View style={styles.signatureSection}>
            <Text style={styles.sectionHeading}>WORKER SIGNATURES</Text>
            {session.signatures.map((signature, index) => (
              <View key={signature.id} style={styles.signatureBlock}>
                <View style={{ width: "60%" }}>
                  {signature.signature_data.startsWith("data:image") ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image src={signature.signature_data} style={styles.signatureImage} />
                  ) : (
                    <Text style={styles.empty}>[Signature {index + 1}]</Text>
                  )}
                </View>
                <View style={{ width: "40%", paddingLeft: 8 }}>
                  <Text style={styles.signatureName}>{signature.employee_name}</Text>
                  <Text style={styles.signatureDate}>{formatDateTime(signature.signed_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Company Name</Text>
          <Text style={styles.footerText}>Field Level Hazard Assessment (FLHA)</Text>
          <Text style={styles.footerText}>DATE</Text>
        </View>
      </Page>
    </Document>
  );
}

function HazardCheckGrid({ hazards }: { hazards: string[] }) {
  const hazardGrid = [
    ["Confined Space", "Extreme heat / cold", "Mold", "Obstructions", "Fall hazards"],
    ["Working Alone", "Noise", "Electrical", "Slip/Trip Hazards", "Unsafe tools/equipment"],
    ["Awkward postures or lifting", "Asbestos", "Lighting", "Mechanical", ""],
    ["Hazardous gases/chemicals", "Sharp objects", "Animal droppings", "Entrapment", ""],
  ];

  return (
    <View style={styles.gridContainer}>
      {hazardGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((hazard, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={{
                ...styles.gridCell,
                width: hazard ? "20%" : "20%",
              }}
            >
              <Text style={styles.gridText}>
                {hazard ? (hazards.includes(hazard) ? "☒" : "☐") : ""} {hazard}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ControlCheckGrid({ controls, otherControl }: { controls: string[]; otherControl: string }) {
  const controlGrid = [
    ["Lockout tag out procedure", "Hard hat", "Mechanical ventilation", "Ladders for safe access and egress"],
    ["Protective gloves", "Respirator", "Mechanical aids", "Atmospheric testing"],
    ["Eye protection", "Protective footwear", "Emergency or rescue procedure", ""],
    ["Hearing protection", "Coveralls", "Scaffolds (Inspected and tagged)", ""],
    ["Pedestrian Barricades", "Stand by worker", "Work Permit", ""],
    ["Confined Space Entry Procedures", "Additional Lighting", "Additional training", ""],
    ["Communication device", "Fall protection", "Machine guarding", ""],
    ["Check in protocol with office or", "Fire extinguisher", "Other", ""],
  ];

  return (
    <View style={styles.gridContainer}>
      {controlGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((control, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={{
                ...styles.gridCell,
                width: control ? "25%" : "25%",
              }}
            >
              <Text style={styles.gridText}>
                {control ? (controls.includes(control) || (control === "Other" && otherControl) ? "☒" : "☐") : ""} {control}
                {control === "Other" && otherControl ? ` (${otherControl})` : ""}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    color: "#1a1a1a",
    fontFamily: "Helvetica",
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
  },
  purposeBox: {
    border: "1px solid #1a1a1a",
    padding: 6,
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 7,
    lineHeight: 1.4,
  },
  topGrid: {
    flexDirection: "row",
    borderLeft: "1px solid #1a1a1a",
    borderTop: "1px solid #1a1a1a",
    marginBottom: 0,
  },
  topCell: {
    borderRight: "1px solid #1a1a1a",
    borderBottom: "1px solid #1a1a1a",
    padding: 4,
    minHeight: 30,
  },
  fullWidthCell: {
    borderLeft: "1px solid #1a1a1a",
    borderRight: "1px solid #1a1a1a",
    borderBottom: "1px solid #1a1a1a",
    padding: 4,
    minHeight: 30,
  },
  fieldLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 8,
    minHeight: 12,
  },
  sectionHeading: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    marginTop: 6,
    marginBottom: 4,
    paddingLeft: 2,
  },
  gridContainer: {
    border: "1px solid #1a1a1a",
    marginBottom: 0,
  },
  gridRow: {
    flexDirection: "row",
    borderBottom: "1px solid #1a1a1a",
  },
  gridCell: {
    borderRight: "1px solid #1a1a1a",
    padding: 3,
    minHeight: 16,
    justifyContent: "center",
  },
  gridText: {
    fontSize: 6.5,
    lineHeight: 1.3,
  },
  signatureSection: {
    marginTop: 8,
  },
  signatureBlock: {
    flexDirection: "row",
    border: "1px solid #1a1a1a",
    minHeight: 42,
    marginBottom: 4,
  },
  signatureImage: {
    height: 38,
    width: "100%",
    objectFit: "contain",
  },
  signatureName: {
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 2,
  },
  signatureDate: {
    fontSize: 6,
    color: "#52525b",
  },
  footer: {
    marginTop: 8,
    paddingTop: 4,
    borderTop: "1px solid #1a1a1a",
  },
  footerText: {
    fontSize: 7,
    marginBottom: 1,
  },
  empty: {
    fontSize: 7,
    color: "#71717a",
  },
});
