import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import { stableRelease } from "@/lib/server/stable";
import { appJsonLd, graph } from "@/lib/seo";

export default async function Page() {
  const { tag } = await stableRelease();
  return (
    <main id="main" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: graph(appJsonLd(tag)) }}
      />
      <Nav tag={tag} over />
      <Hero tag={tag} />
    </main>
  );
}
