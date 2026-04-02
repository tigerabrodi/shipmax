import { createFileRoute } from '@tanstack/react-router'
import { FeaturedHunters } from './-components/featured-hunters'
import { FrameDecoration } from './-components/frame-decoration'
import { HeroHeader } from './-components/hero-header'
import { SearchSection } from './-components/search-section'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="bg-bg relative flex min-h-svh flex-col items-center overflow-hidden">
      <FrameDecoration />
      <HeroHeader />
      <FeaturedHunters />
      <SearchSection />
    </div>
  )
}
