"use client";

import { Compass, File, History, Library } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Diagnostic {
  id: string;
  symptom: string;
  aiSummary: string;
  hospital: string;
  scheduledDate: string;
  testName?: string;
  status: string;
  createdAt: string;
}

function DashboardSidebar({
  user,
  displayName,
}: {
  user?: {
    firstName?: string | null;
    fullName?: string | null;
  } | null;
  displayName: string;
}) {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user: clerkUser } = useUser();

  useEffect(() => {
    const fetchDiagnostics = async () => {
      if (!clerkUser?.id) return;

      try {
        const response = await fetch(`/api/diagnostics?userId=${clerkUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setDiagnostics(data);
        }
      } catch (error) {
        console.error("Error fetching diagnostics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnostics();
  }, [clerkUser?.id]);

  const handleDiagnosticClick = (diagnosticId: string) => {
    router.push(`/diagnostics/${diagnosticId}`);
  };
  return (
    <aside className="w-1/5 bg-gray-50 border-r border-gray-100 flex flex-col justify-between h-screen">
      <div>
        <div className="px-4 py-4 flex items-center gap-3 border-gray-100">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold">
            CN
          </div>
          <div className="text-sm font-semibold">CuraNova</div>
        </div>

        <hr className="mx-4" />

        <nav className="px-3 py-4 space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <Compass className="w-4 h-4" />
            Explore
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <Library className="w-4 h-4" />
            Library
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <File className="w-4 h-4" />
            Files
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <History className="w-4 h-4" />
            History
          </div>
        </nav>

        <hr className="mx-4" />

        <div className="px-4 mt-4">
          <div className="text-xs text-gray-500 mb-2">Diagnostics</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
            ) : diagnostics.length > 0 ? (
              diagnostics.map((diagnostic) => (
                <div
                  key={diagnostic.id}
                  onClick={() => handleDiagnosticClick(diagnostic.id)}
                  className="px-3 py-2 bg-white border border-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-50 hover:border-purple-200 transition-colors"
                >
                  <div className="font-medium text-gray-800 truncate">
                    {diagnostic.symptom}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {diagnostic.hospital}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(diagnostic.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        diagnostic.status === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {diagnostic.status}
                    </span>
                    {diagnostic.testName && (
                      <span className="text-xs text-purple-600 font-medium">
                        {diagnostic.testName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No diagnostics yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User info at the bottom */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        {clerkUser?.imageUrl ? (
          <Image
            src={clerkUser.imageUrl}
            alt={displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-sm font-semibold">{displayName}</div>
      </div>
    </aside>
  );
}
export default DashboardSidebar;
