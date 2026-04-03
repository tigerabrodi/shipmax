import { v } from 'convex/values'
import { rankValidator, rawDataValidator, statsValidator } from '../schema'

const ANALYSIS_CACHE_WINDOW_MS = 24 * 60 * 60 * 1000
const APP_STATS_NAME = 'global'

const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

const RANK_TITLES = {
  S: 'NATIONAL LEVEL HUNTER',
  A: 'S-GATE SURVIVOR',
  B: 'B-RANK HUNTER',
  C: 'C-RANK HUNTER',
  D: 'E-GATE FODDER',
  E: 'UNAWAKENED',
} as const

const RANK_ROASTS = {
  S: [
    'You mass report people with green GitHub graphs because yours is greener. Sleep is a mass delusion you opted out of.',
    'Your commit graph looks like a live fire exercise. Even GitHub thinks you need supervision.',
    'You do not ship features. You summon them into existence and leave the rest of us to cope.',
  ],
  A: [
    'Your git log is longer than your screen time report and both should be reported to authorities.',
    'You ship so often your repo history looks like an emergency alert feed.',
    'Your green squares are less a habit and more a public threat assessment.',
  ],
  B: [
    "You ship. Not daily. But enough that your GitHub doesn't need a welfare check.",
    'You are one focused weekend away from alarming everyone in your following list.',
    'You are not a machine yet. But the machine rumors are getting harder to deny.',
  ],
  C: [
    'You open VS Code. Stare at it. Open Twitter. Close Twitter. Open VS Code. Repeat.',
    'There is talent here. It just keeps getting ambushed by side quests and snacks.',
    'Your repo has signs of life. We just need more witnesses before we call it thriving.',
  ],
  D: [
    'You starred 200 repos and built nothing. You are the mass audience.',
    'Your GitHub has potential energy. Actual energy is still under review.',
    'You keep circling the dungeon entrance like you forgot where the quest giver stands.',
  ],
  E: [
    'Your GitHub profile is a missing person case. Even your README gave up and left.',
    'This hunter just awakened. The sword is still in the box and that is okay for now.',
    'The Rift detected a pulse. It was faint. But technically it was there.',
  ],
} as const

const HOME_HUNTER_VALIDATOR = v.object({
  username: v.string(),
  avatarUrl: v.string(),
  rank: rankValidator,
})

const PROFILE_READY_VALIDATOR = v.object({
  username: v.string(),
  avatarUrl: v.string(),
  rank: rankValidator,
  rankTitle: v.string(),
  score: v.number(),
  roast: v.string(),
  stats: statsValidator,
  rawData: rawDataValidator,
  position: v.number(),
  totalRanked: v.number(),
  lastScannedAt: v.number(),
})

const PROFILE_SHARE_READY_VALIDATOR = v.object({
  username: v.string(),
  avatarUrl: v.string(),
  rank: rankValidator,
  rankTitle: v.string(),
  score: v.number(),
  roast: v.string(),
  stats: statsValidator,
  position: v.number(),
  totalRanked: v.number(),
  lastScannedAt: v.number(),
})

const PROFILE_STATE_VALIDATOR = v.union(
  v.object({
    status: v.literal('ready'),
    profile: PROFILE_READY_VALIDATOR,
  }),
  v.object({
    status: v.literal('pending'),
    username: v.string(),
  }),
  v.object({
    status: v.literal('should_analyze'),
    username: v.string(),
  }),
  v.object({
    status: v.literal('not_found'),
    username: v.string(),
    message: v.string(),
  }),
  v.object({
    status: v.literal('error'),
    username: v.string(),
    message: v.string(),
  })
)

const PROFILE_SHARE_STATE_VALIDATOR = v.union(
  v.object({
    status: v.literal('ready'),
    profile: PROFILE_SHARE_READY_VALIDATOR,
  }),
  v.object({
    status: v.literal('pending'),
    username: v.string(),
  }),
  v.object({
    status: v.literal('should_analyze'),
    username: v.string(),
  }),
  v.object({
    status: v.literal('not_found'),
    username: v.string(),
    message: v.string(),
  }),
  v.object({
    status: v.literal('error'),
    username: v.string(),
    message: v.string(),
  })
)

const HOME_SUMMARY_VALIDATOR = v.object({
  featuredHunters: v.array(HOME_HUNTER_VALIDATOR),
  totalRanked: v.number(),
})

function normalizeGitHubUsername({ username }: { username: string }): string {
  const trimmedUsername = username.trim()
  const withoutProtocol = trimmedUsername.replace(
    /^https?:\/\/github\.com\//i,
    ''
  )
  const withoutAt = withoutProtocol.replace(/^@/, '')
  const withoutQuery = withoutAt.split(/[?#]/)[0] ?? withoutAt
  const withoutTrailingSlash = withoutQuery.replace(/\/+$/, '')
  const firstSegment = withoutTrailingSlash.split('/')[0]

  return firstSegment?.trim() ?? ''
}

function isValidGitHubUsername({ username }: { username: string }): boolean {
  return GITHUB_USERNAME_PATTERN.test(username)
}

function toUsernameLower({ username }: { username: string }): string {
  return username.toLowerCase()
}

function isFreshAnalysis({
  analyzedAt,
  now,
}: {
  analyzedAt: number
  now: number
}): boolean {
  return now - analyzedAt < ANALYSIS_CACHE_WINDOW_MS
}

function getScoreBucketKey({ score }: { score: number }): string {
  return String(score)
}

export {
  ANALYSIS_CACHE_WINDOW_MS,
  APP_STATS_NAME,
  HOME_HUNTER_VALIDATOR,
  HOME_SUMMARY_VALIDATOR,
  PROFILE_READY_VALIDATOR,
  PROFILE_SHARE_READY_VALIDATOR,
  PROFILE_SHARE_STATE_VALIDATOR,
  PROFILE_STATE_VALIDATOR,
  RANK_ROASTS,
  RANK_TITLES,
  getScoreBucketKey,
  isFreshAnalysis,
  isValidGitHubUsername,
  normalizeGitHubUsername,
  toUsernameLower,
}
