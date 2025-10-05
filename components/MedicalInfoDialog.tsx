"use client";

// React
import { useState, useEffect } from "react";

// Clerk
import { useUser } from "@clerk/nextjs";

// Contexts
import { useMedicalInfo } from "@/context/MedicalInfoContext";

// ShadCn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Components
import AvailabilityCalendar from "@/components/availability/AvailabilityCalendar";

// Types
import {
  MedicalInfo,
  TestSelection,
  AppointmentInput,
  DiagnosticPayload,
} from "@/types/medical";

interface MedicalTest {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

interface MedicalInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: DiagnosticPayload) => void;
  workerResponse: {
    type: string;
    testName?: string;
    testId?: string; // AI recommended test ID from Cloudflare worker
    reply: string;
  };
  userSymptom: string;
}

// Sample medical tests JSON object
const MEDICAL_TESTS: MedicalTest[] = [
  {
    id: "fasting_glucose_blood_test",
    name: "Fasting Glucose Blood Test",
    description:
      "Measures blood sugar levels after fasting to screen for diabetes or prediabetes.",
    price: "$25",
    duration: "Same day",
    category: "blood",
  },
  {
    id: "cardiovascular_risk_panel",
    name: "Cardiovascular Risk Panel",
    description:
      "Evaluates cholesterol, blood pressure, and heart-related biomarkers to assess risk of heart disease.",
    price: "$100",
    duration: "1–2 days",
    category: "cardiology",
  },
  {
    id: "kidney_function_test",
    name: "Kidney Function Test",
    description:
      "Analyzes blood urea nitrogen and creatinine levels to detect kidney dysfunction or disease.",
    price: "$45",
    duration: "1 day",
    category: "blood",
  },
  {
    id: "liver_enzyme_panel",
    name: "Liver Enzyme Panel",
    description:
      "Checks enzyme levels (ALT, AST, ALP, bilirubin) to evaluate liver function or potential liver disease.",
    price: "$55",
    duration: "1 day",
    category: "blood",
  },
  {
    id: "parkinsons_screening",
    name: "Parkinson’s Screening Test",
    description:
      "Analyzes neurological and voice metrics (jitter, shimmer, pitch) for early signs of Parkinson’s disease.",
    price: "$120",
    duration: "2–3 days",
    category: "neurology",
  },
];

// Function to get AI recommended test ID
const getAIRecommendedTestIds = (testId?: string): string[] => {
  if (!testId) return [];

  return [testId]; // Return array with single test ID
};

// Function to check if a test is recommended by AI
const isTestRecommended = (
  testId: string,
  aiRecommendedTestId?: string
): boolean => {
  if (!aiRecommendedTestId) return true; // If no AI recommendation, allow all

  return aiRecommendedTestId === testId;
};

