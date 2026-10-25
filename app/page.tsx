import Home from "@/components/home/Home";
import Nav from "@/components/Nav";
import { downloadFor } from "@/lib/releases";
import { stableRelease } from "@/lib/server/stable";
import { appJsonLd, graph } from "@/lib/seo";

export default async function Page() {
  const { tag } = await stableRelease();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: graph(appJsonLd(tag)) }}
      />
      <Home tag={tag} download={downloadFor(tag)} nav={<Nav tag={tag} withDoors={false} />} />
    </>
  );
}
