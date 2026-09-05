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

const description =
  "Lodestar turns every place you go on your Mac into a destination you can name from the keyboard: applications, pages, buttons, text on screen, what you copied, what you say. It learns which ones you reach for. Nothing leaves your Mac.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lodestar.vaccone.software"),
  title: "Lodestar · name where you want to be, and you are there",
  description,
  openGraph: {
    title: "Lodestar",
    description,
    url: "/",
    siteName: "Lodestar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${maple.variable} ${newsreader.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
