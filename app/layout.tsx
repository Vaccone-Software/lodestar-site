import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

// Self-hosted at build, with metric-matched fallbacks, so the page never
// shifts when the faces arrive. On a Mac the system faces answer first (SF
// for the interface, SF Mono for the hand, New York for the voice); these
// stand in where the system has none of them.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

// The room runs to the screen's edges, so a notch is the page's to respect.
export const viewport: Viewport = { viewportFit: "cover" };

// The page speaks in its own voice; the title and description speak in
// the words a search is typed in. Both are true, and they meet here.
const description =
  "Lodestar is a free Mac app: spelling and grammar checked as you type, any app or window one key and a letter away, everything you copy kept and searchable, and dictation you can edit before it lands.";

// Every page carries the stable download, so every page is rebuilt in the
// background at most five minutes after stable moves. A page built while
// GitHub could not be reached links to the releases page until then.
export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL("https://lodestar.vaccone.software"),
  title: {
    default: "Lodestar: Free Grammar, Clipboard and Dictation Tools for Mac",
    template: "%s · Lodestar",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lodestar · Everything one key away",
    description,
    url: "/",
    siteName: "Lodestar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar · Everything one key away",
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
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrains.variable} ${newsreader.variable}`}
    >
      <body>
        <a
          href="#main"
          className="bg-ground text-ink border-hairline sr-only fixed top-3 left-3 z-[60] border px-4 py-2 text-[13px] focus:not-sr-only"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
