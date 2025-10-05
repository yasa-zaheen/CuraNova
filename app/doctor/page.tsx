import { createSupabaseServerClient } from "@/utils/supabase/server";

interface ConfirmedAppointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  // User information
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    insurance_provider?: string;
    insurance_id?: string;
    group_number?: string;
  } | null;
  // Diagnostic information
  diagnostic: {
    symptom: string;
    ai_summary: string;
    hospital: string;
    created_at: string;
  } | null;
}

async function getConfirmedAppointments(): Promise<ConfirmedAppointment[]> {
  try {
    const supabase = createSupabaseServerClient();

    // First check: Get all appointments without joins to see total count
    const { data: simpleAppointments, error: simpleError } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("📋 Simple appointments query:", {
      total: simpleAppointments?.length || 0,
      appointments:
        simpleAppointments?.map((apt) => ({
          id: apt.id,
          status: apt.status,
          user_id: apt.user_id,
          diagnostic_id: apt.diagnostic_id,
          created_at: apt.created_at,
        })) || [],
    });

    // Get all appointments with user and diagnostic details
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        user:users!user_id (
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
        ),
        diagnostic:diagnostics!diagnostic_id (
          symptom,
          ai_summary,
          hospital,
          created_at
        )
      `
      )
      // Temporarily showing ALL appointments to debug
      // .eq("status", "confirmed")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Supabase error fetching confirmed appointments:", error);
      return [];
    }

    console.log("🔍 Doctor Dashboard: Fetched appointments with joins:", {
      total: data?.length || 0,
      appointments: data?.map((apt) => ({
        id: apt.id,
        status: apt.status,
        user_id: apt.user_id,
        diagnostic_id: apt.diagnostic_id,
        user_name: apt.user
          ? `${apt.user.first_name} ${apt.user.last_name}`
          : "No user data",
        has_user_data: !!apt.user,
        has_diagnostic_data: !!apt.diagnostic,
      })),
    });

    return data || [];
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    return [];
  }
}

async function getAppointmentStats() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: allAppointments, error } = await supabase
      .from("appointments")
      .select("status, appointment_date");

    if (error) {
      console.error("Error fetching appointment stats:", error);
      return {
        total: 0,
        confirmed: 0,
        scheduled: 0,
        cancelled: 0,
        todayAppointments: 0,
      };
    }

    console.log("📊 Doctor Dashboard: All appointments by status:", {
      total: allAppointments.length,
      statusBreakdown: allAppointments.reduce(
        (acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    });

    const today = new Date().toISOString().split("T")[0];
    const stats = {
      total: allAppointments.length,
      confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
      scheduled: allAppointments.filter((a) => a.status === "scheduled").length,
      cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
      todayAppointments: allAppointments.filter(
        (a) => a.appointment_date.startsWith(today) && a.status === "confirmed"
      ).length,
    };

    return stats;
  } catch (error) {
    console.error("Error calculating appointment stats:", error);
    return {
      total: 0,
      confirmed: 0,
      scheduled: 0,
      cancelled: 0,
      todayAppointments: 0,
    };
  }
}

export default async function DoctorDashboard() {
  const appointments = await getConfirmedAppointments();
  const stats = await getAppointmentStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              🏥 Doctor CRM Dashboard
            </h1>
            <p className="text-blue-100 mt-2">
              Manage confirmed appointments and patient information
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.scheduled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.todayAppointments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              ✅ Confirmed Appointments
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete patient information and appointment details (
              {appointments.length} confirmed)
            </p>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-xl font-medium text-gray-900 mb-2">
                No confirmed appointments
              </p>
              <p className="text-sm text-gray-600">
                Confirmed appointments will appear here when patients book and
                confirm their slots.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact & Insurance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      {/* Patient Information */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {appointment.user?.first_name?.[0]}
                                {appointment.user?.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.user?.first_name}{" "}
                              {appointment.user?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.user?.email}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              ID: {appointment.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Insurance */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-gray-400">📞</span>
                            <span>
                              {appointment.user?.phone_number || "Not provided"}
                            </span>
                          </div>
                          {appointment.user?.street_address && (
                            <div className="flex items-center gap-1 mb-1 text-xs text-gray-600">
                              <span className="text-gray-400">🏠</span>
                              <span>
                                {appointment.user.street_address},{" "}
                                {appointment.user.city} {appointment.user.state}{" "}
                                {appointment.user.zip_code}
                              </span>
                            </div>
                          )}
                          {appointment.user?.insurance_provider && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <div className="font-medium text-blue-800">
                                {appointment.user.insurance_provider}
                              </div>
                              <div className="text-blue-600">
                                ID: {appointment.user.insurance_id}
                              </div>
                              {appointment.user.group_number && (
                                <div className="text-blue-600">
                                  Group: {appointment.user.group_number}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Appointment Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              CONFIRMED
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-gray-400">📅</span>
                            <span className="font-medium">
                              {new Date(
                                appointment.appointment_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-gray-400">⏰</span>
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">🏥</span>
                            <span className="text-xs">
                              {appointment.diagnostic?.hospital ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Booked:{" "}
                            {new Date(
                              appointment.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Medical Information */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="mb-2">
                            <span className="font-medium text-gray-700">
                              Symptoms:
                            </span>
                            <div className="text-sm text-gray-600 mt-1">
                              {appointment.diagnostic?.symptom ||
                                "No symptoms recorded"}
                            </div>
                          </div>
                          {appointment.diagnostic?.ai_summary && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-700">
                                AI Analysis:
                              </span>
                              <div className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded max-h-20 overflow-y-auto">
                                {appointment.diagnostic.ai_summary.length > 100
                                  ? `${appointment.diagnostic.ai_summary.substring(0, 100)}...`
                                  : appointment.diagnostic.ai_summary}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Diagnostic created:{" "}
                            {new Date(
                              appointment.diagnostic?.created_at || ""
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          <button className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-3 py-1 rounded">
                            📋 View Full Record
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-3 py-1 rounded">
                            📧 Contact Patient
                          </button>
                          <button className="text-purple-600 hover:text-purple-900 text-xs bg-purple-50 px-3 py-1 rounded">
                            📝 Add Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              📊 Generate Reports
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Export appointment data and analytics
            </p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
              Export Data
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              ⚙️ Manage Schedule
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Update availability and time slots
            </p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
              Manage Calendar
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              👥 Patient Insights
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              View detailed patient analytics
            </p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
