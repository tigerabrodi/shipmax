import { cn } from '@/utils/cn'

type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

type LeaderboardCardProps = {
  avatarUrl: string
  username: string
  rank: Rank
  className?: string
}

const RANK_COLOR: Record<Rank, string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
}

function LeaderboardCard({
  avatarUrl,
  username,
  rank,
  className,
}: LeaderboardCardProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-sm border px-3.5 py-2.5 md:px-4',
        'border-border bg-bg-button',
        'hover:border-border-bright hover:shadow-glow-sm hover:bg-[rgba(37,99,235,0.1)]',
        'active:border-[rgba(96,165,250,0.45)] active:bg-[rgba(37,99,235,0.14)] active:shadow-none',
        'transition-all duration-150',
        className
      )}
    >
      <img
        src={avatarUrl}
        alt={username}
        className="size-5 shrink-0 rounded-sm object-cover md:size-[22px]"
      />
      <span className="text-small text-text-primary min-w-0 flex-1 truncate leading-4 font-medium md:flex-initial md:shrink-0">
        {username}
      </span>
      <span
        className={cn(
          'shrink-0 text-[16px] leading-5 font-bold',
          RANK_COLOR[rank]
        )}
      >
        {rank}
      </span>
    </div>
  )
}

export { LeaderboardCard }
export type { LeaderboardCardProps, Rank }
