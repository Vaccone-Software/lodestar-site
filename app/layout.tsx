import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import Sky from "@/components/Sky";
import "./globals.css";

// Self-hosted at build, with metric-matched fallbacks, so the page never
// shifts when the faces arrive.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

// The page speaks in its own voice; the title and description speak in
// the words a search is typed in. Both are true, and they meet here.
const description =
  "Lodestar is a free Mac app: spelling and grammar checked as you type in every app, any app or window one key and a letter away, everything you copy kept and searchable, and dictation you can edit before it lands.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lodestar.vaccone.software"),
  title: {
    default: "Lodestar · free tools that make your Mac second nature",
    template: "%s · Lodestar",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lodestar · Master your Mac",
    description,
    url: "/",
    siteName: "Lodestar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar · Master your Mac",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#main"
          className="bg-ground text-ink border-hairline sr-only fixed top-3 left-3 z-[60] border px-4 py-2 text-[13px] focus:not-sr-only"
        >
          Skip to content
        </a>
        <Sky />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
