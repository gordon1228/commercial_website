// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import { SessionManager } from "@/components/session-manager";
import ConditionalLayout from "@/components/conditional-layout";

export const metadata: Metadata = {
  title: "EVTL - Premium Commercial Trucks",
  description: "Discover premium commercial trucks for your business. Electric and commercial trucks with uncompromising quality and reliability.",
  keywords: "commercial trucks, electric trucks, fleet, business vehicles, EVTL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <NextAuthSessionProvider>
          <SessionManager />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}