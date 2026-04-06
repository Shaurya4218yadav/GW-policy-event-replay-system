import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Policy Intelligence System",
  description: "Deterministic event-sourced policy simulation and audit engine.",
};

import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import TopHeader from "@/app/components/TopHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="antialiased overflow-x-hidden selection:bg-accent selection:text-black">
        <AppProvider>
          <div className="relative min-h-screen">
            <TopHeader />
            <Navbar />
            <main className="w-full pl-12 md:pl-16 pr-4 md:pr-0 overflow-x-hidden max-w-[100vw]">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
