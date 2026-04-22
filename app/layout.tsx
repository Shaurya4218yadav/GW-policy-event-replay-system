import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
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
