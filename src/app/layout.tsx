// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/toast";
import { SessionManager } from "@/components/session-manager";
import ConditionalLayout from "@/components/conditional-layout";

export const metadata: Metadata = {
  title: "EliteFleet - Premium Commercial Vehicles",
  description: "Discover premium commercial vehicles for your business. Trucks, vans, and buses with uncompromising quality and reliability.",
  keywords: "commercial vehicles, trucks, vans, buses, fleet, business vehicles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ToastProvider>
          <NextAuthSessionProvider>
            <SessionManager />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </NextAuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}