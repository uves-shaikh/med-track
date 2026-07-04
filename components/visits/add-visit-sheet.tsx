"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisitForm } from "@/components/visits/visit-form";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AddVisitSheetProps {
  patientId: string;
  defaultOpen?: boolean;
}

// SRP: slide-over sheet for the add-visit action

export function AddVisitSheet({
  patientId,
  defaultOpen = false,
}: AddVisitSheetProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Sync with URL param (for quick-visit from patient list)
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Visit
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New Visit</SheetTitle>
          <SheetDescription>
            Record the details for this visit. Vitals can be added in the next
            step.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <VisitForm
            patientId={patientId}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
