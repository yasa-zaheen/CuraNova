// Next
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Clerk
import { ClerkProvider } from "@clerk/nextjs";

// Components
import OnboardingGuard from "@/components/OnboardingGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuraNova - AI-Powered Healthcare",
  description:
    "Transform your healthcare experience with AI-powered diagnostics and personalized care",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <OnboardingGuard>{children}</OnboardingGuard>
        </body>
      </html>
    </ClerkProvider>
  );
}
