import { toPng } from 'html-to-image'
import { useMutation, useQuery } from 'convex/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { RiftLoading } from '@/components/rift-loading'
import { toastConvexError } from '@/lib/convex-error'
import { ProfileActions } from './_components/profile-actions'
import { ProfileFunStats } from './_components/profile-fun-stats'
import { ProfileHero } from './_components/profile-hero'
import { ProfileStatePanel } from './_components/profile-state-panel'
import { ProfileStatBars } from './_components/profile-stat-bars'
import { GitHubChart } from '@/components/github-chart'

export const Route = createFileRoute('/u/$username')({
  component: ProfilePage,
})

function formatLastScanned({
  timestamp,
}: {
  timestamp: number
}): string {
  const elapsedMs = Date.now() - timestamp

  if (elapsedMs < 60_000) {
    return 'Last scanned. Just now'
  }

  if (elapsedMs < 3_600_000) {
    return `Last scanned. ${Math.floor(elapsedMs / 60_000)}m ago`
  }

  if (elapsedMs < 86_400_000) {
    return `Last scanned. ${Math.floor(elapsedMs / 3_600_000)}h ago`
  }

  return `Last scanned. ${Math.floor(elapsedMs / 86_400_000)}d ago`
}

function formatCompactNumber({
  value,
}: {
  value: number
}): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatMostActiveDay({
  day,
}: {
  day: string
}): string {
  return day.slice(0, 3).toUpperCase()
}

function ProfilePage() {
  const { username } = Route.useParams()
  const navigate = useNavigate({ from: '/u/$username' })
  const profileState = useQuery(api.users.queries.getProfileState, {
    username,
  })
  const requestAnalysis = useMutation(api.users.mutations.requestAnalysis)
  const analysisRequestRef = useRef<string | null>(null)
  const profileCardRef = useRef<HTMLDivElement | null>(null)
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(
    null
  )
  const [isDownloading, setIsDownloading] = useState(false)

  const handleRetry = useCallback(async () => {
    setRequestErrorMessage(null)
    analysisRequestRef.current = null

    try {
      await requestAnalysis({ username })
    } catch (error) {
      console.error('[shipmax]', 'profile_retry_failed', {
        error,
        username,
      })
      setRequestErrorMessage(toastConvexError(error))
    }
  }, [requestAnalysis, username])

  const handleShare = useCallback(() => {
    if (!profileState || profileState.status !== 'ready') {
      return
    }

    const shareUrl = new URL(
      `/u/${profileState.profile.username}`,
      window.location.origin
    ).toString()
    const shareText = `I'm a ${profileState.profile.rank} RANK HUNTER on ShipMax. Score: ${profileState.profile.score}/100.`
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

    window.open(intentUrl, '_blank', 'noopener,noreferrer')
  }, [profileState])

  const handleDownload = useCallback(async () => {
    if (
      !profileState ||
      profileState.status !== 'ready' ||
      !profileCardRef.current
    ) {
      return
    }

    try {
      setIsDownloading(true)

      const dataUrl = await toPng(profileCardRef.current, {
        backgroundColor: '#040710',
        pixelRatio: 2,
      })

      const downloadLink = document.createElement('a')
      downloadLink.download = `${profileState.profile.username}-shipmax.png`
      downloadLink.href = dataUrl
      downloadLink.click()
      toast.success('Hunter card downloaded.')
    } catch {
      toast.error('Download failed. Try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [profileState])

  useEffect(() => {
    if (!profileState || profileState.status !== 'should_analyze') {
      return
    }

    const requestKey = profileState.username.toLowerCase()

    if (analysisRequestRef.current === requestKey) {
      return
    }

    analysisRequestRef.current = requestKey
    setRequestErrorMessage(null)

    void requestAnalysis({ username: profileState.username }).catch(
      (error: unknown) => {
        console.error('[shipmax]', 'profile_request_analysis_failed', {
          error,
          username: profileState.username,
        })
        analysisRequestRef.current = null
        setRequestErrorMessage(toastConvexError(error))
      }
    )
  }, [profileState, requestAnalysis])

  useEffect(() => {
    if (!profileState || profileState.status !== 'error') {
      return
    }

    console.error('[shipmax]', 'profile_state_error', {
      message: profileState.message,
      username: profileState.username,
    })
  }, [profileState])

  useEffect(() => {
    if (!profileState || profileState.status !== 'ready') {
      return
    }

    analysisRequestRef.current = null

    if (
      profileState.profile.username.toLowerCase() === username.toLowerCase() &&
      profileState.profile.username !== username
    ) {
      void navigate({
        to: '/u/$username',
        params: { username: profileState.profile.username },
        replace: true,
      })
    }
  }, [navigate, profileState, username])

  if (!profileState) {
    return <RiftLoading />
  }

  if (
    profileState.status === 'should_analyze' ||
    profileState.status === 'pending'
  ) {
    if (requestErrorMessage && profileState.status === 'should_analyze') {
      return (
        <ProfileStatePanel
          title="RIFT CONNECTION FAILED."
          description={requestErrorMessage}
          username={profileState.username}
          showRetry
          onRetry={handleRetry}
        />
      )
    }

    return <RiftLoading />
  }

  if (profileState.status === 'not_found') {
    return (
      <ProfileStatePanel
        title="HUNTER NOT FOUND IN DATABASE."
        description="We searched GitHub and found no public hunter record for this username."
        username={profileState.username}
      />
    )
  }

  if (profileState.status === 'error') {
    return (
      <ProfileStatePanel
        title="RIFT CONNECTION FAILED."
        description={requestErrorMessage ?? profileState.message}
        username={profileState.username}
        showRetry
        onRetry={handleRetry}
      />
    )
  }

  const { profile } = profileState

  return (
    <div className="bg-bg relative flex min-h-svh flex-col items-center overflow-hidden pb-12 md:pb-6">
      <div className="pointer-events-none absolute inset-4 hidden border border-[#3B82F61F] md:block" />

      <div ref={profileCardRef} className="flex w-full flex-col items-center pb-2">
        <ProfileHero
          avatarUrl={profile.avatarUrl}
          username={profile.username}
          rank={profile.rank}
          rankTitle={profile.rankTitle}
          score={profile.score}
          position={profile.position}
          totalRanked={profile.totalRanked}
          roast={profile.roast}
        />

        <div className="mt-4 w-full md:mt-4 md:w-auto">
          <ProfileStatBars stats={profile.stats} />
        </div>

        <div className="mt-6 hidden md:block">
          <GitHubChart
            weeks={profile.rawData.contributionCalendar}
            className="w-[620px]"
          />
        </div>

        <div className="mt-0 w-full md:mt-4 md:w-auto">
          <ProfileFunStats
            rank={profile.rank}
            streak={profile.rawData.currentStreak}
            bestStreak={profile.rawData.longestStreak}
            mostActiveDay={formatMostActiveDay({
              day: profile.rawData.mostActiveDay,
            })}
            topLanguage={profile.rawData.topLanguage}
            totalStars={formatCompactNumber({
              value: profile.rawData.totalStars,
            })}
          />
        </div>
      </div>

      <ProfileActions
        isDownloading={isDownloading}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      <div className="mt-6 flex items-center gap-3 text-[10px] leading-3 font-medium tracking-[3px] text-[rgba(96,165,250,0.35)] uppercase">
        <div className="bg-blue size-1.5" />
        <span>{formatLastScanned({ timestamp: profile.lastScannedAt })}</span>
      </div>
    </div>
  )
}
