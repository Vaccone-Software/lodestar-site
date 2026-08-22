import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const maple = localFont({
  src: [
    { path: "../public/fonts/MapleMono-Regular.woff2", weight: "400" },
    { path: "../public/fonts/MapleMono-Medium.woff2", weight: "500" },
    { path: "../public/fonts/MapleMono-Bold.woff2", weight: "700" },
  ],
  variable: "--font-maple",
  display: "swap",
});

const description =
  "An opinionated way to navigate and operate your computer. Applications arrive maximized under letters you assign, with click hints, text selection, app commands, keyboard scrolling, browser routing and clipboard history in one grammar.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lodestar.vaccone.software"),
  title: "Lodestar · keyboard navigation for macOS",
  description,
  openGraph: {
    title: "Lodestar · keyboard navigation for macOS",
    description,
    url: "/",
    siteName: "Lodestar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar · keyboard navigation for macOS",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={maple.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
