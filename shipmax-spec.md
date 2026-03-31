# shipmax.dev — Product Spec

## What We're Building

A viral GitHub profile analyzer. You paste your GitHub username and get rated on how hard you ship. The result is presented as a Solo Leveling hunter rank with savage roasts and a detailed stat breakdown.

The goal is virality. Fast input. Dramatic output. Easy sharing. People screenshot their rank and post it on X. Others see it and want to try. The loop feeds itself.

---

## Tech Stack

- **Frontend**: React + Vite + TanStack Router
- **Backend**: Convex (database, actions, queries, mutations, HTTP actions)
- **Hosting**: Vercel (static SPA)
- **Styling**: Tailwind CSS + custom CSS for glow effects and animations
- **Data source**: GitHub GraphQL API (called from Convex actions with a server-side token)
- **OG image sharing**: Vercel middleware (bot detection) + Convex HTTP action (serves OG meta tags) + Satori or pre-generated images stored in Convex file storage
- **Image download**: html2canvas or Canvas API to generate a PNG of the result card

---

## Theme & Visual Direction

**Solo Leveling system interface.** One theme. Dark. Blue. Game HUD energy.

### Colors

- **Background**: #040710 (deep navy/black)
- **Background gradient**: `radial-gradient(ellipse at 50% 25%, rgba(30, 64, 175, 0.12) 0%, transparent 50%), linear-gradient(180deg, #040710 0%, #040710 50%, #081225 100%)`
- **Primary blue**: #3b82f6 (base) to #60a5fa (light) to #93c5fd (lightest)
- **Text primary**: #dbeafe
- **Text secondary**: rgba(219, 234, 254, 0.5)
- **Text dim**: rgba(96, 165, 250, 0.35-0.5) for labels and links
- **Border primary**: rgba(59, 130, 246, 0.2)
- **Border subtle**: rgba(59, 130, 246, 0.08-0.12)
- **Panel backgrounds**: rgba(59, 130, 246, 0.02-0.06)
- **Rank colors**:
  - S rank: Gold #fbbf24 with gold glow, border rgba(251, 191, 36, 0.5)
  - A rank: Purple #a78bfa with purple glow
  - B rank: Blue #3b82f6 with blue glow
  - C rank: Green #22c55e with green glow
  - D rank: Grey #6b7280 with dim glow
  - E rank: Red #ef4444 with red glow
- **Error state**: rgba(239, 68, 68, 0.3) border, rgba(239, 68, 68, 0.7) text

### Typography

- **Cinzel Decorative** — ONLY for the "SHIPMAX" title/logo text. 56-64px on desktop, 36px on mobile. Bold 700. Color #dbeafe with letter-spacing 4-8px.
- **Chakra Petch** — Everything else. All UI text, labels, buttons, body, stats, headings. Angular, game-like, good weight range.
  - Page headings: 32px, weight 700, letter-spacing 4px
  - Body text: 13-16px, weight 400-500
  - Stat labels: 10-12px, weight 600, letter-spacing 1-3px, color rgba(96, 165, 250, 0.5)
  - Button text: 13-14px, weight 600-700, letter-spacing 2-3px
  - System labels (CONTRIBUTION HISTORY, HUNTER STATS, etc.): 9-11px, weight 600, letter-spacing 2-3px, color rgba(96, 165, 250, 0.35-0.4)

### HUD Frame Treatment

All pages share the same system window frame aesthetic:
- 1px border at rgba(59, 130, 246, 0.12) around the content area, inset 16px from edges
- Diamond accent decorations at top center (two rotated squares connected by lines)
- Bottom status bar: "SYSTEM.READY" with dot indicator on left, signal bars on right
- Background gradient: radial glow at top fading to deep navy at bottom

### Interactive States Pattern

All interactive elements follow the same state progression:
- **Default**: Base opacity borders and fills
- **Hover**: Brighter border (+0.2 opacity), slightly brighter fill, glow box-shadow appears (0 0 20px rgba(59, 130, 246, 0.15)), text brightens
- **Active**: Brightest border and fill, text at full brightness
- **Disabled**: Ghost state, barely visible (0.12 opacity border, 0.2 opacity text)

---

## Routes

### `/` — Home

The main page. Centered layout. No split/two-column.

**Layout (top to bottom):**

1. **Header area**
   - "SHIPMAX" in Cinzel Decorative, centered
   - "RANK PROTOCOL" subtitle with flanking gradient lines
   - System window frame border around entire page

