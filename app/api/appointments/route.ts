import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface AppointmentRequest {
  userId: string;
  diagnosticId: string;
  preferredDate?: string;
  preferredTime?: string;
}

export async function POST(request: NextRequest) {
  console.log("📅 Appointment booking API called");
  try {
    const body: AppointmentRequest = await request.json();
    console.log("📝 Received appointment request:", body);

    // Validate required fields
    const { userId, diagnosticId } = body;

    if (!userId || !diagnosticId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, diagnosticId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Create appointment record
    const appointmentData = {
      user_id: userId,
      diagnostic_id: diagnosticId,
      appointment_date:
        body.preferredDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      appointment_time: body.preferredTime || "09:00 AM",
      status: "scheduled",
    };

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      console.error("Supabase appointment error:", appointmentError);

      // If appointments table doesn't exist, just log the request for now
      if (appointmentError.code === "42P01") {
        console.log(
          "Appointments table not found. Logging appointment request:",
          appointmentData
        );
        return NextResponse.json({
          message: "Appointment request logged successfully",
          appointmentData,
          note: "Appointments table will be created in the next update",
        });
      }

      return NextResponse.json(
        {
          error: "Failed to create appointment",
          details: appointmentError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Appointment created:", appointment);

    return NextResponse.json({
      message: "Appointment request submitted successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      {
        error: "Failed to process appointment request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
