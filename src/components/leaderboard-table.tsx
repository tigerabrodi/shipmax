import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
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
  const rowsRef = useRef<HTMLDivElement | null>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    function updateScrollMargin() {
      const rowsElement = rowsRef.current

      if (!rowsElement) {
        return
      }

      setScrollMargin(rowsElement.getBoundingClientRect().top + window.scrollY)
    }

    updateScrollMargin()
    window.addEventListener('resize', updateScrollMargin)

    return () => {
      window.removeEventListener('resize', updateScrollMargin)
    }
  }, [entries.length])

  const rowVirtualizer = useWindowVirtualizer({
    count: entries.length,
    estimateSize: () => 56,
    overscan: 8,
    scrollMargin,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  const measureRow = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) {
        return
      }

      rowVirtualizer.measureElement(element)
    },
    [rowVirtualizer]
  )

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
      <div ref={rowsRef} className="relative">
        <div
          className="relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map((virtualRow) => {
            const entry = entries[virtualRow.index]
            const isLast = virtualRow.index === entries.length - 1

            return (
              <div
                key={virtualRow.key}
                ref={measureRow}
                className="absolute top-0 left-0 w-full"
                data-index={virtualRow.index}
                style={{
                  transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                }}
              >
                <LeaderboardTableRow entry={entry} isLast={isLast} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LeaderboardTableRow({
  entry,
  isLast,
}: {
  entry: LeaderboardEntry
  isLast: boolean
}) {
  const isFirst = entry.position === 1
  const rgb = RANK_RGB[entry.rank]

  return (
    <div
      className={cn(
        'flex items-center',
        'gap-2.5 px-3 py-3 md:gap-0 md:px-5 md:py-3.5',
        !isLast && 'border-b border-[rgba(59,130,246,0.06)]'
      )}
      style={isFirst ? { backgroundColor: `rgba(${rgb}, 0.03)` } : undefined}
    >
      {/* Position */}
      <span
        className="w-6 shrink-0 text-[13px] leading-4 font-bold md:w-[50px] md:text-[14px] md:leading-[18px]"
        style={{
          color: isFirst ? `rgba(${rgb}, 0.6)` : 'rgba(148, 163, 184, 0.4)',
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
          color: isFirst ? `rgba(${rgb}, 0.6)` : 'rgba(96, 165, 250, 0.5)',
        }}
      >
        {entry.score}
      </span>
    </div>
  )
}

export { LeaderboardTable }
export type { LeaderboardTableProps, LeaderboardEntry }