export default function MedicalInfoDialog({
  isOpen,
  onClose,
  onSubmit,
  workerResponse,
  userSymptom,
}: MedicalInfoDialogProps) {
  // Use medical context for patient information
  const { medicalInfo, setMedicalInfo, updateField } = useMedicalInfo();
  const { user } = useUser();

  // Initialize with AI recommended tests
  const [selectedTests, setSelectedTests] = useState<string[]>(() => {
    return getAIRecommendedTestIds(workerResponse?.testId);
  });

  // Single date selection for appointment scheduling
  // Stores the preferred appointment date as ISO string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Track if we've loaded user data to avoid overwriting user edits
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Initialize recommended tests when dialog opens or worker response changes
  useEffect(() => {
    if (isOpen && workerResponse) {
      const aiRecommendedIds = getAIRecommendedTestIds(workerResponse?.testId);
      setSelectedTests(aiRecommendedIds);
    }
  }, [isOpen, workerResponse]);

  // Fetch and populate user data when dialog opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isOpen || !user?.id || userDataLoaded) return;

      try {
        console.log("🔄 Fetching user data from Supabase...");
        const response = await fetch(`/api/user-data?clerkUserId=${user.id}`);
        const data = await response.json();

        if (response.ok && data.userExists && data.userData) {
          console.log("✅ Populating form with user data:", data.userData);

          // Only populate if fields are empty to avoid overwriting user edits
          const currentInfo = medicalInfo;
          const updates: Partial<MedicalInfo> = {};

          // Populate empty fields with user data
          if (!currentInfo.firstName && data.userData.firstName) {
            updates.firstName = data.userData.firstName;
          }
          if (!currentInfo.lastName && data.userData.lastName) {
            updates.lastName = data.userData.lastName;
          }
          if (!currentInfo.email && data.userData.email) {
            updates.email = data.userData.email;
          }
          if (!currentInfo.phone && data.userData.phone) {
            updates.phone = data.userData.phone;
          }
          if (!currentInfo.street && data.userData.street) {
            updates.street = data.userData.street;
          }
          if (!currentInfo.city && data.userData.city) {
            updates.city = data.userData.city;
          }
          if (!currentInfo.state && data.userData.state) {
            updates.state = data.userData.state;
          }
          if (!currentInfo.zip && data.userData.zip) {
            updates.zip = data.userData.zip;
          }
          if (
            !currentInfo.insuranceProvider &&
            data.userData.insuranceProvider
          ) {
            updates.insuranceProvider = data.userData.insuranceProvider;
          }
          if (!currentInfo.insuranceId && data.userData.insuranceId) {
            updates.insuranceId = data.userData.insuranceId;
          }
          if (!currentInfo.groupNumber && data.userData.groupNumber) {
            updates.groupNumber = data.userData.groupNumber;
          }

          // Update the medical info with the fetched data
          if (Object.keys(updates).length > 0) {
            Object.entries(updates).forEach(([field, value]) => {
              updateField(field as keyof MedicalInfo, value as string);
            });
          }

          setUserDataLoaded(true);
        } else {
          console.log("📝 No user data found or user doesn't exist");
          setUserDataLoaded(true);
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
        setUserDataLoaded(true);
      }
    };

    fetchUserData();
  }, [isOpen, user?.id, userDataLoaded]); // Removed medicalInfo and setMedicalInfo to avoid unnecessary re-renders

  const handleInputChange = (field: keyof MedicalInfo, value: string) => {
    updateField(field, value);
  };

  const handleTestToggle = (testId: string) => {
    // Only allow toggling if test is recommended by AI or if no AI recommendations
    if (!isTestRecommended(testId, workerResponse?.testId)) {
      return; // Don't allow toggling disabled tests
    }

    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };
  const handleSubmit = () => {
    // Create comprehensive diagnostic payload with all required information
    const appointmentInput: AppointmentInput = {
      preferredDate:
        selectedDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      timeSlot: "morning", // Default to morning slot
      notes: `Appointment for ${
        selectedTests.length
      } test(s): ${selectedTests.join(", ")}`,
    };

    const testSelection: TestSelection = {
      selectedTests,
      recommendedBy: workerResponse.type,
      notes: workerResponse.reply,
    };

    const diagnosticPayload: DiagnosticPayload = {
      medicalInfo,
      testSelection,
      appointmentInput,
      userSymptom,
      aiSummary: workerResponse.reply,
    };

    // Log for debugging
    console.log("Diagnostic payload:", diagnosticPayload);

    // Pass comprehensive payload to parent
    onSubmit(diagnosticPayload);
  };

  const isFormValid =
    medicalInfo.firstName &&
    medicalInfo.lastName &&
    medicalInfo.email &&
    medicalInfo.phone &&
    selectedTests.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Complete Your Medical Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  className="mt-2"
                  value={medicalInfo.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  className="mt-2"
                  value={medicalInfo.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-2"
                  value={medicalInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  className="mt-2"
                  type="tel"
                  value={medicalInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  className="mt-2"
                  value={medicalInfo.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Address Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={medicalInfo.street}
                  className="mt-2"
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={medicalInfo.city}
                    className="mt-2"
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Tampa"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={medicalInfo.state}
                    className="mt-2"
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="FL"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={medicalInfo.zip}
                    className="mt-2"
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    placeholder="33601"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Insurance Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <select
                  id="insuranceProvider"
                  value={medicalInfo.insuranceProvider}
                  onChange={(e) =>
                    handleInputChange("insuranceProvider", e.target.value)
                  }
                  className="w-full px-3 py-2 border mt-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Insurance Provider</option>
                  <option value="Blue Cross Blue Shield">
                    Blue Cross Blue Shield
                  </option>
                  <option value="Aetna">Aetna</option>
                  <option value="Cigna">Cigna</option>
                  <option value="United Healthcare">United Healthcare</option>
                  <option value="Humana">Humana</option>
                  <option value="Kaiser Permanente">Kaiser Permanente</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="insuranceId">Insurance ID</Label>
                <Input
                  id="insuranceId"
                  className="mt-2"
                  value={medicalInfo.insuranceId}
                  onChange={(e) =>
                    handleInputChange("insuranceId", e.target.value)
                  }
                  placeholder="ABC123456789"
                />
              </div>
              <div>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  className="mt-2"
                  value={medicalInfo.groupNumber}
                  onChange={(e) =>
                    handleInputChange("groupNumber", e.target.value)
                  }
                  placeholder="GRP001"
                />
              </div>
            </div>
          </div>

          {/* Medical Tests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended Medical Tests
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your symptoms and AI assessment, we&apos;ve pre-selected
              some recommended tests. You can modify the selection below:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MEDICAL_TESTS.map((test) => {
                const isRecommended = isTestRecommended(
                  test.id,
                  workerResponse?.testId
                );
                const isSelected = selectedTests.includes(test.id);
                const isDisabled = !isRecommended;

                return (
                  <div
                    key={test.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? "border-purple-300 bg-purple-50"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-60"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={test.id}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleTestToggle(test.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={test.id}
                          className={`text-sm font-medium ${
                            isDisabled
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-900 cursor-pointer"
                          }`}
                        >
                          {test.name}
                          {isRecommended && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              AI Recommended
                            </span>
                          )}
                        </label>
                        <p
                          className={`text-xs mt-1 ${
                            isDisabled ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {test.description}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span
                            className={`text-xs font-medium ${
                              isDisabled ? "text-gray-400" : "text-purple-600"
                            }`}
                          >
                            {test.price}
                          </span>
                          <span
                            className={`text-xs ${
                              isDisabled ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {test.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appointment Date Selection */}
          {/* 
            Integrated calendar for single-date appointment scheduling.
            Positioned after test selection but before action buttons to maintain logical flow.
            
            Key features:
            - 14-day window for near-term scheduling
            - Single-select mode for specific appointment booking
            - ISO date output for consistent database integration
            - Visual feedback with emerald shading
          */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Preferred Appointment Date
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred date for the medical tests. We&apos;ll
              confirm availability and send you appointment details.
            </p>
            <AvailabilityCalendar
              initial={null} // Start with no pre-selected date
              onChange={setSelectedDate} // Update local state with selected date
              className="rounded-2xl" // Match modal's rounded design
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500"
            >
              Schedule Selected Tests ({selectedTests.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
