import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display text-blue-text text-display tracking-wider">
        SHIPMAX
      </h1>
      <p className="font-body text-text-dim mt-2 text-sm tracking-widest">
        COMING SOON
      </p>
    </div>
  )
}
