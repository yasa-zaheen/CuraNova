"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingData {
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  insurance_provider: string;
  insurance_id: string;
  group_number: string;
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    insurance_provider: "",
    insurance_id: "",
    group_number: "",
  });

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          ...formData,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        console.error("Onboarding error:", error);
        alert("Failed to save information. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center p-6 pb-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Let&apos;s get your information set up to provide you with the best
            healthcare experience
          </p>
        </div>

        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>

              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  required
                  className="mt-2"
                  placeholder="(555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Address Information
              </h3>

              <div>
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  required
                  className="mt-2"
                  placeholder="123 Main Street"
                  value={formData.street_address}
                  onChange={(e) =>
                    handleInputChange("street_address", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    className="mt-2"
                    placeholder="Tampa"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    required
                    className="mt-2"
                    placeholder="FL"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="zip_code">ZIP Code *</Label>
                  <Input
                    id="zip_code"
                    required
                    className="mt-2"
                    placeholder="33601"
                    value={formData.zip_code}
                    onChange={(e) =>
                      handleInputChange("zip_code", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Insurance Information
              </h3>

              <div>
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <select
                  id="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={(e) =>
                    handleInputChange("insurance_provider", e.target.value)
                  }
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance_id">Insurance ID</Label>
                  <Input
                    id="insurance_id"
                    className="mt-2"
                    placeholder="ABC123456789"
                    value={formData.insurance_id}
                    onChange={(e) =>
                      handleInputChange("insurance_id", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="group_number">Group Number</Label>
                  <Input
                    id="group_number"
                    className="mt-2"
                    placeholder="GRP001"
                    value={formData.group_number}
                    onChange={(e) =>
                      handleInputChange("group_number", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Required fields. Insurance information is optional but helps us
              provide better service.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
