"use client";

import { revalidatePatientPages } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type {
  CreatePatient,
  Patient,
  PatientWithLastVisit,
  UpdatePatient,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...patientKeys.lists(), filters] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
};

// ─── Fetch all patients (with last visit date) ───────────────
export function usePatients(search = "") {
  return useQuery({
    queryKey: patientKeys.list({ search }),
    queryFn: async (): Promise<PatientWithLastVisit[]> => {
      let query = supabase
        .from("patients_with_last_visit")
        .select("*")
        .order("last_visit_date", { ascending: false, nullsFirst: false });

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ─── Fetch single patient ────────────────────────────────────
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async (): Promise<Patient> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ─── Create patient ──────────────────────────────────────────
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: CreatePatient): Promise<Patient> => {
      const { data, error } = await supabase
        .from("patients")
        .insert(patient)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      await revalidatePatientPages();
      toast.success(`Patient "${data.name}" added successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add patient. Please try again.`);
    },
  });
}

// ─── Update patient ──────────────────────────────────────────
export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdatePatient): Promise<Patient> => {
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
      await revalidatePatientPages();
      toast.success(`Patient "${data.name}" updated`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update patient. Please try again.`);
    },
  });
}

// ─── Delete patient ──────────────────────────────────────────
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      await revalidatePatientPages();
      toast.success("Patient deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete patient. Please try again.`);
    },
  });
}
