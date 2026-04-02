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
    <div className="flex flex-col items-center gap-1.5 pt-9 md:gap-2 md:pt-12">
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={username}
        crossOrigin="anonymous"
        className="size-[72px] shrink-0 rounded-full object-cover md:size-[90px]"
        style={{
          border: `3px solid rgba(${rgb}, 0.5)`,
          boxShadow: `0 0 20px rgba(${rgb}, 0.15)`,
        }}
      />

      {/* Username */}
      <span className="mt-2 text-[18px] leading-[22px] font-semibold tracking-[2px] text-[#DBEAFE] md:text-[22px] md:leading-7">
        {username}
      </span>

      {/* Rank letter */}
      <span
        className="font-display text-[80px] leading-none font-bold md:text-[100px]"
        style={{ color: `rgb(${rgb})` }}
      >
        {rank}
      </span>

      {/* Rank title */}
      <span
        className="text-[10px] leading-3 font-semibold tracking-[4px] uppercase md:text-[12px] md:leading-4 md:tracking-[5px]"
        style={{ color: `rgba(${rgb}, 0.5)` }}
      >
        {rankTitle}
      </span>

      {/* Score */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-[28px] leading-[34px] font-bold md:text-[32px] md:leading-10"
          style={{ color: `rgb(${rgb})` }}
        >
          {score}
        </span>
        <span
          className="text-[12px] leading-4 font-medium md:text-[14px] md:leading-[18px]"
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
      <p className="mt-1 max-w-[320px] text-center text-[12px] leading-[1.5] text-[rgba(219,234,254,0.4)] italic md:mt-2 md:max-w-[500px] md:text-[13px]">
        &ldquo;{roast}&rdquo;
      </p>
    </div>
  )
}

export { ProfileHero }
export type { ProfileHeroProps }
