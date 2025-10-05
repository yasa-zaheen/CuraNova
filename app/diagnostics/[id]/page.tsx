import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface DiagnosticRecord {
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
}

interface TestRecord {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file: string;
  test_id: string;
}

async function getDiagnostic(id: string): Promise<DiagnosticRecord | null> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching diagnostic:", error);
    return null;
  }
}

async function getTestsForDiagnostic(
  diagnosticId: string
): Promise<TestRecord[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("tests")
      .select("id, diagnostic_id, test_name, status, result_file, test_id")
      .eq("diagnostic_id", diagnosticId);

    if (error) {
      console.error("Supabase error fetching tests:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching tests:", error);
    return [];
  }
}

export default async function DiagnosticDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagnostic = await getDiagnostic(id);
  const tests = await getTestsForDiagnostic(id);

  if (!diagnostic) {
    notFound();
  }

  const scheduledDate = new Date(diagnostic.scheduled_date);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-6">
            <h1 className="text-3xl font-bold">Diagnostic Assessment</h1>
            <p className="text-purple-100 mt-2">Assessment ID: {id}</p>
            <div className="flex items-center mt-4">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  diagnostic.status === "scheduled"
                    ? "bg-blue-100 bg-opacity-20 text-blue-100 border border-blue-200"
                    : "bg-gray-100 bg-opacity-20 text-gray-100 border border-gray-200"
                }`}
              >
                Status:{" "}
                {diagnostic.status.charAt(0).toUpperCase() +
                  diagnostic.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptom */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🩺 Reported Symptoms
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 font-medium">
                  {diagnostic.symptom}
                </p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🤖 AI Assessment
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div
                  className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: diagnostic.ai_summary.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            </div>

            {/* Tests for this Diagnostic */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🔬 Your Tests
              </h2>

              {tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🧪</div>
                  <p className="text-lg font-medium mb-2">No tests found</p>
                  <p className="text-sm">
                    No tests have been assigned to this diagnostic yet.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                          {test.test_name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Test ID:</span>
                          <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                            {test.test_id}
                          </span>
                        </div>
                        {test.result_file && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Results:</span>
                            <a
                              href={test.result_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              View File
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {test.status === "completed" && test.result_file && (
                          <button className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-500 hover:to-green-600 transition-colors">
                            View Results
                          </button>
                        )}
                        {test.status === "pending" && (
                          <button className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-colors">
                            Upload Result
                          </button>
                        )}
                        {test.status === "in_progress" && (
                          <button className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-600 transition-colors">
                            Check Status
                          </button>
                        )}
                        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📅 Appointment Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-gray-800 font-medium">
                      {diagnostic.hospital}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                    <p className="text-gray-700 text-sm">{formattedTime}</p>
                  </div>
                </div>

                {diagnostic.test_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommended Test
                    </label>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-gray-800 font-medium">
                        {diagnostic.test_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Test Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tests:</span>
                  <span className="font-semibold text-gray-900">
                    {tests.length}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="font-semibold text-yellow-600">
                    {tests.filter((test) => test.status === "pending").length}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="font-semibold text-blue-600">
                    {
                      tests.filter((test) => test.status === "in_progress")
                        .length
                    }
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="font-semibold text-green-600">
                    {tests.filter((test) => test.status === "completed").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Quick Actions
              </h2>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-colors text-left">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📞</span>
                    <div>
                      <div className="font-medium">Call Hospital</div>
                      <div className="text-blue-100 text-sm">
                        Schedule or modify appointment
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-500 hover:to-green-600 transition-colors text-left">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📋</span>
                    <div>
                      <div className="font-medium">Download Summary</div>
                      <div className="text-green-100 text-sm">
                        Get PDF report
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-colors text-left">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">💬</span>
                    <div>
                      <div className="font-medium">Chat with AI</div>
                      <div className="text-purple-100 text-sm">
                        Ask follow-up questions
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-500 hover:to-gray-600 transition-colors text-left">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🗓️</span>
                    <div>
                      <div className="font-medium">Reschedule</div>
                      <div className="text-gray-100 text-sm">
                        Change appointment time
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div> */}

            {/* Emergency Contact */}
            {/* <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">
                🚨 Emergency Contact
              </h3>
              <p className="text-red-700 text-sm mb-2">
                If you experience severe symptoms, don't wait for your
                appointment.
              </p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Call Emergency: 911
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
