import { internal } from '../_generated/api'
import {
  internalMutation,
  mutation,
  type MutationCtx,
} from '../_generated/server'
import { v } from 'convex/values'
import {
  analysisStatusValidator,
  rankValidator,
  rawDataValidator,
  statsValidator,
} from '../schema'
import { appError } from '../shared/errors'
import {
  APP_STATS_NAME,
  getScoreBucketKey,
  isFreshAnalysis,
  isValidGitHubUsername,
  normalizeGitHubUsername,
  toUsernameLower,
} from './shared'

const saveAnalysisResultValidator = v.object({
  username: v.string(),
  usernameLower: v.string(),
  avatarUrl: v.string(),
  rank: rankValidator,
  rankTitle: v.string(),
  score: v.number(),
  roast: v.string(),
  stats: statsValidator,
  rawData: rawDataValidator,
  lastScannedAt: v.number(),
})

async function getAppStats({ ctx }: { ctx: MutationCtx }) {
  const existingStats = await ctx.db
    .query('appStats')
    .withIndex('by_name', (query) => query.eq('name', APP_STATS_NAME))
    .unique()

  if (existingStats) {
    return existingStats
  }

  const statsId = await ctx.db.insert('appStats', {
    name: APP_STATS_NAME,
    totalRanked: 0,
    scoreCounts: {},
  })

  const insertedStats = await ctx.db.get(statsId)

  if (!insertedStats) {
    throw new Error('Failed to create app stats document.')
  }

  return insertedStats
}

function adjustScoreCounts({
  scoreCounts,
  previousScore,
  nextScore,
}: {
  scoreCounts: Record<string, number>
  previousScore: number | null
  nextScore: number
}) {
  const nextScoreCounts = { ...scoreCounts }

  if (previousScore !== null) {
    const previousKey = getScoreBucketKey({ score: previousScore })
    const nextCount = (nextScoreCounts[previousKey] ?? 0) - 1

    if (nextCount <= 0) {
      delete nextScoreCounts[previousKey]
    } else {
      nextScoreCounts[previousKey] = nextCount
    }
  }

  const nextKey = getScoreBucketKey({ score: nextScore })
  nextScoreCounts[nextKey] = (nextScoreCounts[nextKey] ?? 0) + 1

  return nextScoreCounts
}

export const requestAnalysis = mutation({
  args: {
    username: v.string(),
  },
  returns: v.object({
    queued: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const normalizedUsername = normalizeGitHubUsername({
      username: args.username,
    })

    console.log('[shipmax]', 'request_analysis_start', {
      normalizedUsername,
      requestedUsername: args.username,
    })

    if (
      !normalizedUsername ||
      !isValidGitHubUsername({ username: normalizedUsername })
    ) {
      console.error('[shipmax]', 'request_analysis_invalid_username', {
        normalizedUsername,
        requestedUsername: args.username,
      })

      appError({
        code: 'INVALID_GITHUB_USERNAME',
        message: 'Enter a valid GitHub username.',
      })
    }

    const usernameLower = toUsernameLower({ username: normalizedUsername })
    const now = Date.now()

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', usernameLower)
      )
      .unique()

    const existingStatus = await ctx.db
      .query('analysisStatuses')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', usernameLower)
      )
      .unique()

    if (
      existingUser &&
      isFreshAnalysis({ analyzedAt: existingUser.analyzedAt, now })
    ) {
      console.log('[shipmax]', 'request_analysis_cache_hit', {
        analyzedAt: existingUser.analyzedAt,
        normalizedUsername,
      })

      if (existingStatus) {
        await ctx.db.delete(existingStatus._id)
      }

      return { queued: false }
    }

    if (existingStatus?.status === 'pending') {
      console.log('[shipmax]', 'request_analysis_already_pending', {
        normalizedUsername,
      })

      return { queued: false }
    }

    const statusPayload = {
      username: existingUser?.username ?? normalizedUsername,
      usernameLower,
      status: 'pending' as const,
      message: 'ACCESSING HUNTER DATABASE.',
      updatedAt: now,
    }

    if (existingStatus) {
      await ctx.db.patch(existingStatus._id, statusPayload)
    } else {
      await ctx.db.insert('analysisStatuses', statusPayload)
    }

    console.log('[shipmax]', 'request_analysis_scheduled', {
      hadExistingStatus: Boolean(existingStatus),
      hadExistingUser: Boolean(existingUser),
      normalizedUsername,
    })

    await ctx.scheduler.runAfter(0, internal.users.actions.analyzeUser, {
      username: normalizedUsername,
    })

    return { queued: true }
  },
})