2. **Leaderboard strip (compact, centered)**
   - Horizontal row of top 3 hunters as compact cards (avatar square + username + rank letter)
   - Cards grouped tight (1px gap between them)
   - "View all →" button separated with 16px gap from the card group
   - Each card: 1px border rgba(59, 130, 246, 0.12-0.2), square avatar placeholder, Chakra Petch username, rank letter in rank color
   - Links to `/leaderboard`

3. **Input + Analyze (center, prominent)**
   - Subtitle: "Enter a hunter's name to reveal their true power"
   - Input and ANALYZE button in one bordered frame (1px border rgba(59, 130, 246, 0.2))
   - ANALYZE button: Glass HUD style — `background: linear-gradient(180deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))`, `border: 1px solid rgba(96, 165, 250, 0.4)`, text color #93c5fd
   - Placeholder: "GitHub username..."

4. **How it works (bottom, subtle)**
   - "How is my rank calculated?" link in rgba(96, 165, 250, 0.45)
   - Links to `/formula`

**After submission (loading state):**

System messages type out one by one:
```
"Accessing hunter database..."
"Scanning contribution history..."
"Analyzing commit patterns..."
"Assessment complete."
```

Then redirects to `/u/[username]` profile page.

### `/u/[username]` — Profile Page

Permanent shareable link. Centered hero layout.

**Layout (top to bottom):**

