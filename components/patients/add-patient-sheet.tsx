"use client";

import { PatientForm } from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Patient } from "@/types";
import { UserPlus } from "lucide-react";
import { useState } from "react";

// SRP: slide-over sheet that wraps the patient form for the "Add Patient" action

export function AddPatientSheet() {
  const [open, setOpen] = useState(false);

  function handleSuccess(patient: Patient) {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Patient</SheetTitle>
          <SheetDescription>
            Fill in the required fields to register a new patient. Duplicate
            phone numbers will be flagged automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <PatientForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
