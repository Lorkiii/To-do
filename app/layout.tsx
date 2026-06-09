import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/app/providers";
import { cookies } from "next/headers";
import type { Theme } from "@/types/settings";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme: Theme =
    cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  // return the html element with the geistSans and geistMono fonts and the body element with the children
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        initialTheme === "dark" && "dark",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
      )}>
      <body className="min-h-full flex flex-col">
        {/* Client-side authentication hooks require the shared session context. */}
        <Providers initialTheme={initialTheme}>{children}</Providers>
      </body>
    </html>
  );
}


