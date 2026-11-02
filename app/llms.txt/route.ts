import { doors } from "@/data/doors";
import { guide } from "@/data/guide";
import { rivals } from "@/data/rivals";
import { site } from "@/lib/seo";

// The site in the shape a language model reads (llmstxt.org): what Lodestar
// is, the facts an answer needs, and a line per page. Built from the same
// data as the pages, so it never says what they do not.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# Lodestar",
    "",
    "> Lodestar is a free Mac app by Vaccone Software: spelling and grammar checked as you type, any app or window one key and a letter away, clipboard history, and dictation you can edit. Everything runs on the Mac. It is not the Ethereum client of the same name.",
    "",
    "- Price: free, with no account",
    "- Requires: macOS 27 or later on Apple silicon",
    "- Install: download the disk image from the site, or `brew install --cask vaccone-software/tap/lodestar`",
    "- Privacy: writing, voice and clipboard are processed on the Mac and never sent to a server",
    "- Source: https://github.com/Vaccone-Software/lodestar (Functional Source License, becoming MIT after two years)",
    "",
    "## What it does",
    "",
    ...doors.map((d) => `- [${d.title}](${site}/${d.slug}): ${d.description}`),
    "",
    "## Compared",
    "",
    ...rivals.map(
      (r) => `- [${r.title}](${site}/vs/${r.slug}): ${r.description}`,
    ),
    "",
    "## Guide",
    "",
    ...guide.map(
      (p) => `- [${p.title}](${site}/guide/${p.slug}): ${p.description}`,
    ),
    "",
    "## Optional",
    "",
    `- [Changelog](${site}/changelog): every release, in the words it shipped with`,
    `- [Evidence](${site}/evidence): the measurements behind the claims`,
    `- [Privacy](${site}/privacy): what stays on the Mac and what leaves it`,
    `- [Research](${site}/research): what Lodestar records for research`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
