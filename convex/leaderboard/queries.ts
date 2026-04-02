import {
  paginationOptsValidator,
  paginationResultValidator,
} from 'convex/server'
import { v } from 'convex/values'
import { query } from '../_generated/server'
import { rankValidator } from '../schema'
import { APP_STATS_NAME } from '../users/shared'

const leaderboardUserValidator = v.object({
  avatarUrl: v.string(),
  username: v.string(),
  rank: rankValidator,
  score: v.number(),
})

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(leaderboardUserValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_score')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const totalRanked = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const appStats = await ctx.db
      .query('appStats')
      .withIndex('by_name', (query) => query.eq('name', APP_STATS_NAME))
      .unique()

    return appStats?.totalRanked ?? 0
  },
})
