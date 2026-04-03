'use node'

import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { type Infer, v } from 'convex/values'
import pRetry from 'p-retry'
import satori from 'satori'
import { internalAction } from '../_generated/server'
import { PROFILE_SHARE_STATE_VALIDATOR } from './shared'

const BODY_FONT_FAMILY = 'Chakra Petch'
const DISPLAY_FONT_FAMILY = 'Cinzel Decorative'
const IMAGE_HEIGHT = 630
const IMAGE_WIDTH = 1200
const BODY_FONT_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/ChakraPetch-Bold.ttf'
const DISPLAY_FONT_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf'
const RESVG_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.4.0/index_bg.wasm'

type ShareState = Infer<typeof PROFILE_SHARE_STATE_VALIDATOR>
type ReadyShareState = Extract<ShareState, { status: 'ready' }>

let bodyFontPromise: Promise<ArrayBuffer> | null = null
let displayFontPromise: Promise<ArrayBuffer> | null = null
let resvgReadyPromise: Promise<void> | null = null

function getRankColor({
  rank,
}: {
  rank: ReadyShareState['profile']['rank']
}): string {
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

function truncateText({
  value,
  maxLength,
}: {
  value: string
  maxLength: number
}): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function formatLastScanned({ timestamp }: { timestamp: number }): string {
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

function getFallbackCopy({
  shareState,
  username,
}: {
  shareState: ShareState
  username: string
}) {
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

async function loadGoogleFont({
  family,
  url,
}: {
  family: string
  url: string
}): Promise<ArrayBuffer> {
  return pRetry(
    async () => {
      const fontResponse = await fetch(url)

      if (!fontResponse.ok) {
        throw new Error(`Failed to download font file for ${family}.`)
      }

      return fontResponse.arrayBuffer()
    },
    {
      retries: 3,
    }
  )
}

function getDisplayFontPromise(): Promise<ArrayBuffer> {
  if (!displayFontPromise) {
    displayFontPromise = loadGoogleFont({
      family: DISPLAY_FONT_FAMILY,
      url: DISPLAY_FONT_URL,
    }).catch((error: unknown) => {
      displayFontPromise = null
      throw error
    })
  }

  return displayFontPromise
}

function getBodyFontPromise(): Promise<ArrayBuffer> {
  if (!bodyFontPromise) {
    bodyFontPromise = loadGoogleFont({
      family: BODY_FONT_FAMILY,
      url: BODY_FONT_URL,
    }).catch((error: unknown) => {
      bodyFontPromise = null
      throw error
    })
  }

  return bodyFontPromise
}

function getResvgReadyPromise(): Promise<void> {
  if (!resvgReadyPromise) {
    resvgReadyPromise = pRetry(
      async () => {
        const response = await fetch(RESVG_WASM_URL)

        if (!response.ok) {
          throw new Error('Failed to download the Resvg WASM binary.')
        }

        await initWasm(response)
      },
      {
        retries: 3,
      }
    ).catch((error: unknown) => {
      resvgReadyPromise = null
      throw error
    })
  }

  return resvgReadyPromise
}

async function getFonts() {
  const [displayFontResult, bodyFontResult] = await Promise.allSettled([
    getDisplayFontPromise(),
    getBodyFontPromise(),
  ])

  return [
    displayFontResult.status === 'fulfilled'
      ? {
          data: displayFontResult.value,
          name: DISPLAY_FONT_FAMILY,
          weight: 700 as const,
        }
      : null,
    bodyFontResult.status === 'fulfilled'
      ? {
          data: bodyFontResult.value,
          name: BODY_FONT_FAMILY,
          weight: 700 as const,
        }
      : null,
  ].filter((font) => font !== null)
}

function renderFallbackCard({
  shareState,
  username,
}: {
  shareState: ShareState
  username: string
}) {
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
        fontFamily: `"${BODY_FONT_FAMILY}"`,
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
            fontFamily: `"${DISPLAY_FONT_FAMILY}"`,
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

function renderReadyCard({ profile }: { profile: ReadyShareState['profile'] }) {
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
        fontFamily: `"${BODY_FONT_FAMILY}"`,
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
                  fontFamily: `"${DISPLAY_FONT_FAMILY}"`,
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
              fontFamily: `"${DISPLAY_FONT_FAMILY}"`,
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

async function renderImageBuffer({
  shareState,
  username,
}: {
  shareState: ShareState
  username: string
}): Promise<ArrayBuffer> {
  const [fonts] = await Promise.all([getFonts(), getResvgReadyPromise()])
  const svg = await satori(
    shareState.status === 'ready'
      ? renderReadyCard({ profile: shareState.profile })
      : renderFallbackCard({ shareState, username }),
    {
      fonts,
      height: IMAGE_HEIGHT,
      width: IMAGE_WIDTH,
    }
  )
  const pngBytes = new Resvg(svg).render().asPng()
  const imageBuffer = new ArrayBuffer(pngBytes.byteLength)

  new Uint8Array(imageBuffer).set(pngBytes)

  return imageBuffer
}

export const renderProfileOgImage = internalAction({
  args: {
    shareState: PROFILE_SHARE_STATE_VALIDATOR,
    username: v.string(),
  },
  returns: v.bytes(),
  handler: async (_ctx, args) => {
    try {
      return await renderImageBuffer({
        shareState: args.shareState,
        username: args.username,
      })
    } catch {
      return renderImageBuffer({
        shareState: {
          status: 'error',
          message: 'Dynamic preview is temporarily unavailable.',
          username: args.username,
        },
        username: args.username,
      })
    }
  },
})
