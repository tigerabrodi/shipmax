import { type Rank } from '@/components/leaderboard-card'
import { RANK_RGB } from './rank-styles'

type ProfileFunStatsProps = {
  rank: Rank
  streak: number
  bestStreak: number
  mostActiveDay: string
  topLanguage: string
  totalStars: string
}

type StatItem = {
  label: string
  value: string
}

function ProfileFunStats({
  rank,
  streak,
  bestStreak,
  mostActiveDay,
  topLanguage,
  totalStars,
}: ProfileFunStatsProps) {
  const rgb = RANK_RGB[rank]

  const items: Array<StatItem> = [
    { label: 'STREAK', value: String(streak) },
    { label: 'BEST', value: String(bestStreak) },
    { label: 'ACTIVE', value: mostActiveDay },
    { label: 'TOP LANG', value: topLanguage },
    { label: 'STARS', value: totalStars },
  ]

  return (
    <div className="flex w-full flex-wrap gap-0.5 px-5 pt-5 md:w-auto md:px-0 md:pt-0">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            // Mobile: first 3 in a row, last 2 in a row. Desktop: all in one row.
            i < 3
              ? 'flex w-[calc(33.33%-2px)] flex-col items-center gap-0.5 border border-[#3B82F61F] bg-[#3B82F608] px-1 py-3 md:w-auto md:gap-1 md:px-7 md:py-4'
              : 'flex w-[calc(50%-1px)] flex-col items-center gap-0.5 border border-[#3B82F61F] bg-[#3B82F608] px-1 py-3 md:w-auto md:gap-1 md:px-7 md:py-4'
          }
        >
          <span className="md:text-micro text-[8px] leading-[10px] font-semibold tracking-[1px] text-[#60A5FA66] uppercase md:leading-3 md:tracking-[2px]">
            {item.label}
          </span>
          <span
            className="text-[20px] leading-6 font-bold md:text-[24px] md:leading-[30px]"
            style={{ color: `rgb(${rgb})` }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export { ProfileFunStats }
export type { ProfileFunStatsProps }
