'use node'

import { api, internal } from '../_generated/api'
import { internalAction } from '../_generated/server'
import { v } from 'convex/values'
import pRetry, { AbortError } from 'p-retry'
import { renderImageBuffer } from './og_actions'
import {
  RANK_ROASTS,
  RANK_TITLES,
  isValidGitHubUsername,
  normalizeGitHubUsername,
  toUsernameLower,
} from './shared'

declare const process: {
  env: Record<string, string | undefined>
}

type GitHubContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE'

type GitHubContributionDay = {
  contributionCount: number
  contributionLevel: GitHubContributionLevel
  date: string
  weekday: number
}

type GitHubContributionWeek = {
  contributionDays: Array<GitHubContributionDay>
}

type GitHubLanguageEdge = {
  size: number
  node: {
    name: string
  }
}

type GitHubRepository = {
  stargazerCount: number
  primaryLanguage: {
    name: string
  } | null
  languages: {
    edges: Array<GitHubLanguageEdge>
  }
}

type GitHubUser = {
  login: string
  avatarUrl: string
  createdAt: string
  repositories: {
    nodes: Array<GitHubRepository>
  }
  contributionsCollection: {
    totalCommitContributions: number
    totalPullRequestContributions: number
    totalIssueContributions: number
    totalPullRequestReviewContributions: number
    contributionCalendar: {
      totalContributions: number
      weeks: Array<GitHubContributionWeek>
    }
  }
}

type GitHubResponse = {
  data?: {
    user: GitHubUser | null
  }
  errors?: Array<{
    message: string
    type?: string
  }>
}

const GITHUB_QUERY = `
  query AnalyzeShipmaxUser($username: String!) {
    user(login: $username) {
      login
      avatarUrl(size: 200)
      createdAt
      repositories(
        first: 100
        ownerAffiliations: OWNER
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          stargazerCount
          primaryLanguage {
            name
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`

const NOT_FOUND_MESSAGE = 'HUNTER NOT FOUND IN DATABASE.'
const ANALYSIS_ERROR_MESSAGE =
  'INSUFFICIENT SIGNAL. THE RIFT COULD NOT STABILIZE THIS HUNTER DATA.'
const RATE_LIMIT_MESSAGE =
  'GITHUB RATE LIMIT REACHED. TRY AGAIN WHEN THE RIFT RECHARGES.'

const CONSISTENCY_BANDS = [
  { min: 0, max: 9, scoreMin: 0, scoreMax: 14 },
  { min: 10, max: 19, scoreMin: 15, scoreMax: 29 },
  { min: 20, max: 29, scoreMin: 30, scoreMax: 49 },
  { min: 30, max: 39, scoreMin: 50, scoreMax: 69 },
  { min: 40, max: 47, scoreMin: 70, scoreMax: 89 },
  { min: 48, max: 52, scoreMin: 90, scoreMax: 100 },
] as const

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

function logShipmaxInfo({
  event,
  details,
}: {
  event: string
  details?: Record<string, unknown>
}) {
  console.log('[shipmax]', event, details ?? {})
}

function logShipmaxError({
  event,
  details,
}: {
  event: string
  details?: Record<string, unknown>
}) {
  console.error('[shipmax]', event, details ?? {})
}

function clampScore({ score }: { score: number }): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function interpolateRange({
  value,
  min,
  max,
  scoreMin,
  scoreMax,
}: {
  value: number
  min: number
  max: number
  scoreMin: number
  scoreMax: number
}): number {
  if (max === min) {
    return scoreMax
  }

  const ratio = (value - min) / (max - min)
  return scoreMin + (scoreMax - scoreMin) * ratio
}

function calculateConsistencyScore({
  activeWeeks,
}: {
  activeWeeks: number
}): number {
  const band =
    CONSISTENCY_BANDS.find(
      ({ min, max }) => activeWeeks >= min && activeWeeks <= max
    ) ?? CONSISTENCY_BANDS[CONSISTENCY_BANDS.length - 1]

  return clampScore({
    score: interpolateRange({
      value: Math.min(activeWeeks, band.max),
      min: band.min,
      max: band.max,
      scoreMin: band.scoreMin,
      scoreMax: band.scoreMax,
    }),
  })
}

