"use client";

import { useVisits } from "@/hooks/use-visits";
import { VisitCard } from "@/components/visits/visit-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX } from "lucide-react";

interface VisitTimelineProps {
  patientId: string;
}

// SRP: renders the chronological visit history timeline

export function VisitTimeline({ patientId }: VisitTimelineProps) {
  const { data: visits = [], isLoading } = useVisits(patientId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-border mt-1" />
              {i < 3 && <div className="w-0.5 flex-1 bg-border mt-1" />}
            </div>
            <Skeleton className="h-32 flex-1 mb-4" />
          </div>
        ))}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarX className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No visits recorded yet.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Use the &quot;Add Visit&quot; button to record the first visit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {visits.map((visit, index) => (
        <div key={visit.id} className="flex gap-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-primary ring-2 ring-primary/20 mt-2 shrink-0" />
            {index < visits.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-1 mb-1 min-h-4" />
            )}
          </div>
          {/* Visit card */}
          <div className="flex-1 pb-4">
            <VisitCard visit={visit} />
          </div>
        </div>
      ))}
    </div>
  );
}
