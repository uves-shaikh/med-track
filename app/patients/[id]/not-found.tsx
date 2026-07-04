// SRP: renders a styled "patient not found" UI within the patient detail route segment

import { Button } from "@/components/ui/button";
import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";

export default function PatientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <UserX className="h-10 w-10 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Patient Not Found</h1>
        <p className="text-muted-foreground max-w-sm">
          We couldn&apos;t find a patient with that ID. They may have been
          deleted, or the link might be incorrect.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
