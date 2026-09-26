import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import { dmgFor, latestRelease } from "@/lib/releases";

export default async function Page() {
  const { tag } = await latestRelease();
  const version = tag.replace(/^v/, "");
  // What a search engine is told, in its own vocabulary: a free macOS
  // application, its version, and where the build lives.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lodestar",
    operatingSystem: "macOS 14 or later (Apple silicon)",
    applicationCategory: "UtilitiesApplication",
    description:
      "Free tools for the Mac: spelling and grammar checked in every app, any app or window one key and a letter away, clipboard history, and dictation you can edit.",
    url: "https://lodestar.vaccone.software/",
    softwareVersion: version,
    downloadUrl: dmgFor(tag),
    releaseNotes: "https://lodestar.vaccone.software/changelog",
    license: "https://github.com/Vaccone-Software/lodestar/blob/main/LICENSE.md",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Vaccone Software" },
  };
  return (
    <main id="main" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav tag={tag} over />
      <Hero tag={tag} />
    </main>
  );
}
