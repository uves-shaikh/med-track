import { createClient } from "@/lib/supabase/server";

export async function PatientCount() {
  const supabase = await createClient();
  let count = 0;
  try {
    const { count: c } = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true });
    count = c ?? 0;
  } catch {
    // Supabase not configured yet
  }

  return (
    <p className="text-muted-foreground mt-1">
      {count} patient{count !== 1 ? "s" : ""} registered
    </p>
  );
}
