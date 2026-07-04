import { FollowupList } from "@/components/dashboard/followup-list";
import { RecentVisits } from "@/components/dashboard/recent-visits";
import {
  FollowupListSkeleton,
  RecentVisitsSkeleton,
  StatsCardsSkeleton,
} from "@/components/dashboard/skeletons";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AddPatientSheet } from "@/components/patients/add-patient-sheet";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Fully SSR dashboard — fast initial load, no loading spinners
export default function DashboardPage() {
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              All Patients
            </Button>
          </Link>
          <AddPatientSheet />
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Two-column layout: follow-ups + recent visits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<FollowupListSkeleton />}>
          <FollowupList />
        </Suspense>
        <Suspense fallback={<RecentVisitsSkeleton />}>
          <RecentVisits />
        </Suspense>
      </div>
    </div>
  );
}
