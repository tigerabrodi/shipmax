import { StatBar } from '@/components/stat-bar'
import { Section } from './section'

function StatBarsShowcase() {
  return (
    <Section title="Stat Bars">
      <div className="flex w-[500px] flex-col gap-2.5">
        <StatBar label="Consistency" value={95} />
        <StatBar label="Activity" value={98} />
        <StatBar label="Volume" value={100} />
        <StatBar label="Stars" value={100} />
        <StatBar label="Community" value={88} />
      </div>
    </Section>
  )
}

export { StatBarsShowcase }
