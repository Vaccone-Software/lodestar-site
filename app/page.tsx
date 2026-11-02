import type { Metadata } from "next";
import Home from "@/components/home/Home";
import Nav from "@/components/Nav";
import { downloadFor } from "@/lib/releases";
import { stableRelease } from "@/lib/server/stable";
import { appJsonLd, graph, makerJsonLd, siteJsonLd } from "@/lib/seo";
import { metadata as root } from "./layout";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...root.openGraph, url: "/" },
};

export default async function Page() {
  const { tag } = await stableRelease();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(appJsonLd(tag), siteJsonLd(), makerJsonLd()),
        }}
      />
      <Home
        tag={tag}
        download={downloadFor(tag)}
        nav={<Nav tag={tag} withDoors={false} />}
      />
    </>
  );
}
