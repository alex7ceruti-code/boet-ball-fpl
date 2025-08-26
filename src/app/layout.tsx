import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boet Ball - Premium FPL for Mzansi",
  description: "Sharp, lekker Fantasy Premier League companion app built for South African fans. Get the latest fixtures, player stats, and FPL insights with a local twist.",
  keywords: "Fantasy Premier League, FPL, South Africa, Football, Soccer, Statistics",
  icons: {
    icon: '/instagram-logo-analytics-v3.svg',
    shortcut: '/favicon-16x16.png',
    apple: '/instagram-logo-analytics-v3.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <SessionProvider>
          <Navigation />
          <main className="min-h-[calc(100vh-5rem)] pt-2">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
