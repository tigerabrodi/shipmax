import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { type ReactNode } from 'react'
import { RiftLoading } from '@/components/rift-loading'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { api } from '@convex/_generated/api'
import './leaderboard.css'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const entries = useQuery(api.leaderboard.queries.list, {})
  const totalHunters = entries?.length.toLocaleString() ?? '...'
  let leaderboardContent: ReactNode

  if (entries === undefined) {
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

function LeaderboardEmptyState() {
  return (
    <div className="mt-8 flex w-full justify-center px-4 md:mt-10 md:px-0">
      <div className="flex min-h-[160px] w-full max-w-[800px] items-center justify-center border border-[#3B82F624] bg-[#08101d99] px-6 text-center text-[12px] leading-[18px] font-medium tracking-[2px] text-[#93C5FD80] md:text-[13px]">
        NO HUNTERS RANKED YET.
      </div>
    </div>
  )
}
