import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VisitWithVitals } from "@/types";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  CalendarCheck,
  Heart,
  Thermometer,
  Activity,
  Scale,
  Wind,
  Droplet,
} from "lucide-react";

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

interface VisitCardProps {
  visit: VisitWithVitals;
}

// SRP: displays a single visit's data — no actions

export function VisitCard({ visit }: VisitCardProps) {
  const vitals = visit.vitals;
  const bmi =
    vitals?.weight && vitals?.height
      ? (vitals.weight / Math.pow(vitals.height / 100, 2)).toFixed(1)
      : null;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        {/* Visit header */}
        <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                {format(new Date(visit.visit_date), "dd MMM yyyy, h:mm a")}
              </span>
            </div>
            {visit.visit_type && (
              <Badge
                variant="outline"
                className={`capitalize text-[10px] py-0 h-5 ${visitTypeColors[visit.visit_type] || visitTypeColors.other}`}
              >
                {visit.visit_type}
              </Badge>
            )}
          </div>
          {visit.follow_up_date && (
            <Badge variant="outline" className="gap-1 text-xs">
              <CalendarCheck className="h-3 w-3" />
              Follow-up: {format(new Date(visit.follow_up_date), "dd MMM yyyy")}
            </Badge>
          )}
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Chief complaint */}
          {visit.chief_complaint && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Chief Complaint
              </p>
              <p className="text-sm">{visit.chief_complaint}</p>
            </div>
          )}

          {/* HPI */}
          {visit.history_of_present_illness && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                History of Present Illness
              </p>
              <p className="text-sm">{visit.history_of_present_illness}</p>
            </div>
          )}

          {/* Diagnosis */}
          {visit.diagnosis && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Diagnosis
                </p>
              </div>
              <p className="text-sm">{visit.diagnosis}</p>
            </div>
          )}

          {/* Prescription */}
          {visit.prescription && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prescription
                </p>
              </div>
              <p className="text-sm whitespace-pre-line">
                {visit.prescription}
              </p>
            </div>
          )}

          {/* Clinical Notes */}
          {visit.clinical_notes && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clinical Notes
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {visit.clinical_notes}
              </p>
            </div>
          )}

          {/* Vitals */}
          {vitals && (
            <div className="rounded-lg bg-muted/50 px-3 py-3 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Vitals
              </p>
              <div className="grid grid-cols-3 gap-2">
                {vitals.blood_pressure && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Heart className="h-3.5 w-3.5 text-destructive" />
                    <span>{vitals.blood_pressure}</span>
                  </div>
                )}
                {vitals.heart_rate && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span>{vitals.heart_rate} bpm</span>
                  </div>
                )}
                {vitals.temperature && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                    <span>{vitals.temperature}°C</span>
                  </div>
                )}
                {vitals.oxygen_sat && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xs font-bold text-primary">SpO₂</span>
                    <span>{vitals.oxygen_sat}%</span>
                  </div>
                )}
                {vitals.weight && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vitals.weight} kg</span>
                  </div>
                )}
                {vitals.height && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xs font-bold text-muted-foreground">
                      H
                    </span>
                    <span>{vitals.height} cm</span>
                  </div>
                )}
                {bmi && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xs font-bold text-muted-foreground">
                      BMI
                    </span>
                    <span>{bmi}</span>
                  </div>
                )}
                {vitals.respiratory_rate && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Wind className="h-3.5 w-3.5 text-sky-500" />
                    <span>{vitals.respiratory_rate} rpm</span>
                  </div>
                )}
                {vitals.blood_sugar && (
                  <div className="flex items-center gap-1.5 text-sm col-span-3">
                    <Droplet className="h-3.5 w-3.5 text-rose-500" />
                    <span>
                      {vitals.blood_sugar} mg/dL{" "}
                      {vitals.blood_sugar_type
                        ? `(${vitals.blood_sugar_type})`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
