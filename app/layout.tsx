import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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
        <div className="flex min-h-screen">
          {/* This is the foundation for your Vertical Sidebar on the left */}
          <aside className="w-64 border-r border-champagne/20 bg-navy hidden md:block">
            {/* We will build the Sidebar navigation in the next step */}
          </aside>
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
