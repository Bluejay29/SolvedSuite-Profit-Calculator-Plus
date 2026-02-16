import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient"; // We will create this next to handle the "brain"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolvedSuite Maker's Profit Hub",
  description: "The premium AI-powered profit suite for handmade and service-based business owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-navy text-pearl`}>
        {/* We move the login logic to a "Client" file to keep the Metadata working */}
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