export const saveAnalysisResult = internalMutation({
  args: {
    result: saveAnalysisResultValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log('[shipmax]', 'save_analysis_result_start', {
      normalizedUsername: args.result.usernameLower,
      score: args.result.score,
      username: args.result.username,
    })

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', args.result.usernameLower)
      )
      .unique()

    const existingStatus = await ctx.db
      .query('analysisStatuses')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', args.result.usernameLower)
      )
      .unique()

    const appStats = await getAppStats({ ctx })

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        username: args.result.username,
        usernameLower: args.result.usernameLower,
        avatarUrl: args.result.avatarUrl,
        rank: args.result.rank,
        rankTitle: args.result.rankTitle,
        score: args.result.score,
        roast: args.result.roast,
        stats: args.result.stats,
        rawData: args.result.rawData,
        analyzedAt: args.result.lastScannedAt,
      })
    } else {
      await ctx.db.insert('users', {
        username: args.result.username,
        usernameLower: args.result.usernameLower,
        avatarUrl: args.result.avatarUrl,
        rank: args.result.rank,
        rankTitle: args.result.rankTitle,
        score: args.result.score,
        roast: args.result.roast,
        stats: args.result.stats,
        rawData: args.result.rawData,
        analyzedAt: args.result.lastScannedAt,
      })
    }

    const nextScoreCounts = adjustScoreCounts({
      scoreCounts: appStats.scoreCounts,
      previousScore: existingUser?.score ?? null,
      nextScore: args.result.score,
    })

    await ctx.db.patch(appStats._id, {
      totalRanked: existingUser
        ? appStats.totalRanked
        : appStats.totalRanked + 1,
      scoreCounts: nextScoreCounts,
    })

    if (existingStatus) {
      await ctx.db.delete(existingStatus._id)
    }

    console.log('[shipmax]', 'save_analysis_result_complete', {
      normalizedUsername: args.result.usernameLower,
      score: args.result.score,
      totalRanked: existingUser
        ? appStats.totalRanked
        : appStats.totalRanked + 1,
      updatedExistingUser: Boolean(existingUser),
    })

    return null
  },
})

export const saveOgImageStorageId = internalMutation({
  args: {
    usernameLower: v.string(),
    storageId: v.id('_storage'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', args.usernameLower)
      )
      .unique()

    if (!existingUser) {
      return null
    }

    if (existingUser.ogImageStorageId) {
      await ctx.storage.delete(existingUser.ogImageStorageId)
    }

    await ctx.db.patch(existingUser._id, {
      ogImageStorageId: args.storageId,
    })

    return null
  },
})

export const saveAnalysisStatus = internalMutation({
  args: {
    username: v.string(),
    usernameLower: v.string(),
    status: analysisStatusValidator,
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log('[shipmax]', 'save_analysis_status', {
      message: args.message,
      normalizedUsername: args.usernameLower,
      status: args.status,
      username: args.username,
    })

    const existingStatus = await ctx.db
      .query('analysisStatuses')
      .withIndex('by_username_lower', (query) =>
        query.eq('usernameLower', args.usernameLower)
      )
      .unique()

    const nextStatus = {
      username: args.username,
      usernameLower: args.usernameLower,
      status: args.status,
      message: args.message,
      updatedAt: Date.now(),
    }

    if (existingStatus) {
      await ctx.db.patch(existingStatus._id, nextStatus)
    } else {
      await ctx.db.insert('analysisStatuses', nextStatus)
    }

    return null
  },
})
