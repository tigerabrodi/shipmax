import {
  GitHubChart,
  type ContributionWeek,
  type ContributionLevel,
} from '@/components/github-chart'
import { Section } from './section'

function generateDummyWeeks(): Array<ContributionWeek> {
  const weeks: Array<ContributionWeek> = []
  const start = new Date('2025-04-06')

  for (let w = 0; w < 52; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)

      const rand = Math.random()
      let level: ContributionLevel
      if (rand < 0.3) level = 'NONE'
      else if (rand < 0.55) level = 'FIRST_QUARTILE'
      else if (rand < 0.75) level = 'SECOND_QUARTILE'
      else if (rand < 0.9) level = 'THIRD_QUARTILE'
      else level = 'FOURTH_QUARTILE'

      const countMap: Record<ContributionLevel, number> = {
        NONE: 0,
        FIRST_QUARTILE: Math.floor(Math.random() * 3) + 1,
        SECOND_QUARTILE: Math.floor(Math.random() * 5) + 4,
        THIRD_QUARTILE: Math.floor(Math.random() * 8) + 9,
        FOURTH_QUARTILE: Math.floor(Math.random() * 12) + 17,
      }

      days.push({
        date: date.toISOString().split('T')[0],
        count: countMap[level],
        level,
        weekday: d,
      })
    }
    weeks.push({ days })
  }

  return weeks
}

const DUMMY_WEEKS = generateDummyWeeks()

function GitHubChartShowcase() {
  return (
    <Section title="GitHub Contribution Chart">
      <GitHubChart weeks={DUMMY_WEEKS} className="w-[740px]" />
    </Section>
  )
}

export { GitHubChartShowcase }
