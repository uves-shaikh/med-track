"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PatientWithLastVisit } from "@/types";

const supabase = createClient();

// SRP: global patient search only (used by Cmd+K command palette)
export function useGlobalSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: async (): Promise<PatientWithLastVisit[]> => {
      if (!trimmed) return [];

      const { data, error } = await supabase
        .from("patients_with_last_visit")
        .select("*")
        .or(`name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`)
        .order("last_visit_date", { ascending: false, nullsFirst: false })
        .limit(8);

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: trimmed.length >= 1,
    staleTime: 10_000,
  });
}
