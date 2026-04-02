import { createFileRoute, Link } from '@tanstack/react-router'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { type ReactNode } from 'react'
import { RiftLoading } from '@/components/rift-loading'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { api } from '@convex/_generated/api'
import { cn } from '@/utils/cn'
import { buildLeaderboardEntries } from '@/lib/leaderboard/build-leaderboard-entries'
import './leaderboard.css'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

const INITIAL_PAGE_SIZE = 25
const LOAD_MORE_PAGE_SIZE = 25

function LeaderboardPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.leaderboard.queries.list,
    {},
    { initialNumItems: INITIAL_PAGE_SIZE }
  )
  const totalRanked = useQuery(api.leaderboard.queries.totalRanked, {})
  const entries = buildLeaderboardEntries({ users: results })
  const totalHunters =
    totalRanked?.toLocaleString() ??
    (status === 'LoadingFirstPage' ? '...' : entries.length.toLocaleString())
  let leaderboardContent: ReactNode
  const shouldShowLoadMore = entries.length > 0
  const isLoadMoreDisabled = status !== 'CanLoadMore'
  const loadMoreLabel = getLoadMoreLabel({ status })

  function handleLoadMore() {
    loadMore(LOAD_MORE_PAGE_SIZE)
  }

  if (status === 'LoadingFirstPage') {
    leaderboardContent = (
      <div className="mt-8 flex min-h-[320px] w-full items-center justify-center px-4 md:mt-10 md:px-0">
        <RiftLoading />
      </div>
    )
  } else if (entries.length === 0) {
    leaderboardContent = <LeaderboardEmptyState />
  } else {
    leaderboardContent = (
      <LeaderboardTable
        entries={entries}
        className="mt-5 px-4 md:mt-8 md:px-0"
      />
    )
  }

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
      {leaderboardContent}

      {shouldShowLoadMore ? (
        <div className="mt-6 flex w-full justify-center px-4 md:px-0">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadMoreDisabled}
            className={cn(
              'flex min-w-[220px] items-center justify-center border px-6 py-3 text-[12px] leading-4 font-semibold tracking-[2px] text-[#DBEAFECC] uppercase transition-[border-color,background-color,color] duration-150',
              {
                'border-[#60A5FA29] bg-[#0B1220CC] text-[#DBEAFECC] hover:border-[#60A5FA52] hover:bg-[#0F1728]':
                  !isLoadMoreDisabled,
                'cursor-default border-[#60A5FA14] bg-[#08101D99] text-[#60A5FA66]':
                  isLoadMoreDisabled,
              }
            )}
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : null}

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

function getLoadMoreLabel({
  status,
}: {
  status: 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted'
}) {
  switch (status) {
    case 'LoadingMore':
      return 'LOADING MORE'
    case 'Exhausted':
      return 'ALL HUNTERS LOADED'
    case 'CanLoadMore':
      return 'LOAD MORE'
    case 'LoadingFirstPage':
      return 'LOADING'
  }
}

function LeaderboardEmptyState() {
  return (
    <div className="mt-8 flex w-full justify-center px-4 md:mt-10 md:px-0">
      <div className="flex min-h-[160px] w-full max-w-[800px] items-center justify-center border border-[#3B82F624] bg-[#08101d99] px-6 text-center text-[12px] leading-[18px] font-medium tracking-[2px] text-[#93C5FD80] md:text-[13px]">
        NO HUNTERS RANKED YET.
      </div>
    </div>
  )
}
