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
  title: "Policy Replay Console",
  description: "Deterministic event-sourced policy simulation and audit engine.",
};

import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";

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
      <body className="min-h-full">
        <AppProvider>
          <div className="flex">
            <Navbar />
            <main className="flex-1 min-h-screen">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
