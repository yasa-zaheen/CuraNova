import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface DiagnosticWithUser {
  id: string;
  user_id: string;
  symptom: string;
  ai_summary: string;
  hospital: string;
  scheduled_date: string;
  test_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // User info from profiles table (if exists) or users table
  user_email?: string;
  user_name?: string;
}

interface TestWithDetails {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file?: string;
  test_id: string;
  // Related diagnostic info
  diagnostic?: DiagnosticWithUser;
}

async function getAllTests(): Promise<TestWithDetails[]> {
  try {
    const supabase = createSupabaseServerClient();

    // Get all tests with their related diagnostic and user information
    const { data, error } = await supabase
      .from("tests")
      .select(
        `
        *,
        diagnostic:diagnostics!diagnostic_id (
          *
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching tests:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching all tests:", error);
    return [];
  }
}

async function getAllDiagnostics(): Promise<DiagnosticWithUser[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching diagnostics:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching diagnostics:", error);
    return [];
  }
}

export default async function DoctorDashboard() {
  const tests = await getAllTests();
  const diagnostics = await getAllDiagnostics();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-blue-100 mt-2">
              Monitor all patient tests and diagnostics
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.length}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tests.filter((test) => test.status === "pending").length}
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter((test) => test.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(diagnostics.map((d) => d.user_id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Tests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Tests</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete overview of all patient tests
            </p>
          </div>

          {tests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🧪</div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                No tests found
              </p>
              <p className="text-sm text-gray-600">
                Tests will appear here when patients complete their assessments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnostic Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {test.test_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            ID: {test.test_id}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            User ID: {test.diagnostic?.user_id || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {test.diagnostic?.user_email ||
                              "Email not available"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            test.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : test.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : test.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {test.status.charAt(0).toUpperCase() +
                            test.status.slice(1).replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="font-medium">
                            {test.diagnostic?.symptom || "No symptom recorded"}
                          </div>
                          <div className="text-gray-500 truncate">
                            Hospital: {test.diagnostic?.hospital || "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Scheduled:{" "}
                            {test.diagnostic?.scheduled_date
                              ? new Date(
                                  test.diagnostic.scheduled_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {test.result_file && (
                            <a
                              href={test.result_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Results
                            </a>
                          )}
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => {
                              // TODO: Navigate to detailed view
                              window.location.href = `/diagnostics/${test.diagnostic_id}`;
                            }}
                          >
                            View Details
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
      </div>
    </div>
  );
}
