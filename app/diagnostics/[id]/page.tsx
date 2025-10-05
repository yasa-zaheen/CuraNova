"use client";
import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface DiabetesFormData {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree: number;
  age: number;
}

interface MLResponse {
  prediction: number;
  probability: number;
  message?: string;
}

function DiabetesTestModal({
  test,
  onClose,
}: {
  test: TestRecord;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<DiabetesFormData>({
    pregnancies: 0,
    glucose: 0,
    blood_pressure: 0,
    skin_thickness: 0,
    insulin: 0,
    bmi: 0,
    diabetes_pedigree: 0,
    age: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<MLResponse | null>(null);

  const handleInputChange = (field: keyof DiabetesFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/predict-diabetes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: test.id,
          ...formData,
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error("Error submitting diabetes test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Diabetes Test Results - {test.test_name}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pregnancies">Pregnancies</Label>
            <Input
              id="pregnancies"
              type="number"
              min="0"
              value={formData.pregnancies}
              onChange={(e) => handleInputChange("pregnancies", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="glucose">Glucose (mg/dL)</Label>
            <Input
              id="glucose"
              type="number"
              min="0"
              value={formData.glucose}
              onChange={(e) => handleInputChange("glucose", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
            <Input
              id="blood_pressure"
              type="number"
              min="0"
              value={formData.blood_pressure}
              onChange={(e) =>
                handleInputChange("blood_pressure", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="skin_thickness">Skin Thickness (mm)</Label>
            <Input
              id="skin_thickness"
              type="number"
              min="0"
              value={formData.skin_thickness}
              onChange={(e) =>
                handleInputChange("skin_thickness", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="insulin">Insulin (μU/mL)</Label>
            <Input
              id="insulin"
              type="number"
              min="0"
              value={formData.insulin}
              onChange={(e) => handleInputChange("insulin", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bmi">BMI</Label>
            <Input
              id="bmi"
              type="number"
              min="0"
              step="0.1"
              value={formData.bmi}
              onChange={(e) => handleInputChange("bmi", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="diabetes_pedigree">
              Diabetes Pedigree Function
            </Label>
            <Input
              id="diabetes_pedigree"
              type="number"
              min="0"
              step="0.01"
              value={formData.diabetes_pedigree}
              onChange={(e) =>
                handleInputChange("diabetes_pedigree", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min="0"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
            />
          </div>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              ML Model Results
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Prediction:</strong>{" "}
                {result.prediction === 1
                  ? "Positive for Diabetes"
                  : "Negative for Diabetes"}
              </p>
              <p>
                <strong>Probability:</strong>{" "}
                {(result.probability * 100).toFixed(2)}%
              </p>
              {result.message && (
                <p>
                  <strong>Note:</strong> {result.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500"
          >
            {isSubmitting ? "Processing..." : "Run ML Prediction"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function TestResultModal({
  test,
  onClose,
}: {
  test: TestRecord;
  onClose: () => void;
}) {
  if (test.test_id === "fasting_glucose_blood_test") {
    return <DiabetesTestModal test={test} onClose={onClose} />;
  }

  // Default modal for other tests
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Test Results - {test.test_name}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-results">Test Results</Label>
          <Input
            id="test-results"
            placeholder="Enter test results..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500">
            Save Results
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function DiagnosticDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecord | null>(null);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch diagnostic
        const { data: diagnosticData, error: diagnosticError } = await supabase
          .from("diagnostics")
          .select("*")
          .eq("id", id)
          .single();

        if (diagnosticError) {
          console.error("Error fetching diagnostic:", diagnosticError);
          return;
        }

        // Fetch tests
        const { data: testsData, error: testsError } = await supabase
          .from("tests")
          .select("id, diagnostic_id, test_name, status, result_file, test_id")
          .eq("diagnostic_id", id);

        if (testsError) {
          console.error("Error fetching tests:", testsError);
        }

        setDiagnostic(diagnosticData);
        setTests(testsData || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnostic details...</p>
        </div>
      </div>
    );
  }

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
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500"
                            onClick={() => setSelectedTest(test)}
                          >
                            Enter Results
                          </Button>
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

      {/* Test Result Modal */}
      {selectedTest && (
        <Dialog
          open={!!selectedTest}
          onOpenChange={(open) => !open && setSelectedTest(null)}
        >
          <TestResultModal
            test={selectedTest}
            onClose={() => setSelectedTest(null)}
          />
        </Dialog>
      )}
    </div>
  );
}
