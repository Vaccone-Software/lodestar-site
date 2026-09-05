import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Sky from "@/components/Sky";
import "./globals.css";

const maple = localFont({
  src: [
    { path: "../public/fonts/MapleMono-Regular.woff2", weight: "400" },
    { path: "../public/fonts/MapleMono-Medium.woff2", weight: "500" },
  ],
  variable: "--font-maple",
  display: "swap",
});

// One serif for everything that is read. Newsreader carries an optical
// size axis, so the same family sets a headline at 72 and a paragraph at
// 17 with the right cut for each, and the page reads as one voice.
const newsreader = localFont({
  src: [
    {
      path: "../public/fonts/Newsreader-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../public/fonts/Newsreader-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

// The page speaks in its own voice; the title and description speak in
// the words a search is typed in. Both are true, and they meet here.
const description =
  "Keyboard navigation for macOS: an app launcher, window management, click-by-letter, text selection by typing, clipboard history, and on-device dictation, in one grammar under one key. Lodestar learns which destinations you reach for and offers the next shortcut. Nothing leaves your Mac.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lodestar.vaccone.software"),
  title: {
    default: "Lodestar · keyboard navigation for macOS",
    template: "%s · Lodestar",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lodestar · your Mac, under one key",
    description,
    url: "/",
    siteName: "Lodestar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar · your Mac, under one key",
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
    <html lang="en" className={`${maple.variable} ${newsreader.variable}`}>
      <body>
        <a
          href="#main"
          className="bg-ground text-ink border-hairline sr-only fixed top-3 left-3 z-[60] border px-4 py-2 font-mono text-[12px] focus:not-sr-only"
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
