"use client";

// React
import { useState } from "react";

// Next
import { useRouter } from "next/navigation";

// Clerk
import { useUser } from "@clerk/nextjs";

// Components
import MedicalInfoDialog from "./MedicalInfoDialog";
import { MedicalInfoProvider } from "@/context/MedicalInfoContext";

// Types
import { DiagnosticPayload } from "@/types/medical";

// Type Definitions
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WorkerResponse {
  type: "test" | "doctor" | "none";
  testName?: string;
  reply: string;
}

interface ChatProps {
  user?: {
    firstName?: string | null;
    fullName?: string | null;
  } | null;
  displayName: string;
}

export default function Chat({ user, displayName }: ChatProps) {
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMedicalDialog, setShowMedicalDialog] = useState(false);
  const [currentWorkerResponse, setCurrentWorkerResponse] =
    useState<WorkerResponse | null>(null);
  const [currentUserSymptom, setCurrentUserSymptom] = useState("");

  // Hooks
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Functions
  const handleTestResponse = async (
    workerResponse: WorkerResponse,
    userSymptom: string
  ) => {
    // Open the medical information dialog
    setCurrentWorkerResponse(workerResponse);
    setCurrentUserSymptom(userSymptom);
    setShowMedicalDialog(true);
  };

  const handleMedicalDialogSubmit = async (
    payload: DiagnosticPayload
  ) => {
    try {
      if (!currentWorkerResponse) return;

      // Transform DiagnosticPayload to match existing API structure
      const diagnosticsData = {
        userId: clerkUser?.id || "anonymous",
        symptom: payload.userSymptom,
        aiSummary: payload.aiSummary,
        testName: payload.testSelection.selectedTests.join(", "),
        hospital: "Tampa General Hospital",
        scheduledDate: payload.appointmentInput.preferredDate,
        patientInfo: {
          firstName: payload.medicalInfo.firstName,
          lastName: payload.medicalInfo.lastName,
          email: payload.medicalInfo.email,
          phone: payload.medicalInfo.phone,
          address: payload.medicalInfo.street,
          city: payload.medicalInfo.city,
          state: payload.medicalInfo.state,
          zipCode: payload.medicalInfo.zip,
          dateOfBirth: payload.medicalInfo.dob,
          insuranceProvider: payload.medicalInfo.insuranceProvider,
          insuranceId: payload.medicalInfo.insuranceId,
          insuranceGroup: payload.medicalInfo.groupNumber,
        },
        selectedTests: payload.testSelection.selectedTests,
      };

      const response = await fetch("/api/diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(diagnosticsData),
      });

      if (!response.ok) {
        throw new Error("Failed to create diagnostic entry");
      }

      const diagnostic = await response.json();

      // Close dialog and navigate
      setShowMedicalDialog(false);
      setCurrentWorkerResponse(null);
      setCurrentUserSymptom("");

      // Navigate to the diagnostic details page
      router.push(`/diagnostics/${diagnostic.id}`);
    } catch (error) {
      console.error("Error creating diagnostics entry:", error);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while scheduling your test. Please try again or contact support.",
        },
      ]);

      // Close dialog
      setShowMedicalDialog(false);
    }
  };

  const handleMedicalDialogClose = () => {
    setShowMedicalDialog(false);
    setCurrentWorkerResponse(null);
    setCurrentUserSymptom("");
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        role: "user",
        content: inputValue.trim(),
      };

      // Add user message immediately
      const currentInput = inputValue.trim();
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        // Send request to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const workerResponse: WorkerResponse = await response.json();

        // Extract only the reply content for display
        const replyContent =
          workerResponse.reply || "I'm sorry, I couldn't process your request.";

        // Add assistant response to messages
        const assistantMessage: Message = {
          role: "assistant",
          content: replyContent,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Handle different response types
        if (workerResponse.type === "test") {
          await handleTestResponse(workerResponse, currentInput);
        } else if (workerResponse.type === "doctor") {
          // Navigate to appointments page
          router.push("/appointments");
        }

        // Log the response type and testName for debugging
        console.log("Worker Response:", {
          type: workerResponse.type,
          testName: workerResponse.testName,
          hasReply: !!workerResponse.reply,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MedicalInfoProvider>
      <div className="flex flex-col h-screen px-4">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mt-4 p-4 space-y-4 bg-gray-50 rounded-3xl">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Hello {user?.firstName ?? user?.fullName ?? displayName}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              How can I help you today?
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100 text-gray-800">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="py-4 border-gray-50">
        <div className="w-full">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-3 rounded-xl">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Ask something.."
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "↑"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Medical Information Dialog */}
      {showMedicalDialog && currentWorkerResponse && (
        <MedicalInfoDialog
          isOpen={showMedicalDialog}
          onClose={handleMedicalDialogClose}
          onSubmit={handleMedicalDialogSubmit}
          workerResponse={currentWorkerResponse}
          userSymptom={currentUserSymptom}
        />
      )}
    </div>
    </MedicalInfoProvider>
  );
}