function calculateRecentActivityScore({
  totalContributions,
  recentContributions,
}: {
  totalContributions: number
  recentContributions: number
}): number {
  if (totalContributions <= 0) {
    return 0
  }

  const monthlyAverage = totalContributions / 12
  const ratio = recentContributions / monthlyAverage

  if (ratio < 0.5) {
    return clampScore({
      score: interpolateRange({
        value: ratio,
        min: 0,
        max: 0.5,
        scoreMin: 0,
        scoreMax: 29,
      }),
    })
  }

  if (ratio < 1) {
    return clampScore({
      score: interpolateRange({
        value: ratio,
        min: 0.5,
        max: 1,
        scoreMin: 30,
        scoreMax: 59,
      }),
    })
  }

  if (ratio < 1.5) {
    return clampScore({
      score: interpolateRange({
        value: ratio,
        min: 1,
        max: 1.5,
        scoreMin: 60,
        scoreMax: 79,
      }),
    })
  }

  return clampScore({
    score: interpolateRange({
      value: Math.min(ratio, 3),
      min: 1.5,
      max: 3,
      scoreMin: 80,
      scoreMax: 100,
    }),
  })
}

function calculateVolumeScore({
  totalContributions,
}: {
  totalContributions: number
}): number {
  return clampScore({
    score: (totalContributions / 4500) * 100,
  })
}

function calculateStarsScore({ totalStars }: { totalStars: number }): number {
  if (totalStars <= 0) {
    return 0
  }

  return clampScore({
    score: (Math.log10(totalStars + 1) / Math.log10(10000)) * 100,
  })
}

function calculateCommunityScore({
  totalPRs,
  totalIssues,
  totalReviews,
}: {
  totalPRs: number
  totalIssues: number
  totalReviews: number
}): number {
  return clampScore({
    score: ((totalPRs + totalIssues + totalReviews) / 300) * 100,
  })
}

function calculateFinalScore({
  consistency,
  recentActivity,
  volume,
  stars,
  community,
}: {
  consistency: number
  recentActivity: number
  volume: number
  stars: number
  community: number
}): number {
  return clampScore({
    score:
      volume * 0.3 +
      consistency * 0.25 +
      recentActivity * 0.2 +
      stars * 0.15 +
      community * 0.1,
  })
}

function resolveRank({ score }: { score: number }): keyof typeof RANK_TITLES {
  if (score >= 85) {
    return 'S'
  }

  if (score >= 70) {
    return 'A'
  }

  if (score >= 55) {
    return 'B'
  }

  if (score >= 40) {
    return 'C'
  }

  if (score >= 20) {
    return 'D'
  }

  return 'E'
}

function flattenContributionDays({
  weeks,
}: {
  weeks: Array<GitHubContributionWeek>
}): Array<GitHubContributionDay> {
  return weeks.flatMap((week) => week.contributionDays)
}

function calculateCurrentStreak({
  days,
}: {
  days: Array<GitHubContributionDay>
}): number {
  const today = new Date().toISOString().split('T')[0]
  let streak = 0

  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index]

    if (!day || day.date > today) {
      continue
    }

    if (day.date === today && day.contributionCount === 0) {
      continue
    }

    if (day.contributionCount === 0) {
      break
    }

    streak += 1
  }

  return streak
}

