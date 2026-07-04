"use server";

// SRP: Server Actions for cache revalidation — tells Next.js to re-render SSR pages after mutations

import { revalidatePath } from "next/cache";

/**
 * Revalidates the dashboard page so SSR stats cards (total patients, new this month, etc.)
 * reflect the latest data after a client-side mutation.
 */
export async function revalidateDashboard() {
  revalidatePath("/");
}

/**
 * Revalidates both the dashboard and the patients list page.
 * Call this after any patient create/update/delete mutation.
 */
export async function revalidatePatientPages() {
  revalidatePath("/");
  revalidatePath("/patients");
}

/**
 * Revalidates both the dashboard and a specific patient detail page.
 * Call this after any visit or vitals mutation.
 */
export async function revalidateVisitPages(patientId: string) {
  revalidatePath("/");
  revalidatePath(`/patients/${patientId}`);
}
