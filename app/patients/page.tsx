import { AddPatientSheet } from "@/components/patients/add-patient-sheet";
import { PatientCount } from "@/components/patients/patient-count";
import { PatientsTable } from "@/components/patients/patients-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Patients",
  description: "Search, view, and manage all patients.",
};

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <Suspense fallback={<Skeleton className="h-5 w-32 mt-1" />}>
            <PatientCount />
          </Suspense>
        </div>
        <AddPatientSheet />
      </div>

      <PatientsTable />
    </div>
  );
}
