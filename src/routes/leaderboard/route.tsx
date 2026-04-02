import { createFileRoute, Link } from '@tanstack/react-router'
import {
  LeaderboardTable,
  type LeaderboardEntry,
} from '@/components/leaderboard-table'
import { type Rank } from '@/components/leaderboard-card'
import './leaderboard.css'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

// TODO: Replace with Convex query — useQuery(api.leaderboard.list)
const MOCK_ENTRIES: Array<LeaderboardEntry> = [
  {
    position: 1,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'torvalds',
    rank: 'S' as Rank,
    score: 97,
  },
  {
    position: 2,
    avatarUrl: 'https://avatars.githubusercontent.com/u/170270?v=4',
    username: 'sindresorhus',
    rank: 'S' as Rank,
    score: 92,
  },
  {
    position: 3,
    avatarUrl: 'https://avatars.githubusercontent.com/u/25254?v=4',
    username: 'tj',
    rank: 'S' as Rank,
    score: 89,
  },
  {
    position: 4,
    avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
    username: 'gaearon',
    rank: 'A' as Rank,
    score: 78,
  },
  {
    position: 5,
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    username: 'shadcn',
    rank: 'A' as Rank,
    score: 74,
  },
  {
    position: 6,
    avatarUrl: 'https://avatars.githubusercontent.com/u/45585937?v=4',
    username: 'tigerabrodi',
    rank: 'B' as Rank,
    score: 63,
  },
  {
    position: 7,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'devhunter99',
    rank: 'C' as Rank,
    score: 48,
  },
  {
    position: 8,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'codejunkie',
    rank: 'D' as Rank,
    score: 31,
  },
  {
    position: 9,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'newdev2026',
    rank: 'E' as Rank,
    score: 12,
  },
]

// TODO: Replace with Convex query — useQuery(api.leaderboard.totalCount)
const MOCK_TOTAL_HUNTERS = '2,847'

function LeaderboardPage() {
  // TODO: Wire up Convex queries
  // const entries = useQuery(api.leaderboard.list)
  // const totalCount = useQuery(api.leaderboard.totalCount)
  const entries = MOCK_ENTRIES
  const totalHunters = MOCK_TOTAL_HUNTERS

  return (
    <div className="leaderboard-page relative flex min-h-screen flex-col items-center overflow-clip">
      {/* Decorative border — desktop only */}
      <div className="pointer-events-none absolute inset-4 hidden border border-[#3B82F61F] md:block" />

      {/* Header */}
      <div className="relative flex flex-col items-center gap-1 pt-9 md:gap-1.5 md:pt-12">
        <h2 className="font-display text-[16px] leading-[20px] font-bold tracking-[3px] text-[#DBEAFE80] md:text-[20px] md:leading-[24px] md:tracking-[4px]">
          SHIPMAX
        </h2>
        <h1 className="text-[20px] leading-[24px] font-bold tracking-[3px] text-[#DBEAFE] md:text-[32px] md:leading-[40px] md:tracking-[4px]">
          NATIONAL RANKINGS
        </h1>

        {/* Desktop: decorative divider with hunter count */}
        <div className="mt-1 hidden items-center gap-[10px] md:flex">
          <div className="leaderboard-line-left h-px w-[50px]" />
          <span className="text-[10px] leading-[12px] font-medium tracking-[3px] text-[#60A5FA4D]">
            {totalHunters} HUNTERS RANKED
          </span>
          <div className="leaderboard-line-right h-px w-[50px]" />
        </div>

        {/* Mobile: plain hunter count */}
        <p className="mt-0.5 text-[10px] leading-[12px] font-medium tracking-[2px] text-[#60A5FA4D] md:hidden">
          {totalHunters} HUNTERS
        </p>
      </div>

      {/* Leaderboard table */}
      {/* TODO: Add loading state (RiftLoading) while entries are undefined */}
      {/* TODO: Add empty state if no entries returned */}
      <LeaderboardTable
        entries={entries}
        className="mt-5 px-4 md:mt-8 md:px-0"
      />

      {/* Back link */}
      <Link
        to="/"
        className="mt-5 pb-12 text-[12px] leading-[16px] font-medium text-[#60A5FA66] md:mt-6 md:pb-16"
      >
        ← Back to home
      </Link>
    </div>
  )
}
