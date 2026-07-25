import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastContainer } from "@/components/shared/Toast";
import { AuthGate } from "@/components/shared/AuthGate";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "StudySphere | Exam Companion",
  description:
    "AI-powered Competitive Exam Operating System for Indian students preparing for SSC, Banking, UPSC, NEET, JEE and more.",
  keywords: ["SSC CGL", "IBPS", "UPSC", "NEET", "JEE", "exam preparation", "mock tests", "study planner"],
  authors: [{ name: "StudySphere" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0e0f18",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthGate>{children}</AuthGate>
        <ToastContainer />
      </body>
    </html>
  );
}
