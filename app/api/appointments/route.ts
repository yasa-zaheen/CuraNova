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

export async function PATCH(request: NextRequest) {
  console.log("📝 Appointment update API called");

  try {
    const { appointmentId, status, userEmail } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: appointmentId, status" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Update appointment status
    const { data: appointment, error: updateError } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating appointment:", updateError);
      return NextResponse.json(
        { error: "Failed to update appointment", details: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Appointment updated:", appointment);

    // If confirming appointment and email provided, send confirmation email
    if (status === "confirmed" && userEmail) {
      try {
        const emailResponse = await fetch(
          `${request.nextUrl.origin}/api/send-appointment-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              appointmentId,
              userEmail,
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error("❌ Failed to send confirmation email");
        } else {
          console.log("✅ Confirmation email sent successfully");
        }
      } catch (emailError) {
        console.error("❌ Error sending confirmation email:", emailError);
        // Don't fail the appointment update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    return NextResponse.json(
      {
        error: "Failed to update appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
