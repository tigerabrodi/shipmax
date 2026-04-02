import { createFileRoute } from '@tanstack/react-router'
import { type Rank } from '@/components/leaderboard-card'
import {
  GitHubChart,
  type ContributionWeek,
  type ContributionLevel,
} from '@/components/github-chart'
import { ProfileHero } from './_components/profile-hero'
import { ProfileStatBars } from './_components/profile-stat-bars'
import { ProfileFunStats } from './_components/profile-fun-stats'
import { ProfileActions } from './_components/profile-actions'

export const Route = createFileRoute('/u/$username')({
  component: ProfilePage,
  // TODO: loader should fetch user data from Convex via `api.users.getByUsername`
  // If user not found, trigger analysis action and show loading state
})

// --- Mock data (replace with Convex query results) ---

const MOCK_RANK: Rank = 'S'

const MOCK_STATS = {
  consistency: 95,
  recentActivity: 98,
  volume: 100,
  stars: 100,
  community: 88,
}

function generateMockWeeks(): Array<ContributionWeek> {
  const weeks: Array<ContributionWeek> = []
  const start = new Date('2025-04-06')
  for (let w = 0; w < 52; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const rand = Math.random()
      let level: ContributionLevel
      if (rand < 0.25) level = 'NONE'
      else if (rand < 0.45) level = 'FIRST_QUARTILE'
      else if (rand < 0.65) level = 'SECOND_QUARTILE'
      else if (rand < 0.85) level = 'THIRD_QUARTILE'
      else level = 'FOURTH_QUARTILE'
      const countMap: Record<ContributionLevel, number> = {
        NONE: 0,
        FIRST_QUARTILE: Math.floor(Math.random() * 3) + 1,
        SECOND_QUARTILE: Math.floor(Math.random() * 5) + 4,
        THIRD_QUARTILE: Math.floor(Math.random() * 8) + 9,
        FOURTH_QUARTILE: Math.floor(Math.random() * 12) + 17,
      }
      days.push({
        date: date.toISOString().split('T')[0],
        count: countMap[level],
        level,
        weekday: d,
      })
    }
    weeks.push({ days })
  }
  return weeks
}

const MOCK_WEEKS = generateMockWeeks()

// --- End mock data ---

function ProfilePage() {
  const { username } = Route.useParams()
  // TODO: const user = useQuery(api.users.getByUsername, { username })
  // TODO: handle loading / not-found states

  return (
    <div className="bg-bg flex min-h-screen flex-col items-center pb-12">
      <ProfileHero
        avatarUrl="https://avatars.githubusercontent.com/u/1024025?v=4"
        username={username}
        rank={MOCK_RANK}
        rankTitle="NATIONAL LEVEL HUNTER"
        score={97}
        position={4}
        totalRanked={2847}
        roast="You mass report people with green GitHub graphs because yours is greener."
      />

      {/* Stat bars */}
      <div className="mt-4 w-full md:mt-8 md:w-auto">
        <ProfileStatBars stats={MOCK_STATS} />
      </div>

      {/* Contribution chart — desktop only */}
      <div className="mt-6 hidden md:block">
        <GitHubChart weeks={MOCK_WEEKS} className="w-[740px]" />
      </div>

      {/* Fun stats */}
      <div className="mt-0 w-full md:mt-6 md:w-auto">
        <ProfileFunStats
          rank={MOCK_RANK}
          streak={247}
          bestStreak={365}
          mostActiveDay="Mon"
          topLanguage="C"
          totalStars="178k"
        />
      </div>

      <ProfileActions />
    </div>
  )
}
