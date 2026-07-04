"use client";

import { DuplicateAlertDialog } from "@/components/patients/duplicate-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import {
  patientSchema,
  type PatientFormValues,
} from "@/lib/validations/patient-schema";
import type { Patient } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface PatientFormProps {
  patient?: Patient; // If provided, form is in edit mode
  onSuccess?: (patient: Patient) => void;
  onCancel?: () => void;
}

// SRP: renders and submits the patient add/edit form only

export function PatientForm({
  patient,
  onSuccess,
  onCancel,
}: PatientFormProps) {
  const isEditing = !!patient;
  const [duplicateData, setDuplicateData] = useState<Patient | null>(null);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient(patient?.id ?? "");

  const isPending = createPatient.isPending || updatePatient.isPending;

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient?.name ?? "",
      age: patient?.age ?? ("" as unknown as number),
      gender: patient?.gender ?? "male",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      address: patient?.address ?? "",
      emergency_contact: patient?.emergency_contact ?? "",
      allergies: patient?.allergies ?? [],
      chronic_conditions: patient?.chronic_conditions ?? [],
      notes: patient?.notes ?? "",
    },
  });

  const allergies = form.watch("allergies");
  const conditions = form.watch("chronic_conditions");

  // Check for duplicates before saving a new patient
  async function checkDuplicate(
    phone: string,
    name: string,
    age: number,
  ): Promise<Patient | null> {
    try {
      const res = await fetch(
        `/api/patients/check-duplicate?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&age=${age}`,
      );
      const data = await res.json();
      return data.existingPatient ?? null;
    } catch {
      return null;
    }
  }

  async function onSubmit(values: PatientFormValues) {
    // Deduplication check (skip in edit mode)
    if (!isEditing) {
      const duplicate = await checkDuplicate(
        values.phone,
        values.name,
        values.age,
      );
      if (duplicate) {
        setDuplicateData(duplicate);
        return;
      }
    }

    const payload = {
      ...values,
      email: values.email || null,
      address: values.address || null,
      emergency_contact: values.emergency_contact || null,
      notes: values.notes || null,
    };

    if (isEditing) {
      updatePatient.mutate(payload, {
        onSuccess: (data) => onSuccess?.(data),
      });
    } else {
      createPatient.mutate(payload, {
        onSuccess: (data) => onSuccess?.(data),
      });
    }
  }

  function addTag(field: "allergies" | "chronic_conditions", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = form.getValues(field);
    if (!current.includes(trimmed)) {
      form.setValue(field, [...current, trimmed]);
    }
    if (field === "allergies") setAllergyInput("");
    else setConditionInput("");
  }

  function removeTag(field: "allergies" | "chronic_conditions", tag: string) {
    form.setValue(
      field,
      form.getValues(field).filter((t) => t !== tag),
    );
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Required fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Amina Khan"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age">
              Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="e.g. 35"
              {...form.register("age", { valueAsNumber: true })}
            />
            {form.formState.errors.age && (
              <p className="text-xs text-destructive">
                {form.formState.errors.age.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label>
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("gender")}
              onValueChange={(v) =>
                form.setValue("gender", v as "male" | "female" | "other")
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.gender && (
              <p className="text-xs text-destructive">
                {form.formState.errors.gender.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="e.g. +92 300 1234567"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Optional fields */}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Optional Details
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="patient@email.com"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact">Emergency Contact</Label>
            <Input
              id="emergency_contact"
              placeholder="Name & phone"
              {...form.register("emergency_contact")}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street, City"
              {...form.register("address")}
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <Label>Allergies</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Penicillin"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("allergies", allergyInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag("allergies", allergyInput)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergies.map((a) => (
                <Badge
                  key={a}
                  variant="destructive"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeTag("allergies", a)}
                >
                  {a} <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Chronic Conditions */}
        <div className="space-y-2">
          <Label>Chronic Conditions</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Diabetes Type 2"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("chronic_conditions", conditionInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag("chronic_conditions", conditionInput)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {conditions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {conditions.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeTag("chronic_conditions", c)}
                >
                  {c} <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes…"
            rows={3}
            {...form.register("notes")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Add Patient"}
          </Button>
        </div>
      </form>

      {/* Duplicate alert */}
      <DuplicateAlertDialog
        open={!!duplicateData}
        existingPatient={duplicateData}
        onOpenChange={(open) => {
          if (!open) setDuplicateData(null);
        }}
      />
    </>
  );
}
