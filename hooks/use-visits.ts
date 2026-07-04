"use client";

import { revalidateVisitPages } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type { CombinedVisitFormValues } from "@/lib/validations/visit-schema";
import type { UpdateVisit, VisitWithVitals } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────
export const visitKeys = {
  all: ["visits"] as const,
  byPatient: (patientId: string) =>
    [...visitKeys.all, "patient", patientId] as const,
  detail: (id: string) => [...visitKeys.all, "detail", id] as const,
};

// ─── Fetch visits for a patient ──────────────────────────────
export function useVisits(patientId: string) {
  return useQuery({
    queryKey: visitKeys.byPatient(patientId),
    queryFn: async (): Promise<VisitWithVitals[]> => {
      const { data, error } = await supabase
        .from("visits")
        .select("*, vitals(*)")
        .eq("patient_id", patientId)
        .order("visit_date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map((v) => ({
        ...v,
        vitals: Array.isArray(v.vitals) ? (v.vitals[0] ?? null) : v.vitals,
      }));
    },
    enabled: !!patientId,
    staleTime: 30_000,
  });
}

// ─── Create visit ────────────────────────────────────────────
export function useCreateVisit(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CombinedVisitFormValues) => {
      // 1. Prepare and insert Visit
      const visitData = {
        patient_id: patientId,
        visit_date: new Date(payload.visit_date).toISOString(),
        visit_type: payload.visit_type,
        charge: payload.charge,
        chief_complaint: payload.chief_complaint || null,
        history_of_present_illness: payload.history_of_present_illness || null,
        clinical_notes: payload.clinical_notes || null,
        diagnosis: payload.diagnosis || null,
        prescription: payload.prescription || null,
        follow_up_date: payload.follow_up_date || null,
        follow_up_notes: payload.follow_up_notes || null,
      };

      const { data: createdVisit, error: visitError } = await supabase
        .from("visits")
        .insert(visitData)
        .select()
        .single();

      if (visitError) throw new Error(visitError.message);

      // 2. Prepare and insert Vitals (if any exist)
      const blood_pressure =
        payload.bp_systolic && payload.bp_diastolic
          ? `${payload.bp_systolic}/${payload.bp_diastolic}`
          : null;

      const hasVitals =
        blood_pressure ||
        payload.weight ||
        payload.height ||
        payload.temperature ||
        payload.heart_rate ||
        payload.respiratory_rate ||
        payload.oxygen_sat ||
        payload.blood_sugar;

      if (hasVitals) {
        const vitalsData = {
          visit_id: createdVisit.id,
          blood_pressure,
          weight: payload.weight ?? null,
          height: payload.height ?? null,
          temperature: payload.temperature ?? null,
          heart_rate: payload.heart_rate ?? null,
          respiratory_rate: payload.respiratory_rate ?? null,
          oxygen_sat: payload.oxygen_sat ?? null,
          blood_sugar: payload.blood_sugar ?? null,
          blood_sugar_type: payload.blood_sugar_type || null,
        };

        const { error: vitalsError } = await supabase
          .from("vitals")
          .insert(vitalsData);

        if (vitalsError) {
          console.error("Failed to save vitals. Please try again.");
        }
      }

      return createdVisit;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: visitKeys.byPatient(patientId),
      });
      // Also refresh the patient list so last_visit_date updates
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      await revalidateVisitPages(patientId);
      toast.success("Visit recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save visit. Please try again.`);
    },
  });
}

// ─── Update visit ────────────────────────────────────────────
export function useUpdateVisit(patientId: string, visitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateVisit) => {
      const { data, error } = await supabase
        .from("visits")
        .update(updates)
        .eq("id", visitId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: visitKeys.byPatient(patientId),
      });
      await revalidateVisitPages(patientId);
      toast.success("Visit updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update visit. Please try again.`);
    },
  });
}

// ─── Fetch today's follow-ups (for dashboard) ────────────────
export function useTodayFollowUps() {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["visits", "followups", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("*, patients(id, name, phone)")
        .eq("follow_up_date", today)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
