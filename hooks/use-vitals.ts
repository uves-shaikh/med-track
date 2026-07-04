"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CreateVitals, UpdateVitals, Vitals } from "@/types";
import { visitKeys } from "@/hooks/use-visits";

const supabase = createClient();

// SRP: Vitals CRUD mutations only

export function useCreateVitals(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vitals: CreateVitals): Promise<Vitals> => {
      const { data, error } = await supabase
        .from("vitals")
        .insert(vitals)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: visitKeys.byPatient(patientId),
      });
      toast.success("Vitals recorded");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save vitals. Please try again.`);
    },
  });
}

export function useUpdateVitals(patientId: string, vitalsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateVitals): Promise<Vitals> => {
      const { data, error } = await supabase
        .from("vitals")
        .update(updates)
        .eq("id", vitalsId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: visitKeys.byPatient(patientId),
      });
      toast.success("Vitals updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vitals. Please try again.`);
    },
  });
}
