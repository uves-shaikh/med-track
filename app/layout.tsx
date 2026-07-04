import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/layout/providers";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MedTrack — Patient Management",
    template: "%s | MedTrack",
  },
  description:
    "Fast, clean patient and visit management system for doctors. Replace Excel with a professional clinical dashboard.",
  keywords: [
    "patient management",
    "clinic",
    "doctor",
    "medical records",
    "visit tracking",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
