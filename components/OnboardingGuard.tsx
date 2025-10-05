"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Only the home page is public, everything else requires authentication and onboarding
  const isHomePage = pathname === "/";
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isOnboardingPage = pathname === "/onboarding";
  const isPublicRoute = isHomePage || isAuthPage || isOnboardingPage;

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isLoaded || !user || isPublicRoute) {
        setOnboardingChecked(true);
        setNeedsOnboarding(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/check-onboarding?clerkUserId=${user.id}`
        );
        const data = await response.json();

        console.log("Onboarding check response status:", response.status);
        console.log("Onboarding check result:", data);

        // If API fails or user doesn't exist, redirect to onboarding
        if (!response.ok || !data.userExists) {
          console.log(
            "API failed or user doesn't exist, redirecting to onboarding..."
          );
          setNeedsOnboarding(true);
          router.push("/onboarding");
          return;
        }

        // If user exists but onboarding not completed, redirect
        if (!data.onboardingCompleted) {
          console.log("User needs onboarding, redirecting...");
          setNeedsOnboarding(true);
          router.push("/onboarding");
          return;
        }

        console.log("User onboarding complete, allowing access");
        setOnboardingChecked(true);
        setNeedsOnboarding(false);
      } catch (error) {
        console.error("Error checking onboarding:", error);
        // On error, be defensive and redirect to onboarding
        console.log("Error occurred, redirecting to onboarding for safety...");
        setNeedsOnboarding(true);
        router.push("/onboarding");
      }
    };

    checkOnboarding();
  }, [user, isLoaded, router, pathname, isPublicRoute]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading when checking onboarding or when redirecting to onboarding
  if (user && !isPublicRoute && (!onboardingChecked || needsOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">
            {needsOnboarding
              ? "Redirecting to setup..."
              : "Checking profile..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