function calculateLongestStreak({
  days,
}: {
  days: Array<GitHubContributionDay>
}): number {
  let longestStreak = 0
  let currentStreak = 0

  for (const day of days) {
    if (day.contributionCount > 0) {
      currentStreak += 1
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return longestStreak
}

function calculateActiveWeeks({
  weeks,
}: {
  weeks: Array<GitHubContributionWeek>
}): number {
  return weeks.filter((week) =>
    week.contributionDays.some((day) => day.contributionCount > 0)
  ).length
}

function calculateRecentContributions({
  days,
}: {
  days: Array<GitHubContributionDay>
}): number {
  const cutoffDate = new Date()
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 29)
  const cutoff = cutoffDate.toISOString().split('T')[0]

  return days.reduce((total, day) => {
    if (day.date < cutoff) {
      return total
    }

    return total + day.contributionCount
  }, 0)
}

function calculateMostActiveDay({
  days,
}: {
  days: Array<GitHubContributionDay>
}): string {
  const contributionsByWeekday = WEEKDAY_NAMES.map(() => 0)

  for (const day of days) {
    contributionsByWeekday[day.weekday] =
      (contributionsByWeekday[day.weekday] ?? 0) + day.contributionCount
  }

  let bestWeekday = 0

  for (let weekday = 1; weekday < contributionsByWeekday.length; weekday += 1) {
    if (
      (contributionsByWeekday[weekday] ?? 0) >
      (contributionsByWeekday[bestWeekday] ?? 0)
    ) {
      bestWeekday = weekday
    }
  }

  return WEEKDAY_NAMES[bestWeekday] ?? 'Unknown'
}

function calculateTopLanguage({
  repositories,
}: {
  repositories: Array<GitHubRepository>
}): string {
  const languageSizes: Record<string, number> = {}

  for (const repository of repositories) {
    for (const edge of repository.languages.edges) {
      languageSizes[edge.node.name] =
        (languageSizes[edge.node.name] ?? 0) + edge.size
    }
  }

  const topLanguageEntry = Object.entries(languageSizes).sort(
    (left, right) => right[1] - left[1]
  )[0]

  if (topLanguageEntry) {
    return topLanguageEntry[0]
  }

  const repositoryWithPrimaryLanguage = repositories.find(
    (repository) => repository.primaryLanguage
  )

  return repositoryWithPrimaryLanguage?.primaryLanguage?.name ?? 'Unknown'
}

function pickRoast({ rank }: { rank: keyof typeof RANK_ROASTS }): string {
  const roasts = RANK_ROASTS[rank]
  const roastIndex = Math.floor(Math.random() * roasts.length)

  return roasts[roastIndex] ?? roasts[0]
}

async function fetchGitHubUser({
  token,
  username,
}: {
  token: string
  username: string
}): Promise<GitHubUser | null> {
  let attempt = 0

  return pRetry(
    async () => {
      attempt += 1

      logShipmaxInfo({
        event: 'github_fetch_start',
        details: { attempt, username },
      })

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GITHUB_QUERY,
          variables: { username },
        }),
      })

      logShipmaxInfo({
        event: 'github_fetch_response',
        details: {
          attempt,
          ok: response.ok,
          rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
          rateLimitReset: response.headers.get('x-ratelimit-reset'),
          status: response.status,
          username,
        },
      })

      if (!response.ok) {
        const responseText = await response.text()

        logShipmaxError({
          event: 'github_fetch_http_error',
          details: {
            attempt,
            body: responseText.slice(0, 500),
            status: response.status,
            username,
          },
        })

        if (response.status >= 500) {
          throw new Error(
            `GitHub request failed with status ${response.status}.`
          )
        }

        throw new AbortError(
          `GitHub HTTP ${response.status}. ${responseText.slice(0, 200)}`
        )
      }

      const payload = (await response.json()) as GitHubResponse

      if (payload.errors?.length) {
        const firstError = payload.errors[0]

        logShipmaxError({
          event: 'github_graphql_error',
          details: {
            attempt,
            errors: payload.errors,
            username,
          },
        })

        if (
          firstError?.type === 'RATE_LIMITED' ||
          firstError?.message.toLowerCase().includes('rate limit')
        ) {
          throw new AbortError(RATE_LIMIT_MESSAGE)
        }

        throw new Error(firstError?.message ?? ANALYSIS_ERROR_MESSAGE)
      }

      logShipmaxInfo({
        event: 'github_fetch_complete',
        details: {
          attempt,
          foundUser: payload.data?.user !== null,
          username,
        },
      })

      return payload.data?.user ?? null
    },
    {
      onFailedAttempt: (error) => {
        logShipmaxError({
          event: 'github_fetch_attempt_failed',
          details: {
            attempt: error.attemptNumber,
            retriesLeft: error.retriesLeft,
            username,
          },
        })
      },
      retries: 2,
    }
  )
}

function buildAnalysisResult({ user }: { user: GitHubUser }) {
  const contributionWeeks =
    user.contributionsCollection.contributionCalendar.weeks
  const contributionDays = flattenContributionDays({
    weeks: contributionWeeks,
  })
  const totalContributions =
    user.contributionsCollection.contributionCalendar.totalContributions
  const totalStars = user.repositories.nodes.reduce(
    (total, repository) => total + repository.stargazerCount,
    0
  )
  const activeWeeks = calculateActiveWeeks({ weeks: contributionWeeks })
  const recentContributions = calculateRecentContributions({
    days: contributionDays,
  })
  const totalPRs = user.contributionsCollection.totalPullRequestContributions
  const totalIssues = user.contributionsCollection.totalIssueContributions
  const totalReviews =
    user.contributionsCollection.totalPullRequestReviewContributions

  const stats = {
    consistency: calculateConsistencyScore({ activeWeeks }),
    recentActivity: calculateRecentActivityScore({
      totalContributions,
      recentContributions,
    }),
    volume: calculateVolumeScore({ totalContributions }),
    stars: calculateStarsScore({ totalStars }),
    community: calculateCommunityScore({
      totalPRs,
      totalIssues,
      totalReviews,
    }),
  }

  const score = calculateFinalScore(stats)
  const rank = resolveRank({ score })

  return {
    username: user.login,
    usernameLower: toUsernameLower({ username: user.login }),
    avatarUrl: user.avatarUrl,
    rank,
    rankTitle: RANK_TITLES[rank],
    score,
    roast: pickRoast({ rank }),
    stats,
    rawData: {
      totalContributions,
      activeWeeks,
      currentStreak: calculateCurrentStreak({ days: contributionDays }),
      longestStreak: calculateLongestStreak({ days: contributionDays }),
      totalStars,
      totalPRs,
      totalIssues,
      totalReviews,
      topLanguage: calculateTopLanguage({
        repositories: user.repositories.nodes,
      }),
      mostActiveDay: calculateMostActiveDay({ days: contributionDays }),
      recentContributions,
      contributionCalendar: contributionWeeks.map((week) => ({
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel,
          weekday: day.weekday,
        })),
      })),
    },
    lastScannedAt: Date.now(),
  }
}

