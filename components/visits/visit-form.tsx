"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  combinedVisitSchema,
  type CombinedVisitFormValues,
} from "@/lib/validations/visit-schema";
import { useCreateVisit } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, User, FileText, Activity, CalendarCheck } from "lucide-react";

interface VisitFormProps {
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VisitForm({ patientId, onSuccess, onCancel }: VisitFormProps) {
  const createVisit = useCreateVisit(patientId);

  const form = useForm<CombinedVisitFormValues>({
    resolver: zodResolver(combinedVisitSchema),
    defaultValues: {
      visit_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      visit_type: "checkup",
      charge: 80, // Based on user request default
      chief_complaint: "",
      history_of_present_illness: "",
      clinical_notes: "",
      diagnosis: "",
      prescription: "",
      weight: null,
      height: null,
      temperature: null,
      heart_rate: null,
      respiratory_rate: null,
      bp_systolic: null,
      bp_diastolic: null,
      oxygen_sat: null,
      blood_sugar: null,
      blood_sugar_type: "",
      follow_up_date: "",
      follow_up_notes: "",
    },
  });

  async function onSubmit(values: CombinedVisitFormValues) {
    createVisit.mutate(values, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  }

  // A helper component for section headers
  const SectionHeader = ({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: any;
  }) => (
    <div className="flex items-center gap-2 pb-2 mb-4 border-b border-border text-primary font-medium">
      <Icon className="w-4 h-4" />
      <h3 className="text-sm">{title}</h3>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-4">
      {/* SECTION 1: Visit Details */}
      <section>
        <SectionHeader title="Visit Details" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="visit_date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="visit_date"
              type="datetime-local"
              {...form.register("visit_date")}
            />
            {form.formState.errors.visit_date && (
              <p className="text-xs text-destructive">
                {form.formState.errors.visit_date.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("visit_type")}
              onValueChange={(v) => form.setValue("visit_type", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">Checkup</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.visit_type && (
              <p className="text-xs text-destructive">
                {form.formState.errors.visit_type.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="charge">Fees (₹)</Label>
            <Input
              id="charge"
              type="number"
              step="1"
              {...form.register("charge", { valueAsNumber: true })}
            />
            {form.formState.errors.charge && (
              <p className="text-xs text-destructive">
                {form.formState.errors.charge.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Medical Notes */}
      <section>
        <SectionHeader title="Medical Notes" icon={FileText} />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="chief_complaint">
              Chief Complaint <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="chief_complaint"
              placeholder="Patient's main complaint..."
              rows={2}
              {...form.register("chief_complaint")}
            />
            {form.formState.errors.chief_complaint && (
              <p className="text-xs text-destructive">
                {form.formState.errors.chief_complaint.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="history_of_present_illness">
              History of Present Illness
            </Label>
            <Textarea
              id="history_of_present_illness"
              placeholder="History..."
              rows={2}
              {...form.register("history_of_present_illness")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clinical_notes">Clinical Notes</Label>
            <Textarea
              id="clinical_notes"
              placeholder="Clinical notes..."
              rows={3}
              {...form.register("clinical_notes")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="Working diagnosis..."
              {...form.register("diagnosis")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prescription">Prescription / Treatment</Label>
            <Textarea
              id="prescription"
              placeholder="Medications and instructions..."
              rows={2}
              {...form.register("prescription")}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Vitals */}
      <section>
        <SectionHeader title="Vitals" icon={Activity} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="weight" className="whitespace-nowrap">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70"
              {...form.register("weight", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height" className="whitespace-nowrap">
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              placeholder="170"
              {...form.register("height", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temperature" className="whitespace-nowrap">
              Temp (°C)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="37.0"
              {...form.register("temperature", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="heart_rate" className="whitespace-nowrap">
              Pulse (bpm)
            </Label>
            <Input
              id="heart_rate"
              type="number"
              placeholder="72"
              {...form.register("heart_rate", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="respiratory_rate" className="whitespace-nowrap">
              Resp. Rate
            </Label>
            <Input
              id="respiratory_rate"
              type="number"
              placeholder="16"
              {...form.register("respiratory_rate", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp_systolic" className="whitespace-nowrap">
              BP Systolic
            </Label>
            <Input
              id="bp_systolic"
              type="number"
              placeholder="120"
              {...form.register("bp_systolic", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp_diastolic" className="whitespace-nowrap">
              BP Diastolic
            </Label>
            <Input
              id="bp_diastolic"
              type="number"
              placeholder="80"
              {...form.register("bp_diastolic", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oxygen_sat" className="whitespace-nowrap">
              SpO2 (%)
            </Label>
            <Input
              id="oxygen_sat"
              type="number"
              placeholder="98"
              {...form.register("oxygen_sat", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-3 md:col-span-4">
            <Label htmlFor="blood_sugar" className="whitespace-nowrap">
              Blood Sugar
            </Label>
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
              <Input
                id="blood_sugar"
                type="number"
                placeholder="Value (e.g. 100)"
                className="flex-1 w-full"
                {...form.register("blood_sugar", { valueAsNumber: true })}
              />
              <Select
                value={form.watch("blood_sugar_type") || ""}
                onValueChange={(v) =>
                  form.setValue("blood_sugar_type", v as any)
                }
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sugar Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fasting">Fasting</SelectItem>
                  <SelectItem value="Random">Random</SelectItem>
                  <SelectItem value="Postprandial">PP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Follow-up */}
      <section>
        <SectionHeader title="Follow-up" icon={CalendarCheck} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              {...form.register("follow_up_date")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
            <Input
              id="follow_up_notes"
              placeholder="Notes..."
              {...form.register("follow_up_notes")}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createVisit.isPending}>
          {createVisit.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Visit
        </Button>
      </div>
    </form>
  );
}
