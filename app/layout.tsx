import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Who Wants to Be a Millionaire?",
  description:
    "Play the classic quiz game — random or profession-based questions. Climb the prize ladder to $1,000,000.",
  openGraph: {
    title: "Who Wants to Be a Millionaire?",
    description: "Can you go all the way to $1,000,000?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
