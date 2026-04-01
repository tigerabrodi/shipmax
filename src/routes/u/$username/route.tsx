import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/u/$username')({
  component: ProfilePage,
})

function ProfilePage() {
  const { username } = Route.useParams()

  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-body text-text-primary text-heading">{username}</h1>
    </div>
  )
}
