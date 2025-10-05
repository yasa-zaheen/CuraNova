import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface AppointmentEmailRequest {
  appointmentId: string;
  userEmail: string;
}

export async function POST(request: NextRequest) {
  console.log("📧 Appointment email API called");

  try {
    const { appointmentId, userEmail }: AppointmentEmailRequest =
      await request.json();

    if (!appointmentId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: appointmentId, userEmail" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Fetch appointment details with diagnostic information
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        *,
        diagnostic:diagnostics(
          symptom,
          ai_summary,
          hospital
        )
      `
      )
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("❌ Error fetching appointment:", appointmentError);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Format date and time for display
    const appointmentDate = new Date(
      appointment.appointment_date
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Confirmation - CuraNova</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
            .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .diagnostic-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .status { display: inline-block; background-color: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #1f2937; margin-top: 0; }
            h3 { color: #374151; margin-top: 0; }
            .highlight { color: #2563eb; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 CuraNova</h1>
            <p>Your Healthcare Companion</p>
          </div>
          
          <div class="content">
            <h2>✅ Appointment Confirmed!</h2>
            <p>Dear Patient,</p>
            <p>Your appointment has been successfully confirmed. We look forward to providing you with excellent healthcare service.</p>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointment.appointment_time}</p>
              <p><strong>Status:</strong> <span class="status">Confirmed</span></p>
              ${
                appointment.diagnostic?.hospital
                  ? `<p><strong>Location:</strong> ${appointment.diagnostic.hospital}</p>`
                  : ""
              }
              <p><strong>Appointment ID:</strong> ${appointment.id}</p>
            </div>

            ${
              appointment.diagnostic
                ? `
            <div class="diagnostic-info">
              <h3>🔬 Diagnostic Information</h3>
              ${
                appointment.diagnostic.symptom
                  ? `<p><strong>Symptoms:</strong> ${appointment.diagnostic.symptom}</p>`
                  : ""
              }
              ${
                appointment.diagnostic.recommended_test
                  ? `<p><strong>Recommended Test:</strong> ${appointment.diagnostic.recommended_test}</p>`
                  : ""
              }
              ${
                appointment.diagnostic.ai_summary
                  ? `
                <p><strong>AI Analysis Summary:</strong></p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${appointment.diagnostic.ai_summary}
                </div>
              `
                  : ""
              }
            </div>
            `
                : ""
            }

            <h3>📋 What to Expect</h3>
            <ul>
              <li>Please arrive <strong>15 minutes early</strong> for check-in</li>
              <li>Bring a valid photo ID and insurance card</li>
              <li>Wear comfortable clothing</li>
              <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>

            <h3>📞 Need Help?</h3>
            <p>If you have any questions or need to make changes to your appointment, please don't hesitate to contact us:</p>
            <ul>
              <li><strong>Phone:</strong> (555) 123-CURA</li>
              <li><strong>Email:</strong> appointments@curanova.com</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>CuraNova Healthcare</strong></p>
            <p>Revolutionizing Healthcare with AI-Powered Diagnostics</p>
            <p style="font-size: 12px; margin-top: 15px;">
              This is an automated confirmation email. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    console.log("📧 Sending confirmation email to:", userEmail);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "CuraNova <noreply@resend.dev>", // Using resend.dev domain for development
      to: [userEmail],
      subject: `Appointment Confirmed - ${appointmentDate} at ${appointment.appointment_time}`,
      html: htmlContent,
      text: `
        CuraNova - Appointment Confirmation
        
        Your appointment has been confirmed!
        
        Date: ${appointmentDate}
        Time: ${appointment.appointment_time}
        Status: Confirmed
        Appointment ID: ${appointment.id}
        ${
          appointment.diagnostic?.hospital
            ? `Location: ${appointment.diagnostic.hospital}`
            : ""
        }
        
        ${
          appointment.diagnostic?.symptom
            ? `Symptoms: ${appointment.diagnostic.symptom}`
            : ""
        }
        
        Please arrive 15 minutes early for check-in.
        
        Need help? Contact us at (555) 123-CURA or appointments@curanova.com
        
        CuraNova Healthcare - Revolutionizing Healthcare with AI
      `,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send confirmation email", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Appointment confirmation email sent:", data);

    return NextResponse.json({
      success: true,
      message: "Appointment confirmation email sent successfully",
      emailId: data?.id,
    });
  } catch (error) {
    console.error("❌ Error in send-appointment-email API:", error);
    return NextResponse.json(
      {
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
