import type { Metadata } from "next";
import { Cinzel, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={cn("h-full", cinzel.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
