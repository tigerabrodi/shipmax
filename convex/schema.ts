import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const rankValidator = v.union(
  v.literal('S'),
  v.literal('A'),
  v.literal('B'),
  v.literal('C'),
  v.literal('D'),
  v.literal('E')
)

export const analysisStatusValidator = v.union(
  v.literal('pending'),
  v.literal('not_found'),
  v.literal('error')
)

export const statsValidator = v.object({
  consistency: v.number(),
  recentActivity: v.number(),
  volume: v.number(),
  stars: v.number(),
  community: v.number(),
})

export const rawDataValidator = v.object({
  totalContributions: v.number(),
  activeWeeks: v.number(),
  currentStreak: v.number(),
  longestStreak: v.number(),
  totalStars: v.number(),
  totalPRs: v.number(),
  totalIssues: v.number(),
  totalReviews: v.number(),
  topLanguage: v.string(),
  mostActiveDay: v.string(),
  recentContributions: v.number(),
  contributionCalendar: v.array(
    v.object({
      days: v.array(
        v.object({
          date: v.string(),
          count: v.number(),
          level: v.union(
            v.literal('NONE'),
            v.literal('FIRST_QUARTILE'),
            v.literal('SECOND_QUARTILE'),
            v.literal('THIRD_QUARTILE'),
            v.literal('FOURTH_QUARTILE')
          ),
          weekday: v.number(),
        })
      ),
    })
  ),
})

export default defineSchema({
  users: defineTable({
    username: v.string(),
    usernameLower: v.string(),
    avatarUrl: v.string(),
    rank: rankValidator,
    rankTitle: v.string(),
    score: v.number(),
    roast: v.string(),
    stats: statsValidator,
    rawData: rawDataValidator,
    analyzedAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_username_lower', ['usernameLower'])
    .index('by_score', ['score'])
    .index('by_analyzed_at', ['analyzedAt']),
  analysisStatuses: defineTable({
    username: v.string(),
    usernameLower: v.string(),
    status: analysisStatusValidator,
    message: v.string(),
    updatedAt: v.number(),
  }).index('by_username_lower', ['usernameLower']),
  appStats: defineTable({
    name: v.string(),
    totalRanked: v.number(),
    scoreCounts: v.record(v.string(), v.number()),
  }).index('by_name', ['name']),
})
