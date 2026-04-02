import { StatBar } from '@/components/stat-bar'

type ProfileStatBarsProps = {
  stats: {
    consistency: number
    recentActivity: number
    volume: number
    stars: number
    community: number
  }
}

const STAT_LABELS: Array<{
  key: keyof ProfileStatBarsProps['stats']
  label: string
}> = [
  { key: 'consistency', label: 'Consistency' },
  { key: 'recentActivity', label: 'Activity' },
  { key: 'volume', label: 'Volume' },
  { key: 'stars', label: 'Stars' },
  { key: 'community', label: 'Community' },
]

function ProfileStatBars({ stats }: ProfileStatBarsProps) {
  return (
    <div className="flex w-full flex-col gap-2 px-5 pt-4 md:w-[460px] md:gap-1.5 md:px-0 md:pt-0">
      {STAT_LABELS.map(({ key, label }) => (
        <StatBar key={key} label={label} value={stats[key]} />
      ))}
    </div>
  )
}

export { ProfileStatBars }
export type { ProfileStatBarsProps }
