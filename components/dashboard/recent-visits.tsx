import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Clock, CalendarX } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// SRP: recently added visits — SSR

const visitTypeColors: Record<string, string> = {
  checkup:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  followup:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  emergency:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
  vaccination:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  procedure:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  other: "bg-muted text-muted-foreground border-border",
};

export async function RecentVisits() {
  const supabase = await createClient();

  let visits: any[] = [];
  try {
    const { data } = await supabase
      .from("visits")
      .select(
        "id, visit_date, visit_type, chief_complaint, patient_id, patients(name)",
      )
      .order("visit_date", { ascending: false })
      .limit(6);
    visits = data ?? [];
  } catch {
    // Supabase not configured yet
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Visits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CalendarX className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No visits yet</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {visits.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/patients/${v.patient_id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {v.patients?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {v.patients?.name || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                        {v.chief_complaint || "No complaint noted"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {v.visit_type && (
                      <Badge
                        variant="outline"
                        className={`capitalize text-[9px] py-0 h-4 px-1.5 ${visitTypeColors[v.visit_type] || visitTypeColors.other}`}
                      >
                        {v.visit_type}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground/60">
                      {formatDistanceToNow(new Date(v.visit_date), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
