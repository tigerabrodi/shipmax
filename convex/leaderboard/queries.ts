import { buildLeaderboardEntries } from '../../src/lib/leaderboard/build-leaderboard-entries'
import { query } from '../_generated/server'
import { v } from 'convex/values'
import { leaderboardEntryValidator } from '../../src/lib/leaderboard/build-leaderboard-entries'

export const list = query({
  args: {},
  returns: v.array(leaderboardEntryValidator),
  handler: async (ctx) => {
    const users = await ctx.db
      .query('users')
      .withIndex('by_score')
      .order('desc')
      .collect()

    return buildLeaderboardEntries({
      users: users.map(({ avatarUrl, username, rank, score }) => ({
        avatarUrl,
        username,
        rank,
        score,
      })),
    })
  },
})
