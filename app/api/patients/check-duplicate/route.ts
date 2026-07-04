import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// SRP: checks for duplicate patients by phone or name+age

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const phone = searchParams.get("phone");
  const name = searchParams.get("name");
  const age = searchParams.get("age");

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Primary check: phone number (exact)
  const { data: byPhone } = await supabase
    .from("patients")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (byPhone) {
    return NextResponse.json({
      isDuplicate: true,
      existingPatient: byPhone,
      matchType: "phone",
    });
  }

  // Secondary check: name + age combination
  if (name && age) {
    const { data: byNameAge } = await supabase
      .from("patients")
      .select("*")
      .ilike("name", name)
      .eq("age", parseInt(age, 10))
      .maybeSingle();

    if (byNameAge) {
      return NextResponse.json({
        isDuplicate: true,
        existingPatient: byNameAge,
        matchType: "name_age",
      });
    }
  }

  return NextResponse.json({
    isDuplicate: false,
    existingPatient: null,
    matchType: null,
  });
}
