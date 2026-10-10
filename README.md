# lodestar-site

The Lodestar product page. Next.js, Tailwind, Maple Mono, one page.

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