function getFailureMessage({ error }: { error: unknown }): string {
  if (error instanceof AbortError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return ANALYSIS_ERROR_MESSAGE
}

export const analyzeUser = internalAction({
  args: {
    username: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const normalizedUsername = normalizeGitHubUsername({
      username: args.username,
    })

    logShipmaxInfo({
      event: 'analyze_user_start',
      details: {
        normalizedUsername,
        requestedUsername: args.username,
      },
    })

    if (
      !normalizedUsername ||
      !isValidGitHubUsername({ username: normalizedUsername })
    ) {
      logShipmaxError({
        event: 'analyze_user_invalid_username',
        details: {
          normalizedUsername,
          requestedUsername: args.username,
        },
      })

      await ctx.runMutation(internal.users.mutations.saveAnalysisStatus, {
        username: normalizedUsername || args.username,
        usernameLower: toUsernameLower({
          username: normalizedUsername || args.username,
        }),
        status: 'not_found',
        message: NOT_FOUND_MESSAGE,
      })

      return null
    }

    const token = process.env.GITHUB_TOKEN

    logShipmaxInfo({
      event: 'analyze_user_token_check',
      details: {
        hasToken: Boolean(token),
        normalizedUsername,
      },
    })

    if (!token) {
      logShipmaxError({
        event: 'analyze_user_missing_token',
        details: { normalizedUsername },
      })

      await ctx.runMutation(internal.users.mutations.saveAnalysisStatus, {
        username: normalizedUsername,
        usernameLower: toUsernameLower({ username: normalizedUsername }),
        status: 'error',
        message: 'GITHUB TOKEN MISSING. ANALYSIS CANNOT PROCEED.',
      })

      return null
    }

    try {
      const githubUser = await fetchGitHubUser({
        token,
        username: normalizedUsername,
      })

      if (!githubUser) {
        logShipmaxInfo({
          event: 'analyze_user_not_found',
          details: { normalizedUsername },
        })

        await ctx.runMutation(internal.users.mutations.saveAnalysisStatus, {
          username: normalizedUsername,
          usernameLower: toUsernameLower({ username: normalizedUsername }),
          status: 'not_found',
          message: NOT_FOUND_MESSAGE,
        })

        return null
      }

      const result = buildAnalysisResult({ user: githubUser })

      logShipmaxInfo({
        event: 'analyze_user_computed_result',
        details: {
          normalizedUsername,
          rank: result.rank,
          score: result.score,
          totalContributions: result.rawData.totalContributions,
          totalStars: result.rawData.totalStars,
        },
      })

      await ctx.runMutation(internal.users.mutations.saveAnalysisResult, {
        result,
      })

      logShipmaxInfo({
        event: 'analyze_user_saved_result',
        details: { normalizedUsername },
      })

      await ctx.scheduler.runAfter(0, internal.users.actions.generateOgImage, {
        username: result.username,
        usernameLower: result.usernameLower,
      })
    } catch (error) {
      logShipmaxError({
        event: 'analyze_user_failed',
        details: {
          message: getFailureMessage({ error }),
          normalizedUsername,
          stack: error instanceof Error ? error.stack : undefined,
        },
      })

      await ctx.runMutation(internal.users.mutations.saveAnalysisStatus, {
        username: normalizedUsername,
        usernameLower: toUsernameLower({ username: normalizedUsername }),
        status: 'error',
        message: getFailureMessage({ error }),
      })
    }

    return null
  },
})

export const generateOgImage = internalAction({
  args: {
    username: v.string(),
    usernameLower: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const shareState = await ctx.runQuery(
        api.users.queries.getProfileShareState,
        { username: args.username }
      )

      const imageBuffer = await renderImageBuffer({
        shareState,
        username: args.username,
      })

      const storageId = await ctx.storage.store(
        new Blob([imageBuffer], { type: 'image/png' })
      )

      await ctx.runMutation(internal.users.mutations.saveOgImageStorageId, {
        usernameLower: args.usernameLower,
        storageId,
      })

      logShipmaxInfo({
        event: 'og_image_generated',
        details: { username: args.username },
      })
    } catch (error) {
      logShipmaxError({
        event: 'og_image_generation_failed',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          username: args.username,
        },
      })
    }

    return null
  },
})
