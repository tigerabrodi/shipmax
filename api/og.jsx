import { ImageResponse } from '@vercel/og'

const CACHE_CONTROL_HEADER =
  'public, s-maxage=86400, stale-while-revalidate=43200'

const DEFAULT_SITE_ORIGIN = 'https://shipmax.dev'

let displayFontPromise = null
let bodyFontPromise = null

function getConvexSiteUrl() {
  return process.env.CONVEX_SITE_URL ?? process.env.VITE_CONVEX_SITE_URL ?? null
}

function getSiteOrigin({ request }) {
  return request.headers.get('x-forwarded-proto') &&
    request.headers.get('x-forwarded-host')
    ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
    : new URL(request.url).origin || DEFAULT_SITE_ORIGIN
}

function getRankColor({ rank }) {
  switch (rank) {
    case 'S':
      return '#FBBF24'
    case 'A':
      return '#A78BFA'
    case 'B':
      return '#3B82F6'
    case 'C':
      return '#22C55E'
    case 'D':
      return '#6B7280'
    case 'E':
      return '#EF4444'
    default:
      return '#3B82F6'
  }
}

function truncateText({ value, maxLength }) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function formatLastScanned({ timestamp }) {
  const elapsedMs = Date.now() - timestamp

  if (elapsedMs < 60_000) {
    return 'Last scanned just now'
  }

  if (elapsedMs < 3_600_000) {
    return `Last scanned ${Math.floor(elapsedMs / 60_000)}m ago`
  }

  if (elapsedMs < 86_400_000) {
    return `Last scanned ${Math.floor(elapsedMs / 3_600_000)}h ago`
  }

  return `Last scanned ${Math.floor(elapsedMs / 86_400_000)}d ago`
}

function getFallbackCopy({ shareState, username }) {
  if (!shareState) {
    return {
      eyebrow: 'SHIPMAX',
      subtitle: 'Dynamic OG preview is waiting on Convex.',
      title: 'How Hard Do You Ship.',
    }
  }

  if (shareState.status === 'ready') {
    return {
      eyebrow: 'RANKED HUNTER',
      subtitle: `Open @${shareState.profile.username} on ShipMax.`,
      title: 'How Hard Do You Ship.',
    }
  }

  if (
    shareState.status === 'pending' ||
    shareState.status === 'should_analyze'
  ) {
    return {
      eyebrow: 'SCAN IN PROGRESS',
      subtitle: `ShipMax is scanning @${shareState.username}.`,
      title: 'The Rift is collecting data.',
    }
  }

  if (shareState.status === 'error') {
    return {
      eyebrow: 'SCAN FAILED',
      subtitle: shareState.message,
      title: `ShipMax could not scan @${shareState.username}.`,
    }
  }

  return {
    eyebrow: 'HUNTER NOT FOUND',
    subtitle: `Check whether @${shareState.username || username} has what it takes to rank on ShipMax.`,
    title: 'How Hard Do You Ship.',
  }
}

function buildOgDataUrl({ convexSiteUrl, username }) {
  const ogDataUrl = new URL('/og-data', convexSiteUrl)
  ogDataUrl.searchParams.set('username', username)
  return ogDataUrl.toString()
}

async function loadGoogleFont({ family, weight }) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}` +
    `:wght@${weight}`
  const cssResponse = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  })

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch font CSS for ${family}.`)
  }

  const css = await cssResponse.text()
  const fontUrlMatch = css.match(/url\((https:[^)]+)\)/)

  if (!fontUrlMatch) {
    throw new Error(`Font URL missing for ${family}.`)
  }

  const fontResponse = await fetch(fontUrlMatch[1])

  if (!fontResponse.ok) {
    throw new Error(`Failed to download font file for ${family}.`)
  }

  return fontResponse.arrayBuffer()
}

function getDisplayFontPromise() {
  if (!displayFontPromise) {
    displayFontPromise = loadGoogleFont({
      family: 'Cinzel Decorative',
      weight: 700,
    })
  }

  return displayFontPromise
}

