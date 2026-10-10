import type { NextConfig } from "next";

// A few headers every page and endpoint carries. No Content-Security-Policy:
// Next writes its payload in inline scripts, so a policy that allowed them
// would protect little, and one with nonces would render every page on
// every request instead of once. Vercel adds Strict-Transport-Security.
const headers = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const config: NextConfig = {
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers }];
  },
};

export default config;
