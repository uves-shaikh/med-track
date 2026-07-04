"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExportButtonProps {
  patientId: string;
  patientName: string;
}

// SRP: generates and downloads a PDF of the patient's visit history

export function ExportButton({ patientId, patientName }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);
    try {
      const supabase = createClient();

      const [{ data: patient }, { data: visits }] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patientId).single(),
        supabase
          .from("visits")
          .select("*, vitals(*)")
          .eq("patient_id", patientId)
          .order("visit_date", { ascending: false }),
      ]);

      if (!patient) throw new Error("Patient not found");

      // Dynamic import to avoid bloating initial bundle
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(13, 110, 162);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("MedTrack — Patient History", 14, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`,
        14,
        20,
      );

      // Patient details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(patient.name, 14, 38);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Age: ${patient.age}  |  Gender: ${patient.gender}  |  Phone: ${patient.phone}`,
        14,
        46,
      );
      if (patient.email) doc.text(`Email: ${patient.email}`, 14, 53);
      if (patient.allergies?.length) {
        doc.setTextColor(200, 50, 50);
        doc.text(
          `Allergies: ${patient.allergies.join(", ")}`,
          14,
          patient.email ? 60 : 53,
        );
        doc.setTextColor(0, 0, 0);
      }

      // Visits table
      const rows = (visits ?? []).map((v: any) => {
        const vitals = Array.isArray(v.vitals) ? v.vitals[0] : v.vitals;
        return [
          format(new Date(v.visit_date), "dd MMM yyyy"),
          v.chief_complaint ?? "—",
          v.diagnosis ?? "—",
          vitals
            ? [
                vitals.blood_pressure ? `BP: ${vitals.blood_pressure}` : "",
                vitals.heart_rate ? `HR: ${vitals.heart_rate}` : "",
                vitals.temperature ? `Temp: ${vitals.temperature}°C` : "",
              ]
                .filter(Boolean)
                .join(", ") || "—"
            : "—",
          v.follow_up_date
            ? format(new Date(v.follow_up_date), "dd MMM yyyy")
            : "—",
        ];
      });

      autoTable(doc, {
        startY: patient.email ? 68 : 62,
        head: [["Date", "Chief Complaint", "Diagnosis", "Vitals", "Follow-up"]],
        body: rows.length ? rows : [["No visits recorded", "", "", "", ""]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [13, 110, 162],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 246, 250] },
        columnStyles: {
          0: { cellWidth: 28 },
          4: { cellWidth: 28 },
        },
      });

      doc.save(`${patientName.replace(/\s+/g, "_")}_history.pdf`);
      toast.success("PDF exported successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
