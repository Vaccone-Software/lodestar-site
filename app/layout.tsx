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

export const metadata: Metadata = {
  title: "Lodestar · keyboard navigation for macOS",
  description:
    "Destination over process. Every gesture names a destination, and the system takes you there: full screen, instantly, silently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={maple.variable}>
      <body>{children}</body>
    </html>
  );
}
