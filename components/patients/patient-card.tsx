import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Patient } from "@/types";
import {
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Activity,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface PatientCardProps {
  patient: Patient;
  visitCount?: number;
  lastVisitDate?: string | null;
}

// SRP: displays patient summary info card (no actions)

export function PatientCard({
  patient,
  visitCount,
  lastVisitDate,
}: PatientCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header strip */}
        <div className="bg-primary/8 dark:bg-primary/15 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-sm">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{patient.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground">
                  {patient.age} years old
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-sm capitalize text-muted-foreground">
                  {patient.gender}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-sm text-muted-foreground">
            {visitCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>
                  {visitCount} visit{visitCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {lastVisitDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Last: {format(new Date(lastVisitDate), "dd MMM yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-4">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{patient.address}</span>
            </div>
          )}
          {patient.emergency_contact && (
            <div className="col-span-2 text-sm text-muted-foreground">
              <span className="font-medium">Emergency: </span>
              {patient.emergency_contact}
            </div>
          )}
        </div>

        {/* Tags */}
        {(patient.allergies.length > 0 ||
          patient.chronic_conditions.length > 0) && (
          <div className="border-t border-border px-6 py-3 space-y-2">
            {patient.allergies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-xs font-medium text-destructive mr-1">
                  Allergies:
                </span>
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
            {patient.chronic_conditions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Conditions:
                </span>
                {patient.chronic_conditions.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {patient.notes && (
          <div className="border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">{patient.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
