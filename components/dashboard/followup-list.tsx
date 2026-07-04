import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Phone } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// SRP: renders today's follow-up list — SSR

export async function FollowupList() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let followups: any[] = [];
  try {
    const { data } = await supabase
      .from("visits")
      .select(
        "id, follow_up_notes, follow_up_date, patients(id, name, phone, age, gender)",
      )
      .eq("follow_up_date", today)
      .order("created_at", { ascending: true })
      .limit(10);
    followups = data ?? [];
  } catch {
    // Supabase not configured yet
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-amber-500" />
            Today&apos;s Follow-ups
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {format(new Date(), "dd MMM")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {followups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No follow-ups scheduled for today. 🎉
          </p>
        ) : (
          <ul className="space-y-2">
            {followups.map((f) => {
              const patient = Array.isArray(f.patients)
                ? f.patients[0]
                : f.patients;
              if (!patient) return null;
              return (
                <li key={f.id}>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      {f.follow_up_notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {f.follow_up_notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
