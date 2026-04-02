# ShipMax

A GitHub profile analyzer that ranks how hard you ship. Paste a username, get a rank, a score, and a roast. Built for fun and virality — people screenshot their rank and post it on X, others see it and want to try. The loop feeds itself.

Themed after **Solo Leveling**, the manhwa where hunters are ranked by power level. In ShipMax, your GitHub activity *is* your power level.

**[shipmax.dev](https://shipmax.dev)**

## What is Solo Leveling?

Solo Leveling is a Korean web novel and manhwa where hunters are ranked E through S based on their combat power. E-rank hunters are cannon fodder. S-rank hunters are national-level threats. The aesthetic is dark, dramatic, and game-like — system windows, blue glows, power assessments, and brutal rankings.

ShipMax borrows that energy. Your GitHub profile gets the hunter treatment: scanned, scored, ranked, and roasted.

## How the ranking works

Every profile is scored 0–100 across five categories, then combined with weights:

```
Final = (Consistency × 0.30) + (Activity × 0.25) + (Volume × 0.20) + (Stars × 0.15) + (Community × 0.10)
```

### Categories

**Consistency (30%)** — How many weeks out of 52 had at least one contribution. Showing up matters most.

**Recent Activity (25%)** — Your last 30 days compared to your monthly average. Are you shipping harder or slowing down?

**Volume (20%)** — Total contributions in the last year. 1,500+ maxes this out (~4/day).

**Stars (15%)** — Total stars across all public repos, log-scaled. 10,000+ stars hits 100.

**Community (10%)** — PRs + issues + code reviews. 300+ total maxes this out.

### Ranks

| Score | Rank | Title |
|-------|------|-------|
| 85–100 | **S** | National Level Hunter |
| 70–84 | **A** | S-Gate Survivor |
| 55–69 | **B** | B-Rank Hunter |
| 40–54 | **C** | C-Rank Hunter |
| 20–39 | **D** | E-Gate Fodder |
| 0–19 | **E** | Unawakened |

Each rank comes with a roast. S-rank hunters get told their git log should be reported to authorities. E-rank hunters get told their GitHub profile is a missing person case.

## Tech stack

- **Frontend**: React + Vite + TanStack Router + Tailwind CSS
- **Backend**: [Convex](https://convex.dev) (database, server functions, file storage, HTTP actions)
- **Hosting**: Vercel
- **Data**: GitHub GraphQL API
- **Sharing**: OG image generation via Satori, bot detection via Vercel middleware, image download via html2canvas

## Running locally

```bash
bun install
npx convex dev          # starts Convex backend, creates .env.local
bun run dev             # starts Vite dev server
```

You'll need a GitHub personal access token set as a Convex env var for the GitHub API calls:

```bash
npx convex env set GITHUB_TOKEN your-token
```

## License

[MIT](LICENSE)
