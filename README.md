# lodestar-site

The Lodestar product page, in the app's own look (Ceramic, from the app's
design/ contracts): the homepage is the launcher with the four doors beside
it and the rest of Lodestar on a dimmed wall (components/home), beside the
guide, the changelog and a page for each door. Next.js, Tailwind.

```sh
bun install
bun run dev
bun run test        # typecheck, build, then every test
```

The stable channel is decided here: `GET /api/stable` (lib/server/stable.ts,
the rule in lib/promotion.ts). The server reads GitHub's releases list; set
`GITHUB_TOKEN` (a token with no permissions is enough) to lift the anonymous
limit of sixty requests an hour, on Vercel and when testing locally.

Bun only: `bun.lock` is the one lockfile, and `packageManager` in
package.json names the version. Vercel installs with Bun when it finds
`bun.lock`.

Deployed on Vercel. The product lives at
[Vaccone-Software/lodestar](https://github.com/Vaccone-Software/lodestar).
