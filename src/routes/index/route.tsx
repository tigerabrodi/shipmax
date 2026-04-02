import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { FeaturedHunters } from './-components/featured-hunters'
import { FrameDecoration } from './-components/frame-decoration'
import { HeroHeader } from './-components/hero-header'
import { SearchSection } from './-components/search-section'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const homeSummary = useQuery(api.users.queries.getHomeSummary, {
    limit: 3,
  })

  return (
    <div className="bg-bg relative flex min-h-svh flex-col items-center overflow-hidden">
      <FrameDecoration totalRanked={homeSummary?.totalRanked ?? 0} />
      <HeroHeader />
      <FeaturedHunters hunters={homeSummary?.featuredHunters ?? []} />
      <SearchSection />
    </div>
  )
}
