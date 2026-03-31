# GitHub GraphQL API Reference for Profile Analyzer

Complete reference document for building a GitHub profile analyzer. All field names, types,
and behaviors were verified against the live GitHub GraphQL API via schema introspection
on 2026-03-30.

---

## 1. Endpoint and Authentication

### Endpoint
```
POST https://api.github.com/graphql
```

All GraphQL operations (queries and mutations) go to this single endpoint.

### Authentication Header
```
Authorization: bearer <TOKEN>
```

### Token Types That Work
- **Personal Access Token (classic)**: Needs `read:user` scope for user profile data. The `repo` scope is needed only if you want to include private repository data in contributions.
- **Personal Access Token (fine-grained)**: All fine-grained tokens automatically include read access to public data. No special permissions needed for public profile + contribution data.
- **OAuth App tokens**: Work after user authorizes the app.
- **GitHub App installation tokens**: Work for the repositories/orgs the app is installed on.

### Minimum Scopes for Our Use Case
For a public profile analyzer that reads user profiles, public contributions, and public repos:
- **Fine-grained PAT**: No additional permissions beyond the default (public read access).
- **Classic PAT**: `read:user` scope is sufficient. Add `repo` scope if you also want private contribution counts to be included.
- **For the `email` field**: The `user:email` scope is required on classic PATs to see the user's email.

### Important: Public Data Access
The GitHub GraphQL API **requires authentication** even for public data. There is no unauthenticated access (unlike the REST API which allows limited unauthenticated requests).

---

## 2. Rate Limits

### Primary Rate Limit
| Authentication Type | Points Per Hour |
|---|---|
| Personal access token (user) | 5,000 |
| Enterprise Cloud user | 10,000 |
| GitHub App installation | 5,000 (scales up to 12,500) |
| GitHub Actions `GITHUB_TOKEN` | 1,000 |

### Our Query Cost
**The full profile query (user + repos + contributions + calendar) costs exactly 1 point.**
This was verified live. At 5,000 points/hour, you can make ~5,000 full profile lookups per hour.

### Secondary Rate Limits
- Max **100 concurrent requests**
- Max **2,000 points per minute** for GraphQL
- Max **60 seconds of CPU time** per 60 seconds of real time for GraphQL
- Queries that exceed **10 seconds** to process are terminated

### Node Limits
- Max **500,000 total nodes** per query
- `first` and `last` arguments must be within **1-100**

### Monitoring Rate Limits
Include `rateLimit` in your query to check usage:
```graphql
{
  rateLimit {
    limit       # Int! - Max points per hour
    cost        # Int! - Cost of THIS query
    remaining   # Int! - Points remaining
    resetAt     # DateTime! - When the window resets
    nodeCount   # Int! - Nodes consumed by this query
  }
}
```