function getBodyFontPromise() {
  if (!bodyFontPromise) {
    bodyFontPromise = loadGoogleFont({
      family: 'Chakra Petch',
      weight: 700,
    })
  }

  return bodyFontPromise
}

async function fetchShareState({ request, username }) {
  const convexSiteUrl = getConvexSiteUrl()

  if (!convexSiteUrl) {
    return null
  }

  try {
    const response = await fetch(buildOgDataUrl({ convexSiteUrl, username }), {
      headers: new Headers({
        'x-og-origin': getSiteOrigin({ request }),
      }),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

function renderFallbackCard({ shareState, username }) {
  const copy = getFallbackCopy({ shareState, username })

  return (
    <div
      style={{
        alignItems: 'stretch',
        background:
          'radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent 35%), linear-gradient(180deg, #091120 0%, #040710 100%)',
        color: '#E2E8F0',
        display: 'flex',
        flex: 1,
        fontFamily: '"Chakra Petch"',
        height: '100%',
        padding: '44px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(59,130,246,0.18)',
          bottom: '18px',
          display: 'flex',
          left: '18px',
          position: 'absolute',
          right: '18px',
          top: '18px',
        }}
      />
      <div
        style={{
          color: 'rgba(147,197,253,0.82)',
          display: 'flex',
          fontSize: 22,
          letterSpacing: 8,
          position: 'absolute',
          right: 44,
          textTransform: 'uppercase',
          top: 38,
        }}
      >
        shipmax.dev
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          marginTop: 92,
          maxWidth: 880,
        }}
      >
        <div
          style={{
            color: '#60A5FA',
            display: 'flex',
            fontSize: 18,
            letterSpacing: 6,
          }}
        >
          {copy.eyebrow}
        </div>
        <div
          style={{
            color: '#F8FAFC',
            display: 'flex',
            fontFamily: '"Cinzel Decorative"',
            fontSize: 72,
            lineHeight: 1.05,
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            color: '#CBD5E1',
            display: 'flex',
            fontSize: 30,
            lineHeight: 1.4,
            maxWidth: 760,
          }}
        >
          {copy.subtitle}
        </div>
        <div
          style={{
            border: '1px solid rgba(59,130,246,0.18)',
            color: '#93C5FD',
            display: 'flex',
            fontSize: 24,
            marginTop: 24,
            padding: '18px 24px',
          }}
        >
          Paste a GitHub username. Get a hunter rank. Share your score.
        </div>
      </div>
    </div>
  )
}

function renderReadyCard({ profile }) {
  const rankColor = getRankColor({ rank: profile.rank })
  const statItems = [
    { label: 'CONSISTENCY', value: profile.stats.consistency },
    { label: 'ACTIVITY', value: profile.stats.recentActivity },
    { label: 'VOLUME', value: profile.stats.volume },
    { label: 'STARS', value: profile.stats.stars },
    { label: 'COMMUNITY', value: profile.stats.community },
  ]

  return (
    <div
      style={{
        alignItems: 'stretch',
        background:
          'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 32%), linear-gradient(180deg, #091120 0%, #040710 100%)',
        color: '#E2E8F0',
        display: 'flex',
        flex: 1,
        fontFamily: '"Chakra Petch"',
        height: '100%',
        padding: '40px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(59,130,246,0.18)',
          bottom: '18px',
          display: 'flex',
          left: '18px',
          position: 'absolute',
          right: '18px',
          top: '18px',
        }}
      />
      <div
        style={{
          color: 'rgba(147,197,253,0.82)',
          display: 'flex',
          fontSize: 20,
          letterSpacing: 6,
          position: 'absolute',
          right: 44,
          textTransform: 'uppercase',
          top: 34,
        }}
      >
        shipmax.dev
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 20,
          }}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 26,
            }}
          >
            <img
              alt={profile.username}
              height="120"
              src={profile.avatarUrl}
              style={{
                border: '3px solid rgba(96,165,250,0.4)',
                borderRadius: '9999px',
              }}
              width="120"
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxWidth: 560,
              }}
            >
              <div
                style={{
                  color: '#F8FAFC',
                  display: 'flex',
                  fontFamily: '"Cinzel Decorative"',
                  fontSize: 46,
                  lineHeight: 1,
                  maxWidth: 560,
                }}
              >
                @{profile.username}
              </div>
              <div
                style={{
                  color: '#60A5FA',
                  display: 'flex',
                  fontSize: 22,
                  letterSpacing: 4,
                }}
              >
                {profile.rankTitle}
              </div>
              <div
                style={{
                  color: '#CBD5E1',
                  display: 'flex',
                  fontSize: 28,
                }}
              >
                Score {profile.score}/100
              </div>
            </div>
          </div>
          <div
            style={{
              color: rankColor,
              display: 'flex',
              fontFamily: '"Cinzel Decorative"',
              fontSize: 190,
              lineHeight: 0.9,
              textShadow: `0 0 32px ${rankColor}55`,
            }}
          >
            {profile.rank}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 30,
            width: '100%',
          }}
        >
          <div
            style={{
              border: '1px solid rgba(59,130,246,0.16)',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              gap: 14,
              minWidth: 0,
              padding: '22px 24px',
            }}
          >
            {statItems.map((item) => (
              <div
                key={item.label}
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    color: '#93C5FD',
                    display: 'flex',
                    fontSize: 16,
                    letterSpacing: 2,
                    minWidth: 140,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    background: '#0F172A',
                    display: 'flex',
                    flex: 1,
                    height: 14,
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background:
                        'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',
                      display: 'flex',
                      height: '100%',
                      width: `${Math.max(4, Math.round(item.value))}%`,
                    }}
                  />
                </div>
                <div
                  style={{
                    color: '#F8FAFC',
                    display: 'flex',
                    fontSize: 20,
                    justifyContent: 'flex-end',
                    minWidth: 42,
                  }}
                >
                  {Math.round(item.value)}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              alignSelf: 'stretch',
              border: '1px solid rgba(59,130,246,0.16)',
              color: '#CBD5E1',
              display: 'flex',
              flexBasis: 360,
              flexDirection: 'column',
              fontSize: 24,
              justifyContent: 'space-between',
              lineHeight: 1.4,
              padding: '22px 24px',
            }}
          >
            <div
              style={{
                color: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  color: '#60A5FA',
                  display: 'flex',
                  fontSize: 16,
                  letterSpacing: 3,
                }}
              >
                SYSTEM ROAST
              </div>
              <div style={{ display: 'flex' }}>
                {truncateText({
                  value: profile.roast,
                  maxLength: 180,
                })}
              </div>
            </div>
            <div
              style={{
                color: '#93C5FD',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 18,
                gap: 8,
                letterSpacing: 1,
              }}
            >
              <div style={{ display: 'flex' }}>
                Ranked #{profile.position} of {profile.totalRanked}
              </div>
              <div style={{ display: 'flex' }}>
                {formatLastScanned({ timestamp: profile.lastScannedAt })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function handler(request) {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')?.trim() ?? ''
  const shareState = username
    ? await fetchShareState({ request, username })
    : null
  const [displayFont, bodyFont] = await Promise.all([
    getDisplayFontPromise(),
    getBodyFontPromise(),
  ])

  return new ImageResponse(
    shareState?.status === 'ready'
      ? renderReadyCard({ profile: shareState.profile })
      : renderFallbackCard({ shareState, username }),
    {
      fonts: [
        {
          data: displayFont,
          name: 'Cinzel Decorative',
          weight: 700,
        },
        {
          data: bodyFont,
          name: 'Chakra Petch',
          weight: 700,
        },
      ],
      headers: {
        'Cache-Control': CACHE_CONTROL_HEADER,
      },
      height: 630,
      width: 1200,
    }
  )
}
