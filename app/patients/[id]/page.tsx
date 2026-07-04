import { EditPatientSheet } from "@/components/patients/edit-patient-sheet";
import { ExportButton } from "@/components/patients/export-button";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { PatientCard } from "@/components/patients/patient-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddVisitSheet } from "@/components/visits/add-visit-sheet";
import { VisitTimeline } from "@/components/visits/visit-timeline";
import { createClient } from "@/lib/supabase/server";
import type { Patient } from "@/types";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ "add-visit"?: string }>;
}

export async function generateMetadata({
  params,
}: PatientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("name")
    .eq("id", id)
    .single();
  return {
    title: data?.name ?? "Patient",
    description: `View and manage patient records for ${data?.name ?? "this patient"}.`,
  };
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: PatientDetailPageProps) {
  const { id } = await params;
  const { "add-visit": addVisit } = await searchParams;

  const supabase = await createClient();

  // Fetch patient + visit summary in parallel (SSR)
  const [{ data: patient }, { count: visitCount }, { data: lastVisitData }] =
    await Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", id),
      supabase
        .from("visits")
        .select("visit_date")
        .eq("patient_id", id)
        .order("visit_date", { ascending: false })
        .limit(1),
    ]);

  if (!patient) notFound();

  const lastVisitDate = lastVisitData?.[0]?.visit_date ?? null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Link>

      {/* Patient Info Card */}
      <PatientCard
        patient={patient as Patient}
        visitCount={visitCount ?? 0}
        lastVisitDate={lastVisitDate}
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <AddVisitSheet patientId={id} defaultOpen={addVisit === "true"} />
        <EditPatientSheet patient={patient as Patient} />
        <ExportButton patientId={id} patientName={patient.name} />
        <DeletePatientButton patientId={id} patientName={patient.name} />
      </div>

      {/* Tabs: Timeline / Notes */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Visit History</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <VisitTimeline patientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
