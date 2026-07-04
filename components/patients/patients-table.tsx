"use client";

import { PatientsSearch } from "@/components/patients/patients-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatients } from "@/hooks/use-patients";
import type { PatientWithLastVisit } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, PlusCircle, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PAGE_SIZE = 15;

// SRP: renders the patients data table with pagination

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data: patients = [], isLoading } = usePatients(search);

  // Client-side pagination
  const totalPages = Math.ceil(patients.length / PAGE_SIZE);
  const paginated = patients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleRowClick(patient: PatientWithLastVisit) {
    router.push(`/patients/${patient.id}`);
  }

  function handleAddVisit(e: React.MouseEvent, patientId: string) {
    e.stopPropagation();
    router.push(`/patients/${patientId}?add-visit=true`);
  }

  const genderColor = {
    male: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    female: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <PatientsSearch
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Patient</TableHead>
              <TableHead className="font-semibold">Age</TableHead>
              <TableHead className="font-semibold">Gender</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Last Visit</TableHead>
              <TableHead className="font-semibold">Visits</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <UserRound className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  {search
                    ? `No patients matching "${search}"`
                    : "No patients yet. Add your first patient."}
                </TableCell>
              </TableRow>
            )}

            {paginated.map((patient) => (
              <TableRow
                key={patient.id}
                onClick={() => handleRowClick(patient)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${genderColor[patient.gender]}`}
                  >
                    {patient.gender}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.phone}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {patient.last_visit_date ? (
                    formatDistanceToNow(new Date(patient.last_visit_date), {
                      addSuffix: true,
                    })
                  ) : (
                    <span className="text-muted-foreground/50">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {patient.visit_count}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                    onClick={(e) => handleAddVisit(e, patient.id)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Visit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, patients.length)} of {patients.length}{" "}
            patients
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