Response headers also include:
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Used`, `X-RateLimit-Reset`

---

## 3. Complete Type Reference

### 3.1 Root Query

```graphql
user(login: String!): User
```

Returns `null` if the user does not exist (no error thrown).

Also available: `viewer: User!` returns the authenticated user without needing a login argument.

---

### 3.2 User Object

Verified fields relevant to profile analysis:

| Field | Type | Arguments | Notes |
|---|---|---|---|
| `login` | `String!` | none | The username (e.g. "octocat") |
| `name` | `String` | none | Display name. Nullable (user may not set it). |
| `avatarUrl` | `URI!` | `size: Int` | Optional size in pixels (renders square). |
| `bio` | `String` | none | Nullable. |
| `createdAt` | `DateTime!` | none | Account creation date. ISO 8601 format. |
| `email` | `String!` | none | Non-null but may be empty string `""` if not public. Requires `user:email` scope for private email. |
| `location` | `String` | none | Nullable. |
| `company` | `String` | none | Nullable. |
| `websiteUrl` | `URI` | none | Nullable. |
| `twitterUsername` | `String` | none | Nullable. |
| `pronouns` | `String` | none | Nullable. |
| `url` | `URI!` | none | The GitHub profile URL. |
| `id` | `ID!` | none | Global node ID. |
| `databaseId` | `Int` | none | Numeric database ID. |
| `followers` | `FollowerConnection!` | `after, before, first, last` | Use `followers { totalCount }` to just get the count. |
| `following` | `FollowingConnection!` | `after, before, first, last` | Use `following { totalCount }` to just get the count. |
| `repositories` | `RepositoryConnection!` | See below | Complex arguments. |
| `contributionsCollection` | `ContributionsCollection!` | `organizationID: ID, from: DateTime, to: DateTime` | **Key field.** See section 3.4. |
| `socialAccounts` | `SocialAccountConnection!` | `after, before, first, last` | Social media links. |
| `starredRepositories` | `StarredRepositoryConnection!` | `after, before, first, last, ownedByViewer, orderBy` | Repos the user starred. |
| `status` | `UserStatus` | none | Custom status (emoji + message). |

#### User.repositories Arguments (all optional)

| Argument | Type | Notes |
|---|---|---|
| `first` | `Int` | 1-100. Use this for forward pagination. |
| `last` | `Int` | 1-100. Use this for backward pagination. |
| `after` | `String` | Cursor for forward pagination. |
| `before` | `String` | Cursor for backward pagination. |
| `ownerAffiliations` | `[RepositoryAffiliation]` | Use `OWNER` to get only repos owned by the user. |
| `privacy` | `RepositoryPrivacy` | `PUBLIC` or `PRIVATE`. |
| `visibility` | `RepositoryVisibility` | `PUBLIC`, `PRIVATE`, or `INTERNAL`. |
| `orderBy` | `RepositoryOrder` | e.g. `{field: STARGAZERS, direction: DESC}` |
| `isFork` | `Boolean` | Filter forks in or out. |
| `isArchived` | `Boolean` | Filter archived repos. |
| `isLocked` | `Boolean` | Filter locked repos. |
| `hasIssuesEnabled` | `Boolean` | Filter by issues enabled. |
| `affiliations` | `[RepositoryAffiliation]` | `OWNER`, `COLLABORATOR`, `ORGANIZATION_MEMBER`. |

---

### 3.3 Repository Object

| Field | Type | Arguments | Notes |
|---|---|---|---|
| `name` | `String!` | none | Repo name without owner prefix. |
| `nameWithOwner` | `String!` | none | e.g. "octocat/hello-world" |
| `description` | `String` | none | Nullable. |
| `url` | `URI!` | none | The GitHub URL. |
| `stargazerCount` | `Int!` | none | **Total stars.** Use this, not `stargazers.totalCount` (avoids extra nesting). |
| `stargazers` | `StargazerConnection!` | `after, before, first, last, orderBy` | Full connection if you need individual stargazer data. |
| `primaryLanguage` | `Language` | none | Nullable. The main language of the repo. |
| `languages` | `LanguageConnection` | `after, before, first, last, orderBy: LanguageOrder` | Full language breakdown. See section 3.6. |
| `isPrivate` | `Boolean!` | none | |
| `isFork` | `Boolean!` | none | |
| `forkCount` | `Int!` | none | |
| `createdAt` | `DateTime!` | none | |
| `updatedAt` | `DateTime!` | none | |
| `pushedAt` | `DateTime` | none | Nullable. Last push date. |
| `owner` | `RepositoryOwner!` | none | The user or org that owns the repo. |
| `id` | `ID!` | none | |

#### RepositoryConnection Fields

| Field | Type | Notes |
|---|---|---|
| `nodes` | `[Repository]` | The repository objects. |
| `edges` | `[RepositoryEdge]` | Edges with cursor + node. |
| `totalCount` | `Int!` | Total number of repos matching the filter. |
| `totalDiskUsage` | `Int!` | Total disk usage across all matched repos. |
| `pageInfo` | `PageInfo!` | Has `hasNextPage`, `endCursor`, `hasPreviousPage`, `startCursor`. |

---

### 3.4 ContributionsCollection Object

**Arguments on `User.contributionsCollection`:**

| Argument | Type | Notes |
|---|---|---|
| `from` | `DateTime` | Start of the time range. ISO 8601 format. |
| `to` | `DateTime` | End of the time range. ISO 8601 format. |
| `organizationID` | `ID` | Filter contributions to a specific organization. |

**Default behavior (no `from`/`to`):** Returns the last ~365 days (one full year from today's date). The exact range is from the user's timezone-adjusted anniversary of today minus one year to now.

**Maximum range:** One year. You cannot query more than 365 days in a single `contributionsCollection`. To get multi-year data, use aliases (see section 6).

**The `contributionYears` field returns ALL years the user has ever contributed, regardless of the `from`/`to` range.** This is useful for knowing which years to query.

#### All Fields

| Field | Type | Arguments | Notes |
|---|---|---|---|
| `contributionCalendar` | `ContributionCalendar!` | none | **The heatmap data.** See section 3.5. |
| `contributionYears` | `[Int!]!` | none | All years with contributions, most recent first. e.g. `[2026, 2025, 2024, ...]` |
| `totalCommitContributions` | `Int!` | none | Commits in the time range. |
| `totalIssueContributions` | `Int!` | `excludeFirst: Boolean, excludePopular: Boolean` | Issues opened. |
| `totalPullRequestContributions` | `Int!` | `excludeFirst: Boolean, excludePopular: Boolean` | PRs opened. |
| `totalPullRequestReviewContributions` | `Int!` | none | PR reviews left. |
| `totalRepositoryContributions` | `Int!` | `excludeFirst: Boolean` | Repos created. |
| `totalRepositoriesWithContributedCommits` | `Int!` | none | Distinct repos committed to. |
| `totalRepositoriesWithContributedIssues` | `Int!` | `excludeFirst, excludePopular` | Distinct repos with issues opened. |
| `totalRepositoriesWithContributedPullRequests` | `Int!` | `excludeFirst, excludePopular` | Distinct repos with PRs opened. |
| `totalRepositoriesWithContributedPullRequestReviews` | `Int!` | none | Distinct repos with PR reviews. |
| `restrictedContributionsCount` | `Int!` | none | Contributions in private repos the viewer cannot see. |
| `hasAnyContributions` | `Boolean!` | none | Whether there are any contributions. |
| `hasAnyRestrictedContributions` | `Boolean!` | none | Whether there are private contributions. |
| `startedAt` | `DateTime!` | none | Start of the collection period. |
| `endedAt` | `DateTime!` | none | End of the collection period. |
| `doesEndInCurrentMonth` | `Boolean!` | none | |
| `isSingleDay` | `Boolean!` | none | |
| `hasActivityInThePast` | `Boolean!` | none | Activity before this range? |
| `commitContributionsByRepository` | `[CommitContributionsByRepository!]!` | `maxRepositories: Int` (default 25) | Commits grouped by repo. |
| `issueContributions` | `CreatedIssueContributionConnection!` | `after, before, first, last, orderBy, excludeFirst, excludePopular` | Individual issue contributions. |
| `issueContributionsByRepository` | `[IssueContributionsByRepository!]!` | `excludeFirst, excludePopular, maxRepositories` | Issues grouped by repo. |
| `pullRequestContributions` | `CreatedPullRequestContributionConnection!` | `after, before, first, last, orderBy, excludeFirst, excludePopular` | Individual PR contributions. |
| `pullRequestContributionsByRepository` | `[PullRequestContributionsByRepository!]!` | `excludeFirst, excludePopular, maxRepositories` | PRs grouped by repo. |
| `pullRequestReviewContributions` | `CreatedPullRequestReviewContributionConnection!` | `after, before, first, last, orderBy` | Individual review contributions. |
| `pullRequestReviewContributionsByRepository` | `[PullRequestReviewContributionsByRepository!]!` | `maxRepositories` | Reviews grouped by repo. |
| `repositoryContributions` | `CreatedRepositoryContributionConnection!` | `after, before, first, last, orderBy, excludeFirst` | Individual repo contributions. |
| `firstIssueContribution` | `CreatedIssueOrRestrictedContribution` | none | Nullable. |
| `firstPullRequestContribution` | `CreatedPullRequestOrRestrictedContribution` | none | Nullable. |
| `firstRepositoryContribution` | `CreatedRepositoryOrRestrictedContribution` | none | Nullable. |
| `popularIssueContribution` | `CreatedIssueContribution` | none | Most-commented issue. |
| `popularPullRequestContribution` | `CreatedPullRequestContribution` | none | Most-commented PR. |
| `joinedGitHubContribution` | `JoinedGitHubContribution` | none | When they joined. |
| `latestRestrictedContributionDate` | `Date` | none | |
| `earliestRestrictedContributionDate` | `Date` | none | |
| `mostRecentCollectionWithActivity` | `ContributionsCollection` | none | |
| `mostRecentCollectionWithoutActivity` | `ContributionsCollection` | none | |
| `user` | `User!` | none | Back-reference to the user. |

---

### 3.5 ContributionCalendar Structure

#### ContributionCalendar

| Field | Type | Notes |
|---|---|---|
| `totalContributions` | `Int!` | Sum of all contributions in the calendar period. |
| `weeks` | `[ContributionCalendarWeek!]!` | Array of week objects. Typically 53 weeks for a full year. |
| `months` | `[ContributionCalendarMonth!]!` | Array of month summaries. |
| `colors` | `[String!]!` | Hex color codes used in the calendar (light to dark). |
| `isHalloween` | `Boolean!` | Whether Halloween color scheme is active. |

#### ContributionCalendarWeek

| Field | Type | Notes |
|---|---|---|
| `contributionDays` | `[ContributionCalendarDay!]!` | Array of day objects (1-7 per week). |
| `firstDay` | `Date!` | The date of the earliest day in this week. |

#### ContributionCalendarDay

| Field | Type | Notes |
|---|---|---|
| `date` | `Date!` | The date in `YYYY-MM-DD` format (e.g. `"2026-03-30"`). |
| `contributionCount` | `Int!` | Number of contributions on this day. |
| `contributionLevel` | `ContributionLevel!` | Enum: `NONE`, `FIRST_QUARTILE`, `SECOND_QUARTILE`, `THIRD_QUARTILE`, `FOURTH_QUARTILE`. |
| `color` | `String!` | Hex color code (e.g. `"#9be9a8"`, `"#216e39"`). |
| `weekday` | `Int!` | Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday. |

#### ContributionLevel Enum Values

| Value | Meaning |
|---|---|
| `NONE` | No contributions (0). |
| `FIRST_QUARTILE` | Lowest 25% of active days. |
| `SECOND_QUARTILE` | Second lowest 25%. |
| `THIRD_QUARTILE` | Second highest 25%. |
| `FOURTH_QUARTILE` | Highest 25%. |

#### Sample Day Object (from live API)
```json
{
  "contributionCount": 4,
  "date": "2026-03-30",
  "color": "#9be9a8",
  "weekday": 1,
  "contributionLevel": "FIRST_QUARTILE"
}
```

---

### 3.6 Language Types

#### Language Object
| Field | Type | Notes |
|---|---|---|
| `id` | `ID!` | |
| `name` | `String!` | e.g. "TypeScript", "JavaScript", "Python" |
| `color` | `String` | Nullable hex color (e.g. `"#3178c6"` for TypeScript). Some languages have no color. |

#### LanguageConnection (returned by `Repository.languages`)
| Field | Type | Notes |
|---|---|---|
| `edges` | `[LanguageEdge]` | **Use this** to get language sizes. |
| `nodes` | `[Language]` | Just the language objects without size data. |
| `totalCount` | `Int!` | Number of distinct languages. |
| `totalSize` | `Int!` | Total bytes of all languages combined. |
| `pageInfo` | `PageInfo!` | Pagination info. |

#### LanguageEdge
| Field | Type | Notes |
|---|---|---|
| `cursor` | `String!` | Pagination cursor. |
| `node` | `Language!` | The language object. |
| `size` | `Int!` | **Size in bytes** of this language in this repository. This is the key field for determining language usage. |

#### LanguageOrder Input
| Field | Type | Notes |
|---|---|---|
| `field` | `LanguageOrderField!` | Only value: `SIZE` ("Order languages by the size of all files containing the language"). |
| `direction` | `OrderDirection!` | `ASC` or `DESC`. |

---

## 4. The Complete Query

This single query fetches everything needed for a GitHub profile analyzer. Verified working against the live API. **Cost: 1 rate limit point.**

```graphql
query GetGitHubProfile($username: String!) {
  user(login: $username) {
    login
    name
    avatarUrl
    bio
    createdAt
    location
    company
    websiteUrl
    twitterUsername
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(
      first: 100
      ownerAffiliations: OWNER
      orderBy: { field: STARGAZERS, direction: DESC }
    ) {
      totalCount
      nodes {
        name
        stargazerCount
        primaryLanguage {
          name
          color
        }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
      contributionYears
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            weekday
            contributionLevel
            color
          }
        }
      }
    }
  }
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}
```

Variables:
```json
{
  "username": "octocat"
}
```

### Making the Request

```bash
curl -X POST https://api.github.com/graphql \
  -H "Authorization: bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "...", "variables": {"username": "octocat"}}'
