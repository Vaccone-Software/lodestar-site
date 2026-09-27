import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import { latestRelease } from "@/lib/releases";
import { appJsonLd, graph } from "@/lib/seo";

export default async function Page() {
  const { tag } = await latestRelease();
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
