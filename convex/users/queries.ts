import { query, type QueryCtx } from '../_generated/server'
import { v } from 'convex/values'
import { type Doc } from '../_generated/dataModel'
import {
  APP_STATS_NAME,
  HOME_SUMMARY_VALIDATOR,
  PROFILE_SHARE_STATE_VALIDATOR,
  PROFILE_STATE_VALIDATOR,
  getScoreBucketKey,
  isFreshAnalysis,
  isValidGitHubUsername,
  normalizeGitHubUsername,
  toUsernameLower,
} from './shared'

function calculatePosition({
  score,
  scoreCounts,
}: {
  score: number
  scoreCounts: Record<string, number>
}): number {
  let higherScores = 0

  for (let bucketScore = 100; bucketScore > score; bucketScore -= 1) {
    higherScores += scoreCounts[getScoreBucketKey({ score: bucketScore })] ?? 0
  }

  return higherScores + 1
}

function getShortUsername({
  user,
  fallbackUsername,
}: {
  user: Doc<'users'> | null
  fallbackUsername: string
}): string {
  return user?.username ?? fallbackUsername
}

async function getAppStats({ ctx }: { ctx: QueryCtx }) {
  return ctx.db
    .query('appStats')
    .withIndex('by_name', (query) => query.eq('name', APP_STATS_NAME))
    .unique()
}

async function getProfileRecords({
  ctx,
  usernameLower,
}: {
  ctx: QueryCtx
  usernameLower: string
}) {
  const [user, analysisStatus] = await Promise.all([
    ctx.db
      .query('users')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', usernameLower)
      )
      .unique(),
    ctx.db
      .query('analysisStatuses')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', usernameLower)
      )
      .unique(),
  ])

  return { user, analysisStatus }
}

async function buildReadyProfile({
  ctx,
  user,
}: {
  ctx: QueryCtx
  user: Doc<'users'>
}) {
  const appStats = await getAppStats({ ctx })

  return {
    username: user.username,
    avatarUrl: user.avatarUrl,
    rank: user.rank,
    rankTitle: user.rankTitle,
    score: user.score,
    roast: user.roast,
    stats: user.stats,
    rawData: user.rawData,
    position: calculatePosition({
      score: user.score,
      scoreCounts: appStats?.scoreCounts ?? {},
    }),
    totalRanked: appStats?.totalRanked ?? 1,
    lastScannedAt: user.analyzedAt,
  }
}

export const getHomeSummary = query({
  args: {
    limit: v.number(),
  },
  returns: HOME_SUMMARY_VALIDATOR,
  handler: async (ctx, args) => {
    const limit = Math.max(0, Math.min(10, Math.floor(args.limit)))
    const featuredUsers =
      limit === 0
        ? []
        : await ctx.db
            .query('users')
            .withIndex('by_analyzed_at')
            .order('desc')
            .take(limit)

    const appStats = await getAppStats({ ctx })

    return {
      featuredHunters: featuredUsers.map((user) => ({
        username: user.username,
        avatarUrl: user.avatarUrl,
        rank: user.rank,
      })),
      totalRanked: appStats?.totalRanked ?? 0,
    }
  },
})

export const getProfileState = query({
  args: {
    username: v.string(),
  },
  returns: PROFILE_STATE_VALIDATOR,
  handler: async (ctx, args) => {
    const normalizedUsername = normalizeGitHubUsername({
      username: args.username,
    })

    if (
      !normalizedUsername ||
      !isValidGitHubUsername({ username: normalizedUsername })
    ) {
      return {
        status: 'not_found' as const,
        username: args.username,
        message: 'HUNTER NOT FOUND IN DATABASE.',
      }
    }

    const usernameLower = toUsernameLower({ username: normalizedUsername })
    const now = Date.now()

    const { user, analysisStatus } = await getProfileRecords({
      ctx,
      usernameLower,
    })

    if (user && isFreshAnalysis({ analyzedAt: user.analyzedAt, now })) {
      return {
        status: 'ready' as const,
        profile: await buildReadyProfile({ ctx, user }),
      }
    }

    if (analysisStatus?.status === 'pending') {
      return {
        status: 'pending' as const,
        username: getShortUsername({
          user,
          fallbackUsername: analysisStatus.username,
        }),
      }
    }

    if (analysisStatus?.status === 'not_found') {
      return {
        status: 'not_found' as const,
        username: analysisStatus.username,
        message: analysisStatus.message,
      }
    }

    if (analysisStatus?.status === 'error') {
      return {
        status: 'error' as const,
        username: getShortUsername({
          user,
          fallbackUsername: analysisStatus.username,
        }),
        message: analysisStatus.message,
      }
    }

    return {
      status: 'should_analyze' as const,
      username: getShortUsername({
        user,
        fallbackUsername: normalizedUsername,
      }),
    }
  },
})

export const getProfileShareState = query({
  args: {
    username: v.string(),
  },
  returns: PROFILE_SHARE_STATE_VALIDATOR,
  handler: async (ctx, args) => {
    const normalizedUsername = normalizeGitHubUsername({
      username: args.username,
    })

    if (
      !normalizedUsername ||
      !isValidGitHubUsername({ username: normalizedUsername })
    ) {
      return {
        status: 'not_found' as const,
        username: args.username,
        message: 'HUNTER NOT FOUND IN DATABASE.',
      }
    }

    const usernameLower = toUsernameLower({ username: normalizedUsername })
    const { user, analysisStatus } = await getProfileRecords({
      ctx,
      usernameLower,
    })

    if (user) {
      const readyProfile = await buildReadyProfile({ ctx, user })

      return {
        status: 'ready' as const,
        profile: {
          username: readyProfile.username,
          avatarUrl: readyProfile.avatarUrl,
          rank: readyProfile.rank,
          rankTitle: readyProfile.rankTitle,
          score: readyProfile.score,
          roast: readyProfile.roast,
          stats: readyProfile.stats,
          position: readyProfile.position,
          totalRanked: readyProfile.totalRanked,
          lastScannedAt: readyProfile.lastScannedAt,
        },
      }
    }

    if (analysisStatus?.status === 'pending') {
      return {
        status: 'pending' as const,
        username: analysisStatus.username,
      }
    }

    if (analysisStatus?.status === 'not_found') {
      return {
        status: 'not_found' as const,
        username: analysisStatus.username,
        message: analysisStatus.message,
      }
    }

    if (analysisStatus?.status === 'error') {
      return {
        status: 'error' as const,
        username: analysisStatus.username,
        message: analysisStatus.message,
      }
    }

    return {
      status: 'should_analyze' as const,
      username: normalizedUsername,
    }
  },
})
