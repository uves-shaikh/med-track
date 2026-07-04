import { z } from "zod";

// SRP: Visit and Vitals validation schemas only

export const visitSchema = z.object({
  visit_type: z.enum([
    "checkup",
    "followup",
    "emergency",
    "vaccination",
    "procedure",
    "other",
  ]),
  chief_complaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Chief complaint is too long"),

  diagnosis: z
    .string()
    .max(1000, "Diagnosis is too long")
    .optional()
    .or(z.literal("")),

  prescription: z
    .string()
    .max(2000, "Prescription is too long")
    .optional()
    .or(z.literal("")),

  clinical_notes: z
    .string()
    .max(5000, "Clinical notes are too long")
    .optional()
    .or(z.literal("")),

  charge: z
    .number({ message: "Must be a number" })
    .min(0, "Charge cannot be negative"),

  follow_up_date: z.string().optional().or(z.literal("")),

  follow_up_notes: z
    .string()
    .max(500, "Follow-up notes are too long")
    .optional()
    .or(z.literal("")),
});

export type VisitFormValues = z.infer<typeof visitSchema>;

// ─── Vitals ─────────────────────────────────────────────────
// Zod v4: use `message` param, not `invalid_type_error`
export const vitalsSchema = z.object({
  blood_pressure: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/, "Format: 120/80")
    .optional()
    .or(z.literal("")),

  heart_rate: z
    .number({ message: "Must be a number" })
    .int()
    .min(20, "Too low")
    .max(300, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  temperature: z
    .number({ message: "Must be a number" })
    .min(30, "Too low")
    .max(45, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  weight: z
    .number({ message: "Must be a number" })
    .min(0.5, "Too low")
    .max(500, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  height: z
    .number({ message: "Must be a number" })
    .min(30, "Too low")
    .max(300, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  oxygen_sat: z
    .number({ message: "Must be a number" })
    .int()
    .min(0)
    .max(100)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  respiratory_rate: z
    .number({ message: "Must be a number" })
    .int()
    .min(5, "Too low")
    .max(100, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  blood_sugar: z
    .number({ message: "Must be a number" })
    .min(10, "Too low")
    .max(1000, "Too high")
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),

  blood_sugar_type: z
    .enum(["Fasting", "Random", "Postprandial"])
    .optional()
    .nullable()
    .or(z.literal("")),

  notes: z.string().max(500).optional().or(z.literal("")),
});

export type VitalsFormValues = z.infer<typeof vitalsSchema>;

// ─── Combined Visit & Vitals (For Create Form) ──────────────
export const combinedVisitSchema = z.object({
  // Section 1: Visit Details
  visit_date: z.string().min(1, "Date is required"),
  visit_type: z.enum([
    "checkup",
    "followup",
    "emergency",
    "vaccination",
    "procedure",
    "other",
  ]),
  charge: z
    .number({ message: "Must be a number" })
    .min(0, "Charge cannot be negative"),

  // Section 2: Medical Notes
  chief_complaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Chief complaint is too long"),
  history_of_present_illness: z
    .string()
    .max(1000, "Too long")
    .optional()
    .or(z.literal("")),
  clinical_notes: z
    .string()
    .max(5000, "Clinical notes are too long")
    .optional()
    .or(z.literal("")),
  diagnosis: z
    .string()
    .max(1000, "Diagnosis is too long")
    .optional()
    .or(z.literal("")),
  prescription: z
    .string()
    .max(2000, "Prescription is too long")
    .optional()
    .or(z.literal("")),

  // Section 3: Vitals
  weight: z
    .number({ message: "Must be a number" })
    .min(0.5)
    .max(500)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  height: z
    .number({ message: "Must be a number" })
    .min(30)
    .max(300)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  temperature: z
    .number({ message: "Must be a number" })
    .min(30)
    .max(45)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  heart_rate: z
    .number({ message: "Must be a number" })
    .int()
    .min(20)
    .max(300)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  respiratory_rate: z
    .number({ message: "Must be a number" })
    .int()
    .min(5)
    .max(100)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  bp_systolic: z
    .number({ message: "Must be a number" })
    .int()
    .min(50)
    .max(300)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  bp_diastolic: z
    .number({ message: "Must be a number" })
    .int()
    .min(30)
    .max(200)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  oxygen_sat: z
    .number({ message: "Must be a number" })
    .int()
    .min(0)
    .max(100)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  blood_sugar: z
    .number({ message: "Must be a number" })
    .min(10)
    .max(1000)
    .optional()
    .nullable()
    .or(z.nan().transform(() => null)),
  blood_sugar_type: z
    .enum(["Fasting", "Random", "Postprandial"])
    .optional()
    .nullable()
    .or(z.literal("")),

  // Section 4: Follow-up
  follow_up_date: z.string().optional().or(z.literal("")),
  follow_up_notes: z.string().max(500).optional().or(z.literal("")),
});

export type CombinedVisitFormValues = z.infer<typeof combinedVisitSchema>;
