import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolvedSuite Profit Calculator - AI-Powered Pricing for Handmade Creators",
  description: "Stop guessing. Start profiting. The AI-powered profit calculator that helps handmade creators optimize pricing, reduce material costs, and increase profits.",
  keywords: ["handmade pricing", "craft calculator", "profit calculator", "Etsy pricing", "handmade business", "AI pricing tool"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}