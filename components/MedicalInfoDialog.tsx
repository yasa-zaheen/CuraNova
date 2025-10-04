"use client";

import { useState, useEffect } from "react";
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
// Import availability calendar for single-date selection
import AvailabilityCalendar from "@/components/availability/AvailabilityCalendar";
// Import medical context and types
import { useMedicalInfo } from "@/context/MedicalInfoContext";
import { MedicalInfo, TestSelection, AppointmentInput, DiagnosticPayload } from "@/types/medical";

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
    reply: string;
  };
  userSymptom: string;
}

// Sample medical tests JSON object
const MEDICAL_TESTS: MedicalTest[] = [
  {
    id: "blood_test",
    name: "Complete Blood Count (CBC)",
    description: "Checks for blood disorders, infections, and overall health",
    price: "$45",
    duration: "1-2 days",
    category: "blood",
  },
  {
    id: "metabolic_panel",
    name: "Basic Metabolic Panel",
    description: "Tests glucose, electrolytes, and kidney function",
    price: "$55",
    duration: "1 day",
    category: "blood",
  },
  {
    id: "lipid_profile",
    name: "Lipid Profile",
    description: "Measures cholesterol and triglyceride levels",
    price: "$40",
    duration: "1 day",
    category: "blood",
  },
  {
    id: "thyroid_test",
    name: "Thyroid Function Test (TSH, T3, T4)",
    description: "Evaluates thyroid gland function",
    price: "$75",
    duration: "2-3 days",
    category: "hormone",
  },
  {
    id: "vitamin_d",
    name: "Vitamin D Test",
    description: "Measures vitamin D levels in blood",
    price: "$50",
    duration: "1-2 days",
    category: "vitamin",
  },
  {
    id: "hba1c",
    name: "HbA1c (Diabetes Test)",
    description: "Tests average blood sugar over 2-3 months",
    price: "$35",
    duration: "1 day",
    category: "diabetes",
  },
  {
    id: "ultrasound",
    name: "Abdominal Ultrasound",
    description: "Imaging of abdominal organs",
    price: "$150",
    duration: "30 minutes",
    category: "imaging",
  },
  {
    id: "chest_xray",
    name: "Chest X-Ray",
    description: "Imaging of chest and lungs",
    price: "$75",
    duration: "15 minutes",
    category: "imaging",
  },
  {
    id: "ecg",
    name: "Electrocardiogram (ECG/EKG)",
    description: "Tests heart electrical activity",
    price: "$85",
    duration: "15 minutes",
    category: "cardiac",
  },
  {
    id: "urinalysis",
    name: "Urinalysis",
    description: "Tests urine for various conditions",
    price: "$25",
    duration: "1 day",
    category: "urine",
  },
];

// Function to match AI response with tests
const getRecommendedTests = (testName?: string, symptom?: string): string[] => {
  if (!testName && !symptom) return [];

  const recommended: string[] = [];
  const searchText = `${testName || ""} ${symptom || ""}`.toLowerCase();

  // Simple keyword matching - you can make this more sophisticated
  if (
    searchText.includes("blood") ||
    searchText.includes("anemia") ||
    searchText.includes("infection")
  ) {
    recommended.push("blood_test");
  }
  if (
    searchText.includes("diabetes") ||
    searchText.includes("sugar") ||
    searchText.includes("glucose")
  ) {
    recommended.push("hba1c", "metabolic_panel");
  }
  if (
    searchText.includes("thyroid") ||
    searchText.includes("hormone") ||
    searchText.includes("fatigue")
  ) {
    recommended.push("thyroid_test");
  }
  if (
    searchText.includes("cholesterol") ||
    searchText.includes("lipid") ||
    searchText.includes("heart")
  ) {
    recommended.push("lipid_profile");
  }
  if (
    searchText.includes("ultrasound") ||
    searchText.includes("abdominal") ||
    searchText.includes("stomach")
  ) {
    recommended.push("ultrasound");
  }
  if (
    searchText.includes("chest") ||
    searchText.includes("cough") ||
    searchText.includes("breathing")
  ) {
    recommended.push("chest_xray");
  }
  if (
    searchText.includes("heart") ||
    searchText.includes("cardiac") ||
    searchText.includes("ecg")
  ) {
    recommended.push("ecg");
  }
  if (
    searchText.includes("vitamin") ||
    searchText.includes("deficiency") ||
    searchText.includes("bone")
  ) {
    recommended.push("vitamin_d");
  }
  if (
    searchText.includes("urine") ||
    searchText.includes("kidney") ||
    searchText.includes("uti")
  ) {
    recommended.push("urinalysis");
  }

  return recommended;
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

  const [selectedTests, setSelectedTests] = useState<string[]>(() => {
    return getRecommendedTests(workerResponse?.testName, userSymptom);
  });

  // Single date selection for appointment scheduling
  // Stores the preferred appointment date as ISO string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Initialize recommended tests when dialog opens or worker response changes
  useEffect(() => {
    if (isOpen && workerResponse) {
      const recommended = getRecommendedTests(workerResponse?.testName, userSymptom);
      setSelectedTests(recommended);
    }
  }, [isOpen, workerResponse, userSymptom]);

  const handleInputChange = (field: keyof MedicalInfo, value: string) => {
    updateField(field, value);
  };

  const handleTestToggle = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSubmit = () => {
    // Create comprehensive diagnostic payload with all required information
    const appointmentInput: AppointmentInput = {
      preferredDate: selectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeSlot: 'morning', // Default to morning slot
      notes: `Appointment for ${selectedTests.length} test(s): ${selectedTests.join(', ')}`,
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
    console.log('Diagnostic payload:', diagnosticPayload);
    
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  value={medicalInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
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
                  value={medicalInfo.dob}
                  onChange={(e) =>
                    handleInputChange("dob", e.target.value)
                  }
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
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Tampa"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={medicalInfo.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="FL"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={medicalInfo.zip}
                    onChange={(e) =>
                      handleInputChange("zip", e.target.value)
                    }
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              Based on your symptoms and AI assessment, we've pre-selected some
              recommended tests. You can modify the selection below:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MEDICAL_TESTS.map((test) => (
                <div
                  key={test.id}
                  className={`border rounded-lg p-4 ${
                    selectedTests.includes(test.id)
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={test.id}
                      checked={selectedTests.includes(test.id)}
                      onCheckedChange={() => handleTestToggle(test.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={test.id}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {test.name}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        {test.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-purple-600 font-medium">
                          {test.price}
                        </span>
                        <span className="text-xs text-gray-500">
                          {test.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              Choose your preferred date for the medical tests. We'll confirm availability and send you appointment details.
            </p>
            <AvailabilityCalendar
              initial={null}                      // Start with no pre-selected date
              onChange={setSelectedDate}          // Update local state with selected date
              className="rounded-2xl"             // Match modal's rounded design
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
