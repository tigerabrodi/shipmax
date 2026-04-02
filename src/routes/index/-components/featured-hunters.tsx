import { Link } from '@tanstack/react-router'
import { LeaderboardCard, type Rank } from '@/components/leaderboard-card'

// TODO: Replace with convex query for top hunters
const MOCK_HUNTERS: Array<{ username: string; rank: Rank; avatarUrl: string }> =
  [
    {
      username: 'torvalds',
      rank: 'S',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025',
    },
    {
      username: 'sindresorhus',
      rank: 'A',
      avatarUrl: 'https://avatars.githubusercontent.com/u/170270',
    },
    {
      username: 'gaearon',
      rank: 'A',
      avatarUrl: 'https://avatars.githubusercontent.com/u/810438',
    },
  ]

function FeaturedHunters() {
  return (
    <div className="mt-6 flex w-full flex-col gap-0.5 px-5 md:mt-6 md:w-auto md:flex-row md:items-center md:gap-2.5 md:px-0">
      {MOCK_HUNTERS.map((hunter) => (
        // TODO: Link to /u/$username when wired up
        <LeaderboardCard
          key={hunter.username}
          username={hunter.username}
          rank={hunter.rank}
          avatarUrl={hunter.avatarUrl}
          className="md:w-auto"
        />
      ))}
      <Link
        to="/leaderboard"
        className="hover:border-border md:text-caption flex items-center justify-center border border-[#60A5FA14] px-3.5 py-2 text-[11px] font-medium text-[#60A5FA73] transition-colors duration-150 hover:text-[#60A5FAB3] md:px-4 md:py-2.5"
      >
        <span className="md:hidden">View all hunters →</span>
        <span className="hidden md:inline">View all →</span>
      </Link>
    </div>
  )
}

export { FeaturedHunters }
