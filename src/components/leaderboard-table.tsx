import { cn } from '@/utils/cn'
import { type Rank } from './leaderboard-card'

type LeaderboardEntry = {
  position: number
  avatarUrl: string
  username: string
  rank: Rank
  score: number
}

type LeaderboardTableProps = {
  entries: Array<LeaderboardEntry>
  className?: string
}

const RANK_TEXT: Record<Rank, string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
}

// RGB values for computing tinted colors on the #1 row
const RANK_RGB: Record<Rank, string> = {
  S: '251, 191, 36',
  A: '167, 139, 250',
  B: '59, 130, 246',
  C: '34, 197, 94',
  D: '107, 114, 128',
  E: '239, 68, 68',
}

function LeaderboardTable({ entries, className }: LeaderboardTableProps) {
  return (
    <div className={cn('flex w-full flex-col md:w-[800px]', className)}>
      {/* Column headers — desktop only */}
      <div className="hidden items-center border-b border-[rgba(59,130,246,0.1)] px-5 py-2.5 md:flex">
        <span className="w-[50px] shrink-0 text-[10px] leading-3 font-semibold tracking-[2px] text-[rgba(96,165,250,0.3)]">
          #
        </span>
        <div className="w-9 shrink-0" />
        <span className="flex-1 text-[10px] leading-3 font-semibold tracking-[2px] text-[rgba(96,165,250,0.3)]">
          HUNTER
        </span>
        <span className="w-[60px] shrink-0 text-center text-[10px] leading-3 font-semibold tracking-[2px] text-[rgba(96,165,250,0.3)]">
          RANK
        </span>
        <span className="w-[60px] shrink-0 text-right text-[10px] leading-3 font-semibold tracking-[2px] text-[rgba(96,165,250,0.3)]">
          SCORE
        </span>
      </div>

      {/* Rows */}
      {entries.map((entry, i) => {
        const isFirst = entry.position === 1
        const isLast = i === entries.length - 1
        const rgb = RANK_RGB[entry.rank]

        return (
          <div
            key={entry.username}
            className={cn(
              'flex items-center',
              'gap-2.5 px-3 py-3 md:gap-0 md:px-5 md:py-3.5',
              !isLast && 'border-b border-[rgba(59,130,246,0.06)]'
            )}
            style={
              isFirst ? { backgroundColor: `rgba(${rgb}, 0.03)` } : undefined
            }
          >
            {/* Position */}
            <span
              className="w-6 shrink-0 text-[13px] leading-4 font-bold md:w-[50px] md:text-[14px] md:leading-[18px]"
              style={{
                color: isFirst
                  ? `rgba(${rgb}, 0.6)`
                  : 'rgba(148, 163, 184, 0.4)',
              }}
            >
              {entry.position}
            </span>

            {/* Avatar */}
            <img
              src={entry.avatarUrl}
              alt={entry.username}
              className="size-6 shrink-0 rounded-full object-cover md:mr-2 md:size-7"
            />

            {/* Username */}
            <span className="text-text-primary min-w-0 flex-1 truncate text-[13px] leading-4 font-semibold md:text-[14px] md:leading-[18px]">
              {entry.username}
            </span>

            {/* Rank */}
            <span
              className={cn(
                'shrink-0 font-bold',
                'text-[16px] leading-5 md:w-[60px] md:text-center md:text-[18px] md:leading-[22px]',
                RANK_TEXT[entry.rank]
              )}
            >
              {entry.rank}
            </span>

            {/* Score */}
            <span
              className="w-7 shrink-0 text-right text-[12px] leading-4 font-semibold md:w-[60px] md:text-[14px] md:leading-[18px]"
              style={{
                color: isFirst
                  ? `rgba(${rgb}, 0.6)`
                  : 'rgba(96, 165, 250, 0.5)',
              }}
            >
              {entry.score}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { LeaderboardTable }
export type { LeaderboardTableProps, LeaderboardEntry }