1. **Avatar** — 90px round, gradient placeholder, 3px border in rank color with glow
2. **Username** — 22px Chakra Petch, #dbeafe
3. **Rank letter** — 100px Cinzel Decorative, rank color (e.g. #fbbf24 for S)
4. **Rank title** — 12px Chakra Petch, letter-spacing 5px, rank color at 0.5 opacity (e.g. "NATIONAL LEVEL HUNTER")
5. **Score** — 32px bold rank color + "/100" dim
6. **Leaderboard position** — "#4 of 2,847 hunters ranked" centered
7. **Roast text** — Italic, 13px, rgba(219, 234, 254, 0.4), max-width 500px centered
8. **Stat bars** — 5 horizontal bars, full word labels (Consistency, Activity, Volume, Stars, Community), gradient fill (#2563eb to #60a5fa), score number on right
9. **Contribution grid** — Full-width blue heatmap (52 weeks x 7 days), dark squares (#0a1628) for no activity, varying blue intensities for activity (#2563eb → #3b82f6 → #60a5fa → #93c5fd), brighter toward recent weeks
10. **Fun stats strip** — 5 stat boxes in a row: STREAK, BEST STREAK, MOST ACTIVE, TOP LANG, TOTAL STARS
11. **Share buttons** — "Share on X" (with X SVG icon, glass HUD primary style) + "DOWNLOAD IMAGE" (outline secondary style)
12. **"Analyze another hunter →"** link

**Data behavior:**
- Data comes from Convex database (cached result)
- If user hasn't been analyzed yet, trigger analysis on the fly
- Show "Last scanned: Xh ago" in bottom status bar
- Cache for 24 hours, serve cached result if within window

**OG tags (served to bots via Vercel middleware + Convex HTTP action):**
- `og:title`: "torvalds is an S RANK HUNTER on ShipMax"
- `og:description`: "Score: 97/100 — National Level Hunter. Are you shipping harder?"
- `og:image`: Dynamic image showing avatar, rank, score on Solo Leveling themed card

**Mobile adaptation:**
- Avatar 72px, rank letter 80px
- Stat bars full-width with smaller labels (10px)
- Fun stats in 3+2 grid instead of 5-column row
- Share buttons stacked full-width
- No contribution grid on mobile (too small to be useful)

### `/leaderboard` — Full Leaderboard

Full page ranked list.

- Header: "NATIONAL RANKINGS" with "2,847 HUNTERS RANKED" subtitle
- Table with columns: # position, Avatar (round), Username, Rank letter (colored), Score
- #1 gets gold highlight row background rgba(251, 191, 36, 0.03)
- All rows clickable, link to `/u/[username]`
- Fetch all hunters, use virtualization/occlusion for performance (can be added post-v1)
- No pagination or "load more" — just render all

**Mobile adaptation:**
- Compact rows, no column headers
- Position + avatar + username + rank + score in each row

### `/formula` — How It Works

System blueprint page explaining the scoring.

- Header: "HOW YOUR RANK IS CALCULATED" with "SYSTEM BLUEPRINT" subtitle
- Formula bar: `Final = (Consistency × 0.30) + (Activity × 0.25) + (Volume × 0.20) + (Stars × 0.15) + (Community × 0.10)`
- 5 category cards in 2x2 + 1 grid (desktop) or stacked (mobile):
  - Each card: category name, weight %, description, scoring formula/thresholds
- Rank thresholds section: 6 rank cards in a row (S gold, A purple, B blue, C green, D grey, E red) with score range and title
- "← Back to home" link

---

## Scoring Formula

### Data We Fetch (GitHub GraphQL API)

For each username we pull:
- `contributionsCollection` (last 365 days):
  - `contributionCalendar`: total contributions, weeks array with day-by-day counts
  - `totalCommitContributions`
  - `totalPullRequestContributions`
  - `totalIssueContributions`
  - `totalPullRequestReviewContributions`
- `repositories`: total count, stars per repo (to sum total stars)
- `followers`: total count
- `pinnedItems`: pinned repos
- `createdAt`: account age
- `avatarUrl`
- `bio`

### Scoring Categories (0-100 each, then weighted)

#### 1. Consistency (30% weight)

How many weeks out of 52 had at least 1 contribution.

| Active weeks | Score |
|---|---|
| 48-52 | 90-100 |
| 40-47 | 70-89 |
| 30-39 | 50-69 |
| 20-29 | 30-49 |
| 10-19 | 15-29 |
| 0-9 | 0-14 |

Linear interpolation within each band.

#### 2. Recent Activity (25% weight)

Contributions in the last 30 days compared to the monthly average over the year.

```
monthly_avg = total_contributions / 12
recent_30d = contributions in last 30 days
ratio = recent_30d / monthly_avg
```

- Ratio > 1.5 = 80-100
- Ratio 1.0-1.5 = 60-79
- Ratio 0.5-1.0 = 30-59
- Ratio < 0.5 = 0-29

Edge case: if total contributions = 0, score = 0.

#### 3. Volume (20% weight)

Total contributions in the last year.

```
score = min(100, (contributions / 1500) * 100)
```

1500+ contributions maxes this out (~4/day).

#### 4. Stars / Reputation (15% weight)

Total stars across all public repos. Log scaled.

```
score = min(100, (log10(total_stars + 1) / log10(10000)) * 100)
```

- 0 stars = 0
- 10 stars ~ 25
- 100 stars ~ 50
- 1000 stars ~ 75
- 10000+ stars = 100

#### 5. Community Engagement (10% weight)

PRs opened + issues opened + PR reviews.

```
engagement = prs + issues + reviews
score = min(100, (engagement / 300) * 100)
```

300+ total actions maxes this out.

### Final Score

```
final = (consistency * 0.30) + (recent * 0.25) + (volume * 0.20) + (stars * 0.15) + (community * 0.10)
```

### Rank Thresholds

| Score | Rank | Title | Roast |
|---|---|---|---|
| 85-100 | S | NATIONAL LEVEL HUNTER | "You mass report people with green GitHub graphs because yours is greener. Sleep is a mass delusion you've opted out of." |
| 70-84 | A | S-GATE SURVIVOR | "Your git log is longer than your screen time report and both should be reported to authorities." |
| 55-69 | B | B-RANK HUNTER | "You ship. Not daily. But enough that your GitHub doesn't need a welfare check." |
| 40-54 | C | C-RANK HUNTER | "You open VS Code. Stare at it. Open Twitter. Close Twitter. Open VS Code. Repeat." |
| 20-39 | D | E-GATE FODDER | "You starred 200 repos and built nothing. You are the mass audience." |
| 0-19 | E | UNAWAKENED | "Your GitHub profile is a missing person case. Even your README gave up and left." |

Write 3-5 roast variants per rank so it doesn't get stale. Pick one at random each time.

---

## Convex Data Model

### `users` table

```typescript
{
  username: string,           // GitHub username (unique)
  avatarUrl: string,          // GitHub avatar URL
  rank: string,               // "S" | "A" | "B" | "C" | "D" | "E"
  rankTitle: string,          // "NATIONAL LEVEL HUNTER" etc.
  score: number,              // 0-100 final score
  roast: string,              // The roast text they received
  stats: {
    consistency: number,      // 0-100
    recentActivity: number,   // 0-100
    volume: number,           // 0-100
    stars: number,            // 0-100
    community: number,        // 0-100
  },
  rawData: {
    totalContributions: number,
    activeWeeks: number,
    currentStreak: number,
    longestStreak: number,
    totalStars: number,
    totalPRs: number,
    totalIssues: number,
    totalReviews: number,
    topLanguage: string,
    mostActiveDay: string,    // "Monday", "Tuesday", etc.
    recentContributions: number, // last 30 days
    contributionCalendar: any,  // week/day breakdown for rendering the grid
  },
  analyzedAt: number,         // timestamp of last analysis
}
```

### Indexes

- By `username` for lookups and upserts
- By `score` descending for leaderboard queries

### Convex Functions

- **Action: `analyzeUser(username)`** — Calls GitHub GraphQL API, computes score, calls mutation to save/update the user, returns the full result to the frontend
- **Mutation: `saveResult(data)`** — Upserts the user row in the database
- **Query: `getUser(username)`** — Fetch a single user's result (for `/u/[username]` page)
- **Query: `getLeaderboard()`** — All users sorted by score descending (virtualize on frontend)
- **Query: `getRecentlyAnalyzed(limit)`** — Users sorted by `analyzedAt` descending (for the home page mini-leaderboard)
- **HTTP Action: `GET /og/[username]`** — Returns HTML with OG meta tags for social sharing. Called by Vercel middleware when a bot hits `/u/[username]`.

---

## Sharing System

### Share on X

Button with X SVG icon + "SHARE ON X" text. Opens: `https://twitter.com/intent/tweet?text=I'm%20a%20[RANK]%20RANK%20HUNTER%20on%20ShipMax%20Score:%20[SCORE]/100&url=https://shipmax.dev/u/[username]`

The link preview card on X shows the OG image with their rank and avatar.

### Download Image

Uses `html2canvas` or Canvas API to capture the result panel as a PNG. Downloads to the user's device. Sized for general social sharing (1200x630).

### OG Image Generation

When a user gets analyzed, generate a static OG image and store it in Convex file storage. The image shows: dark background, avatar, rank letter, score, username on the Solo Leveling themed card. The Convex HTTP action points `og:image` to this stored image URL.

### Vercel Middleware for Bot Detection

A `middleware.ts` file in the Vercel project. Checks the user agent on `/u/*` routes. If it's a known bot (Twitterbot, facebookexternalhit, Discordbot, etc.), redirect/rewrite to the Convex HTTP action URL that serves the OG HTML. Normal users get the SPA.

---

## UX Flow

### First time visitor

1. Lands on `shipmax.dev`. Sees dark Solo Leveling themed page with gradient glow. System window frame. Leaderboard strip at top with ranked hunters.
2. Eyes go to the centered input. Types their GitHub username.
3. Hits "ANALYZE" (glass HUD button).
4. Loading sequence plays with system messages typing out.
5. Redirected to `/u/[username]`. Rank letter appears huge. Roast types out. Stat bars fill. Contribution grid draws.
6. User sees their position (#X of Y hunters ranked). Checks stats. Laughs or cries at roast.
7. Hits "Share on X" (with X icon) or downloads the image. Posts it. Loop feeds itself.

### Returning visitor

1. Checks leaderboard for new names.
2. Re-analyzes to see if rank changed.
3. Analyzes friends' usernames to roast them.

### Visitor from a shared link

1. Clicks `shipmax.dev/u/someguy` on X.
2. Sees full result card with rank, stats, contribution grid.
3. Clicks "Analyze another hunter →" which goes to `/`.
4. Loop continues.

---

## Edge Cases

- **Username doesn't exist on GitHub**: System error: "HUNTER NOT FOUND IN DATABASE." Red border on input field, red text.
- **Private profile / no public data**: "INSUFFICIENT DATA. This hunter operates in the shadows." E rank or custom message.
- **GitHub API rate limit**: Cache in Convex. If analyzed in last 24 hours, serve cached result. Show "Last scanned: Xh ago" in status bar.
- **Brand new account with zero activity**: E rank. "You just awakened. Your journey begins now." Slightly less savage for beginners.
- **Insanely high stats (Torvalds, etc.)**: S rank still earned. Consider "SHADOW MONARCH" for top 1%.

---

## Design Reference

All designs are in Paper file "Shipmax". Key frames:
- **Main Frame -- Home** (desktop home page with system window frame)
- **Main Frame -- Profile** (desktop profile with contribution grid heatmap)
- **Mobile -- Home** (390px mobile home)
- **Mobile -- Profile** (390px mobile profile)
- **Desktop -- Formula** (scoring explanation page)
- **Desktop -- Leaderboard** (full rankings table)
- **Mobile -- Formula** (390px)
- **Mobile -- Leaderboard** (390px)
- **Component States -- Home** (button/input/card states)
- **Component States -- Profile** (share button/link states)
