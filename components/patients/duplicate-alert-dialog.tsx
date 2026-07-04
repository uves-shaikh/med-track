"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/types";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface DuplicateAlertDialogProps {
  open: boolean;
  existingPatient: Patient | null;
  onOpenChange: (open: boolean) => void;
}

// SRP: renders the duplicate patient warning dialog only

export function DuplicateAlertDialog({
  open,
  existingPatient,
  onOpenChange,
}: DuplicateAlertDialogProps) {
  const router = useRouter();

  function goToExisting() {
    if (existingPatient) {
      router.push(`/patients/${existingPatient.id}`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>Duplicate Patient Found</DialogTitle>
          </div>
          <DialogDescription>
            A patient with the same phone number or name and age already exists
            in the system.
          </DialogDescription>
        </DialogHeader>

        {existingPatient && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-semibold">{existingPatient.name}</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Age: {existingPatient.age}</span>
              <span>•</span>
              <span className="capitalize">{existingPatient.gender}</span>
              <span>•</span>
              <span>{existingPatient.phone}</span>
            </div>
            {existingPatient.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {existingPatient.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Edit & Try Again
          </Button>
          <Button onClick={goToExisting} className="gap-2">
            Go to Existing Patient
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
