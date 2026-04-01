import { createFileRoute } from '@tanstack/react-router'
import { ButtonsShowcase } from './_showcases/buttons'
import { GitHubChartShowcase } from './_showcases/github-chart'
import { LeaderboardCardShowcase } from './_showcases/leaderboard-card'
import { LeaderboardTableShowcase } from './_showcases/leaderboard-table'
import { InputShowcase } from './_showcases/input'
import { RiftLoadingShowcase } from './_showcases/rift-loading'
import { StatBarsShowcase } from './_showcases/stat-bars'
import { StatCardsShowcase } from './_showcases/stat-cards'

export const Route = createFileRoute('/admin/components')({
  component: ComponentsPage,
})

function ComponentsPage() {
  return (
    <div className="bg-bg gap-section p-section flex min-h-screen flex-col">
      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold tracking-[2px] text-[#93C5FD99] uppercase">
          Component Library
        </p>
        <h1 className="font-display text-heading text-blue-text tracking-wider">
          Components
        </h1>
      </div>

      <div className="bg-border-dim h-px" />

      <ButtonsShowcase />

      <div className="bg-border-dim h-px" />

      <InputShowcase />

      <div className="bg-border-dim h-px" />

      <GitHubChartShowcase />

      <div className="bg-border-dim h-px" />

      <LeaderboardCardShowcase />

      <div className="bg-border-dim h-px" />

      <LeaderboardTableShowcase />

      <div className="bg-border-dim h-px" />

      <StatBarsShowcase />

      <div className="bg-border-dim h-px" />

      <StatCardsShowcase />

      <div className="bg-border-dim h-px" />

      <RiftLoadingShowcase />
    </div>
  )
}
