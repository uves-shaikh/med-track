import { z } from "zod";

// SRP: Patient form validation schema only
export const patientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),

  age: z
    .number({ message: "Age must be a number" })
    .int("Age must be a whole number")
    .min(0, "Age must be positive")
    .max(149, "Age must be under 150"),

  gender: z.enum(["male", "female", "other"], {
    message: "Please select a gender",
  }),

  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),

  email: z.string().email("Invalid email address").optional().or(z.literal("")),

  address: z
    .string()
    .max(300, "Address is too long")
    .optional()
    .or(z.literal("")),

  emergency_contact: z
    .string()
    .max(200, "Emergency contact is too long")
    .optional()
    .or(z.literal("")),

  // Use z.string().array() with no optional so the input type is always string[]
  allergies: z.string().array(),

  chronic_conditions: z.string().array(),

  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
