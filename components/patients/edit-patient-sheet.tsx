"use client";

import { PatientForm } from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Patient } from "@/types";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditPatientSheetProps {
  patient: Patient;
}

// SRP: slide-over sheet for edit-patient action

export function EditPatientSheet({ patient }: EditPatientSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Patient
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Patient</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <PatientForm
            patient={patient}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
