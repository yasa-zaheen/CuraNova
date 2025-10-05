import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkUserId = searchParams.get("clerkUserId");

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "clerkUserId parameter is required" },
        { status: 400 }
      );
    }

    console.log("👤 Fetching user data for:", clerkUserId);

    const supabase = createSupabaseServerClient();

    // Fetch user data from Supabase
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        first_name,
        last_name,
        email,
        phone_number,
        street_address,
        city,
        state,
        zip_code,
        insurance_provider,
        insurance_id,
        group_number
      `
      )
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      console.error("❌ Error fetching user data:", error);

      // If user not found, return empty data structure
      if (
        error.code === "PGRST116" ||
        error.message?.includes("No rows returned")
      ) {
        console.log("📝 User not found in database, returning empty data");
        return NextResponse.json({
          userData: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dob: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            insuranceProvider: "",
            insuranceId: "",
            groupNumber: "",
          },
          userExists: false,
        });
      }

      return NextResponse.json(
        {
          error: "Failed to fetch user data",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ User data fetched successfully");

    // Map Supabase fields to MedicalInfo structure
    const userData = {
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      email: data.email || "",
      phone: data.phone_number || "",
      dob: "", // We don't store DOB in users table currently
      street: data.street_address || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip_code || "",
      insuranceProvider: data.insurance_provider || "",
      insuranceId: data.insurance_id || "",
      groupNumber: data.group_number || "",
    };

    return NextResponse.json({
      userData,
      userExists: true,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
