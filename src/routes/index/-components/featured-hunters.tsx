import { Link } from '@tanstack/react-router'
import { LeaderboardCard, type Rank } from '@/components/leaderboard-card'

type FeaturedHunter = {
  username: string
  rank: Rank
  avatarUrl: string
}

type FeaturedHuntersProps = {
  hunters: Array<FeaturedHunter>
}

function FeaturedHunters({ hunters }: FeaturedHuntersProps) {
  return (
    <div className="mt-6 flex w-full flex-col gap-0.5 px-5 md:mt-6 md:w-auto md:flex-row md:items-center md:gap-2.5 md:px-0">
      {hunters.length === 0 ? (
        <div className="border-border bg-bg-button text-text-muted flex items-center justify-center border px-4 py-3 text-[11px] font-medium tracking-[2px] uppercase md:min-w-[240px]">
          Awaiting first hunter analysis
        </div>
      ) : (
        hunters.map((hunter) => (
          <Link
            key={hunter.username}
            to="/u/$username"
            params={{ username: hunter.username }}
            className="block"
          >
            <LeaderboardCard
              username={hunter.username}
              rank={hunter.rank}
              avatarUrl={hunter.avatarUrl}
              className="md:w-auto"
            />
          </Link>
        ))
      )}
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
export type { FeaturedHunter, FeaturedHuntersProps }
