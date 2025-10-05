"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface Appointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

interface DiagnosticWithAppointments extends Appointment {
  diagnostic: {
    symptom: string;
    ai_summary: string;
    hospital: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AppointmentsPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<
    DiagnosticWithAppointments[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
            *,
            diagnostic:diagnostics(symptom, ai_summary, hospital)
          `
          )
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true });

        if (error) {
          console.error("Error fetching appointments:", error);
        } else {
          setAppointments(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment. Please try again.");
      } else {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
          )
        );
        alert("Appointment cancelled successfully.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      alert(
        "Email address not found. Please ensure your account has a valid email."
      );
      return;
    }

    setConfirmingId(appointmentId);

    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status: "confirmed",
          userEmail: user.emailAddresses[0].emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm appointment");
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "confirmed" } : apt
        )
      );

      // Show success message with better UX
      const successMessage =
        "✅ Appointment confirmed! A confirmation email has been sent to your email address.";

      // Create a temporary toast-like notification
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #10b981; color: white; padding: 16px 24px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px; font-weight: 500; max-width: 400px;
      `;
      notification.textContent = successMessage;
      document.body.appendChild(notification);

      // Remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } catch (error) {
      console.error("Error confirming appointment:", error);

      // Show error message with better UX
      const errorMessage =
        "❌ Failed to confirm appointment. Please try again.";

      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #ef4444; color: white; padding: 16px 24px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px; font-weight: 500; max-width: 400px;
      `;
      notification.textContent = errorMessage;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your scheduled medical appointments
          </p>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Appointments Scheduled
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any appointments scheduled yet. Complete a
              diagnostic test with high-risk results to schedule an appointment
              with a doctor.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => {
              const appointmentDate = new Date(appointment.appointment_date);
              const isUpcoming = appointmentDate > new Date();

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. Sarah Johnson
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">
                            📅 Date & Time
                          </p>
                          <p>
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p>{appointment.appointment_time}</p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            🏥 Related Condition
                          </p>
                          <p>
                            {appointment.diagnostic?.symptom ||
                              "General checkup"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-medium text-gray-900 text-sm">
                          📝 Purpose
                        </p>
                        <p className="text-sm text-gray-600">
                          Follow-up consultation for test results
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {isUpcoming && appointment.status === "scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}

                      {appointment.status === "scheduled" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleConfirmAppointment(appointment.id)
                          }
                          disabled={confirmingId === appointment.id}
                        >
                          {confirmingId === appointment.id
                            ? "Confirming..."
                            : "Confirm"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Diagnostic Summary */}
                  {appointment.diagnostic && (
                    <div className="border-t pt-4 mt-4">
                      <p className="font-medium text-gray-900 text-sm mb-2">
                        🔬 Diagnostic Summary
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.diagnostic.ai_summary}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === "scheduled").length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "confirmed").length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {appointments.filter((a) => a.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter((a) => a.status === "cancelled").length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
