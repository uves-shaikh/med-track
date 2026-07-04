import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Users, CalendarCheck, Activity, UserPlus } from "lucide-react";
import { format, startOfMonth } from "date-fns";

// SRP: renders summary metric cards — SSR only, no client state

export async function StatsCards() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  let totalPatients = 0;
  let todayFollowUps = 0;
  let monthVisits = 0;
  let newThisMonth = 0;

  try {
    const [r1, r2, r3, r4] = await Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }),
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("follow_up_date", today),
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .gte("visit_date", monthStart),
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart),
    ]);
    totalPatients = r1.count ?? 0;
    todayFollowUps = r2.count ?? 0;
    monthVisits = r3.count ?? 0;
    newThisMonth = r4.count ?? 0;
  } catch {
    // Supabase not configured — show zeros
  }

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Today's Follow-ups",
      value: todayFollowUps,
      icon: CalendarCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Visits This Month",
      value: monthVisits,
      icon: Activity,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "New Patients (Month)",
      value: newThisMonth,
      icon: UserPlus,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
