import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});


// set the font for the page
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// set the font for the monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// set the title and description of the page
export const metadata: Metadata = {
  title: "Lazylet",
  description: "A calmer way to manage your tasks.",
};

// root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // return the html element with the geistSans and geistMono fonts and the body element with the children
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", dmSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
