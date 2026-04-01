import { StatCard } from '@/components/stat-card'
import { Section } from './section'

function StatCardsShowcase() {
  return (
    <Section title="Stat Cards">
      <div className="flex gap-0.5">
        <StatCard
          label="STREAK"
          value="247"
          unit="days"
          valueClassName="text-rank-s"
        />
        <StatCard label="BEST STREAK" value="365" unit="days" />
        <StatCard label="MOST ACTIVE" value="Mon" unit="day of week" />
        <StatCard label="TOP LANG" value="C" unit="language" />
        <StatCard label="TOTAL STARS" value="178k" unit="across repos" />
      </div>
    </Section>
  )
}

export { StatCardsShowcase }
