export type Gender = "male" | "female" | "other";
export type VisitType =
  | "checkup"
  | "followup"
  | "emergency"
  | "vaccination"
  | "procedure"
  | "other";
export type BloodSugarType = "Fasting" | "Random" | "Postprandial";
// ─── Patient ────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  allergies: string[];
  chronic_conditions: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Patient with aggregated visit data (from the DB view)
export interface PatientWithLastVisit extends Patient {
  last_visit_date: string | null;
  visit_count: number;
}

// ─── Visit ──────────────────────────────────────────────────
export interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  visit_type: VisitType;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  diagnosis: string | null;
  prescription: string | null;
  clinical_notes: string | null;
  charge: number;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Visit with its vitals record included
export interface VisitWithVitals extends Visit {
  vitals: Vitals | null;
}

// ─── Vitals ─────────────────────────────────────────────────
export interface Vitals {
  id: string;
  visit_id: string;
  blood_pressure: string | null;
  heart_rate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  oxygen_sat: number | null;
  respiratory_rate: number | null;
  blood_sugar: number | null;
  blood_sugar_type: BloodSugarType | null;
  notes: string | null;
  recorded_at: string;
}

// ─── Utility types ──────────────────────────────────────────
export type CreatePatient = Omit<Patient, "id" | "created_at" | "updated_at">;
export type UpdatePatient = Partial<CreatePatient>;

export type CreateVisit = Omit<Visit, "id" | "created_at" | "updated_at"> & {
  visit_date?: string;
  history_of_present_illness?: string | null;
};
export type UpdateVisit = Partial<Omit<CreateVisit, "patient_id">>;

export type CreateVitals = Omit<Vitals, "id" | "recorded_at">;
export type UpdateVitals = Partial<Omit<CreateVitals, "visit_id">>;

// ─── Duplicate check ────────────────────────────────────────
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingPatient: Patient | null;
  matchType: "phone" | "name_age" | null;
}