```

Or with `fetch` in JavaScript/TypeScript:
```typescript
const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query, variables: { username } }),
});
const data = await response.json();
```

---

## 5. Pagination Strategy for Repositories

The `repositories` field returns max 100 repos per request (the API enforces `first` max of 100). For users with more than 100 repos:

### Option A: Multiple Queries with Cursors (most thorough)
```graphql
query GetMoreRepos($username: String!, $after: String) {
  user(login: $username) {
    repositories(
      first: 100
      ownerAffiliations: OWNER
      orderBy: { field: STARGAZERS, direction: DESC }
      after: $after
    ) {
      nodes {
        name
        stargazerCount
        primaryLanguage { name color }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
```

Loop using `pageInfo.hasNextPage` and `pageInfo.endCursor` as the `$after` variable.

### Option B: Just Use the Top 100 (pragmatic)
Since we order by `STARGAZERS DESC`, the first 100 repos capture the most important ones. For stars calculation, the remaining repos likely have 0 or very few stars. For language analysis, the top 100 repos by stars cover the most meaningful code. **This is the recommended approach for a profile analyzer** -- it keeps the query to a single request and a single rate limit point.

---

## 6. Multi-Year Contribution Data with Aliases

The `contributionsCollection` has a max range of 1 year. To get multiple years, use GraphQL aliases:

```graphql
query GetMultiYearContributions($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionYears  # Get all years the user has been active
    }
    y2026: contributionsCollection(from: "2026-01-01T00:00:00Z", to: "2026-12-31T23:59:59Z") {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
    y2025: contributionsCollection(from: "2025-01-01T00:00:00Z", to: "2025-12-31T23:59:59Z") {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
    # Add more years as needed...
  }
}
```

**This was verified to work.** Each aliased `contributionsCollection` returns independent data for its date range.

---

## 7. How to Calculate Total Stars

Sum `stargazerCount` across all repository nodes:

```typescript
const totalStars = repositories.nodes.reduce(
  (sum, repo) => sum + repo.stargazerCount,
  0
);
```

If you only fetch the top 100 repos (ordered by stars descending), this will be slightly less than the true total for users with 100+ repos, but the difference is usually negligible (remaining repos typically have 0-few stars).

For exact totals on users with many repos, paginate through all repos (see section 5).

---

## 8. How to Determine Top Language

### Method: Aggregate `size` from LanguageEdge across all repos

```typescript
const languageSizes: Record<string, { size: number; color: string | null }> = {};

for (const repo of repositories.nodes) {
  for (const edge of repo.languages.edges) {
    const langName = edge.node.name;
    if (!languageSizes[langName]) {
      languageSizes[langName] = { size: 0, color: edge.node.color };
    }
    languageSizes[langName].size += edge.size;
  }
}

// Sort by total size descending
const topLanguages = Object.entries(languageSizes)
  .sort(([, a], [, b]) => b.size - a.size);

const topLanguage = topLanguages[0]; // [name, { size, color }]
```

The `size` field on `LanguageEdge` represents **bytes of code** in that language within that repository. Summing across repos gives total bytes of code per language, which is the most accurate way to determine the user's top language.

### Alternative: Use `primaryLanguage`
Each repo has a `primaryLanguage` field. You could count how many repos have each primary language. This is simpler but less accurate -- a user might have many small repos in one language and one massive repo in another.

### Note on `languages(first: 10)`
We fetch the top 10 languages per repo (ordered by size). Most repos have fewer than 10 languages. If a repo somehow has more than 10 languages, we miss the smaller ones, but they would contribute negligibly to the totals.

---

## 9. How to Calculate Streak from Calendar Data

**GitHub does NOT provide streak data directly through the API.** You must calculate it from the `contributionCalendar` data.

### Current Streak Algorithm

```typescript
function calculateCurrentStreak(
  weeks: ContributionCalendarWeek[]
): number {
  // Flatten all days into a single sorted array (earliest to latest)
  const allDays = weeks.flatMap((week) => week.contributionDays);
  // allDays is already sorted chronologically (earliest first)

  // Find today's date
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  let streak = 0;

  // Walk backwards from the end of the array
  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];

    // Skip future dates (the calendar may include today but not beyond)
    if (day.date > today) continue;

    // If today has 0 contributions, the streak could still be alive
    // (the day isn't over yet), so skip today and check yesterday
    if (day.date === today && day.contributionCount === 0) continue;

    // Once we hit a day with 0 contributions, the streak is broken
    if (day.contributionCount === 0) break;

    streak++;
  }

  return streak;
}
```

### Longest Streak Algorithm

```typescript
function calculateLongestStreak(
  weeks: ContributionCalendarWeek[]
): number {
  const allDays = weeks.flatMap((week) => week.contributionDays);

  let longestStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    if (day.contributionCount > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}
```

### Multi-Year Streak Calculation
The default `contributionsCollection` only covers ~1 year. If a user's streak spans more than a year, you need to query multiple years using aliases (section 6). Use `contributionYears` to know which years to query, then concatenate the calendar data chronologically before running the streak algorithm.

### Important Edge Cases
1. **Today with 0 contributions**: Don't count today as breaking the streak -- the day isn't over.
2. **Future dates**: The calendar may include dates up to the end of the current week. Skip dates after today.
3. **Timezone**: The calendar uses the user's configured timezone on GitHub. The `date` field is a plain date string (`YYYY-MM-DD`), not a timestamp.
4. **Week boundaries**: The first and last weeks in the calendar may be partial (fewer than 7 days).

---

## 10. Gotchas and Limitations

### 10.1 contributionsCollection Max Range = 1 Year
You cannot pass a `from`/`to` range exceeding one year. The API will return an error. Query year-by-year using aliases.

### 10.2 Repositories Max Per Page = 100
The `first`/`last` arguments cap at 100. For users with 1000+ repos, you need multiple paginated requests.

### 10.3 Contribution Data Includes Private Repos (conditionally)
If the user has "Include private contributions on my profile" enabled in their GitHub settings, the `totalCommitContributions` etc. will include private repo contributions (as a count only -- no repo details leaked). The `restrictedContributionsCount` field tells you how many contributions are from private repos the viewer cannot see.

### 10.4 The `user` Query Returns `null` for Non-Existent Users
It does NOT throw an error. Always check for `null`:
```typescript
if (!data.data.user) {
  // User not found
}
```

### 10.5 Bot/Organization Accounts
The `user` query only works for user accounts. Organization accounts must be queried with `organization(login: ...)`. Bot accounts may not have contribution data.

### 10.6 Email May Be Empty
The `email` field is typed `String!` (non-null) but returns an empty string `""` when the email is not public.

### 10.7 Language `color` Can Be Null
Some less common languages do not have an assigned color in GitHub's linguist library. Handle `null` colors with a fallback.

### 10.8 Rate Limit Error Format
When rate limited, the API returns HTTP 200 with an error in the response body:
```json
{
  "errors": [
    {
      "type": "RATE_LIMITED",
      "message": "API rate limit exceeded for user..."
    }
  ]
}
```

### 10.9 Query Complexity Timeout
Queries that take more than 10 seconds to process are terminated. The full profile query shown in this document runs well within this limit (verified at ~1 second).

### 10.10 Calendar Data Week Structure
- Weeks start on Sunday (weekday 0).
- The first week of the calendar may start mid-week (e.g., if the range starts on a Wednesday, the first week has days Wed-Sat only).
- The last week may also be partial.
- A full year typically has 53 weeks (52 complete + 1-2 partial).
- The calendar for a full year has 365 or 366 days total.

### 10.11 `avatarUrl` Size Parameter
The `size` argument controls the rendered image dimensions. If omitted, returns the full-size avatar. Common sizes: 100, 200, 460. The URL format is: `https://avatars.githubusercontent.com/u/{id}?s={size}&v=4`.

### 10.12 DateTime vs Date Types
- `DateTime` fields (like `createdAt`) return ISO 8601 timestamps: `"2009-12-20T22:57:02Z"`
- `Date` fields (like `contributionCalendar.contributionDays.date`) return plain dates: `"2026-03-30"`
- When passing `from`/`to` arguments to `contributionsCollection`, use full `DateTime` format: `"2024-01-01T00:00:00Z"`

---

## 11. Complete Response Shape

For reference, here is the TypeScript type representing the full query response:

```typescript
interface GitHubProfileResponse {
  data: {
    user: {
      login: string;
      name: string | null;
      avatarUrl: string;
      bio: string | null;
      createdAt: string; // ISO 8601 DateTime
      location: string | null;
      company: string | null;
      websiteUrl: string | null;
      twitterUsername: string | null;
      followers: {
        totalCount: number;
      };
      following: {
        totalCount: number;
      };
      repositories: {
        totalCount: number;
        nodes: Array<{
          name: string;
          stargazerCount: number;
          primaryLanguage: {
            name: string;
            color: string | null;
          } | null;
          languages: {
            edges: Array<{
              size: number;
              node: {
                name: string;
                color: string | null;
              };
            }>;
          };
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        totalPullRequestReviewContributions: number;
        totalRepositoryContributions: number;
        restrictedContributionsCount: number;
        contributionYears: number[];
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string; // "YYYY-MM-DD"
              weekday: number; // 0=Sunday, 6=Saturday
              contributionLevel:
                | "NONE"
                | "FIRST_QUARTILE"
                | "SECOND_QUARTILE"
                | "THIRD_QUARTILE"
                | "FOURTH_QUARTILE";
              color: string; // hex color
            }>;
          }>;
        };
      };
    } | null;
    rateLimit: {
      limit: number;
      cost: number;
      remaining: number;
      resetAt: string;
    };
  };
}
```

---

## 12. Verified Sample Data (from live API test)

Tested with user `sindresorhus` on 2026-03-30:

| Field | Value |
|---|---|
| login | sindresorhus |
| name | Sindre Sorhus |
| createdAt | 2009-12-20T22:57:02Z |
| followers.totalCount | 78,175 |
| following.totalCount | 30 |
| repositories.totalCount | 1,133 (public, owned) |
| Total stars (top 100 repos) | 888,314 |
| totalCommitContributions (last year) | 2,843 |
| totalPullRequestContributions | 145 |
| totalIssueContributions | 39 |
| totalPullRequestReviewContributions | 166 |
| totalRepositoryContributions | 18 |
| contributionYears | [2026, 2025, ..., 2009] (18 years) |
| contributionCalendar.totalContributions | 3,271 |
| Calendar weeks | 53 |
| Calendar days | 367 |
| Top language by bytes | JavaScript (5,157,429 bytes) |
| Second language | TypeScript (2,954,542 bytes) |
| Query cost | 1 rate limit point |
| Query node count | 1,100 |

Default `contributionsCollection` range (no from/to): `2025-03-29T16:00:00Z` to `2026-03-30T15:59:59Z`.

---

## 13. Summary for Implementation

1. **One query gets almost everything**: User profile, contribution stats, contribution calendar, top 100 repos with stars and languages. Cost: 1 point.
2. **No streak API exists**: Calculate from calendar data by walking backwards from today.
3. **Top language**: Sum `LanguageEdge.size` across repos, sort descending.
4. **Total stars**: Sum `stargazerCount` across repo nodes.
5. **Multi-year data**: Use aliases with `from`/`to` on `contributionsCollection`. Get available years from `contributionYears`.
6. **Pagination**: Only needed if you want data from 100+ repos. For most profile analyzers, the top 100 repos (by stars) is sufficient.
7. **Auth**: Any GitHub token works. Fine-grained PAT with no extra permissions works for public data.
8. **Rate limit**: 5,000 points/hour, our query costs 1 point each. Very generous.
