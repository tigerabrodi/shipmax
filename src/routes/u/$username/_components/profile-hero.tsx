import { type Rank } from '@/components/leaderboard-card'
import { RANK_RGB } from './rank-styles'

type ProfileHeroProps = {
  avatarUrl: string
  username: string
  rank: Rank
  rankTitle: string
  score: number
  position: number
  totalRanked: number
  roast: string
}

function ProfileHero({
  avatarUrl,
  username,
  rank,
  rankTitle,
  score,
  position,
  totalRanked,
  roast,
}: ProfileHeroProps) {
  const rgb = RANK_RGB[rank]

  return (
    <div className="flex flex-col items-center gap-1.5 pt-9 md:gap-1 md:pt-6">
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={username}
        crossOrigin="anonymous"
        className="size-[72px] shrink-0 rounded-full object-cover md:size-[72px]"
        style={{
          border: `3px solid rgba(${rgb}, 0.5)`,
          boxShadow: `0 0 20px rgba(${rgb}, 0.15)`,
        }}
      />

      {/* Username */}
      <span className="mt-2 text-[18px] leading-[22px] font-semibold tracking-[2px] text-[#DBEAFE] md:mt-1 md:text-[20px] md:leading-6">
        {username}
      </span>

      {/* Rank letter */}
      <span
        className="font-display text-[80px] leading-none font-bold md:text-[72px]"
        style={{ color: `rgb(${rgb})` }}
      >
        {rank}
      </span>

      {/* Rank title */}
      <span
        className="text-[10px] leading-3 font-semibold tracking-[4px] uppercase md:text-[10px] md:leading-3 md:tracking-[4px]"
        style={{ color: `rgba(${rgb}, 0.5)` }}
      >
        {rankTitle}
      </span>

      {/* Score */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-[28px] leading-[34px] font-bold md:text-[26px] md:leading-8"
          style={{ color: `rgb(${rgb})` }}
        >
          {score}
        </span>
        <span
          className="text-[12px] leading-4 font-medium md:text-[12px] md:leading-4"
          style={{ color: `rgba(${rgb}, 0.4)` }}
        >
          /100
        </span>
      </div>

      {/* Leaderboard position */}
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] leading-4 font-semibold text-[rgba(96,165,250,0.5)] md:text-[13px]">
          #{position}
        </span>
        <span className="text-[12px] leading-4 font-normal text-[rgba(148,163,184,0.35)] md:text-[13px]">
          of {totalRanked.toLocaleString()} hunters ranked
        </span>
      </div>

      {/* Roast */}
      <p className="mt-1 max-w-[320px] text-center text-[12px] leading-[1.5] text-[rgba(219,234,254,0.4)] italic md:mt-1 md:max-w-[460px] md:text-[12px]">
        &ldquo;{roast}&rdquo;
      </p>
    </div>
  )
}

export { ProfileHero }
export type { ProfileHeroProps }
