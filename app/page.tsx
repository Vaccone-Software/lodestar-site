import Room from "@/components/room/Room";
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
      <Room tag={tag} />
    </>
  );
}
