import { cn } from '@/utils/cn'
import './github-chart.css'

type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE'

type ContributionDay = {
  date: string
  count: number
  level: ContributionLevel
  weekday: number
}

type ContributionWeek = {
  days: Array<ContributionDay>
}

type GitHubChartProps = {
  weeks: Array<ContributionWeek>
  className?: string
}

const LEVEL_BG: Record<ContributionLevel, string> = {
  NONE: 'bg-[rgba(59,130,246,0.08)]',
  FIRST_QUARTILE: 'bg-[rgba(59,130,246,0.3)]',
  SECOND_QUARTILE: 'bg-[rgba(59,130,246,0.5)]',
  THIRD_QUARTILE: 'bg-[rgba(59,130,246,0.7)]',
  FOURTH_QUARTILE: 'bg-blue',
}

const CELL_GAP = 2

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatTooltip(day: ContributionDay): string {
  const d = new Date(day.date)
  const month = SHORT_MONTHS[d.getMonth()]
  const date = d.getDate()
  const label =
    day.count === 1 ? '1 contribution' : `${day.count} contributions`
  return `${label} — ${month} ${date}`
}

function GitHubChart({ weeks, className }: GitHubChartProps) {
  return (
    <div className={cn('flex flex-col', className)} style={{ gap: 12 }}>
      <p
        className="font-body font-semibold uppercase"
        style={{
          fontSize: 10,
          letterSpacing: 3,
          lineHeight: '12px',
          color: 'rgba(96, 165, 250, 0.35)',
        }}
      >
        Contribution History
      </p>

      <div>
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
            gridTemplateRows: `repeat(7, auto)`,
            gap: CELL_GAP,
          }}
        >
          {Array.from({ length: 7 }, (_, dayIndex) =>
            weeks.map((week, weekIndex) => {
              const day = week.days.find((d) => d.weekday === dayIndex)

              if (!day) {
                return <div key={`${weekIndex}-${dayIndex}`} />
              }

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  data-tooltip={formatTooltip(day)}
                  className={cn(
                    'contribution-cell rounded-sm',
                    LEVEL_BG[day.level]
                  )}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export { GitHubChart }
export type {
  GitHubChartProps,
  ContributionDay,
  ContributionWeek,
  ContributionLevel,
}
