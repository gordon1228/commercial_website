import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/toast";

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
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </NextAuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
