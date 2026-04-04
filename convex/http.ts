import { api, internal } from './_generated/api'
import { httpAction } from './_generated/server'
import { httpRouter } from 'convex/server'

declare const process: {
  env: Record<string, string | undefined>
}

const DEFAULT_SITE_ORIGIN = 'https://shipmax.dev'
const IMAGE_CACHE_CONTROL_READY =
  'public, max-age=86400, stale-while-revalidate=43200'
const IMAGE_CACHE_CONTROL_STALE =
  'public, max-age=300, stale-while-revalidate=300'

const http = httpRouter()

type ShareStats = {
  consistency: number
  recentActivity: number
  volume: number
  stars: number
  community: number
}

type ShareState =
  | {
      status: 'ready'
      profile: {
        username: string
        avatarUrl: string
        rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
        rankTitle: string
        score: number
        roast: string
        stats: ShareStats
        position: number
        totalRanked: number
        lastScannedAt: number
      }
    }
  | {
      status: 'pending' | 'should_analyze'
      username: string
    }
  | {
      status: 'not_found' | 'error'
      username: string
      message: string
    }

function escapeHtml({
  value,
}: {
  value: string
}): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
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

function getSiteOrigin({
  request,
}: {
  request: Request
}): string {
  return (
    request.headers.get('x-og-origin') ??
    process.env.SITE_URL ??
    DEFAULT_SITE_ORIGIN
  )
}

function getRequestOrigin({
  request,
}: {
  request: Request
}): string {
  return new URL(request.url).origin
}

function getImageCacheControl({
  shareState,
}: {
  shareState: ShareState
}): string {
  return shareState.status === 'ready'
    ? IMAGE_CACHE_CONTROL_READY
    : IMAGE_CACHE_CONTROL_STALE
}

function buildMetaPayload({
  shareState,
  fallbackUsername,
  imageOrigin,
  siteOrigin,
}: {
  shareState: ShareState
  fallbackUsername: string
  imageOrigin: string
  siteOrigin: string
}) {
  if (shareState.status === 'ready') {
    const username = shareState.profile.username

    return {
      cacheControl: 'public, max-age=3600',
      description: truncateText({
        value: shareState.profile.roast,
        maxLength: 200,
      }),
      imageUrl: `${imageOrigin}/og-image?username=${encodeURIComponent(username)}`,
      title: `${username} is ${shareState.profile.rank} RANK on ShipMax`,
      url: `${siteOrigin}/u/${encodeURIComponent(username)}`,
    }
  }

  if (shareState.status === 'pending' || shareState.status === 'should_analyze') {
    const username = shareState.username

    return {
      cacheControl: 'public, max-age=300',
      description: `ShipMax is scanning @${username}. Check back soon for the final rank.`,
      imageUrl: `${imageOrigin}/og-image?username=${encodeURIComponent(username)}`,
      title: `Scanning @${username} on ShipMax`,
      url: `${siteOrigin}/u/${encodeURIComponent(username)}`,
    }
  }

  if (shareState.status === 'error') {
    return {
      cacheControl: 'public, max-age=300',
      description: shareState.message,
      imageUrl: `${imageOrigin}/og-image?username=${encodeURIComponent(shareState.username)}`,
      title: `ShipMax could not scan @${shareState.username}`,
      url: `${siteOrigin}/u/${encodeURIComponent(shareState.username)}`,
    }
  }

  return {
    cacheControl: 'public, max-age=300',
    description: `Check whether @${shareState.username ?? fallbackUsername} has what it takes to rank on ShipMax.`,
    imageUrl: `${imageOrigin}/og-image?username=${encodeURIComponent(shareState.username ?? fallbackUsername)}`,
    title: `Check @${shareState.username ?? fallbackUsername} on ShipMax`,
    url: `${siteOrigin}/u/${encodeURIComponent(shareState.username ?? fallbackUsername)}`,
  }
}

function buildMetaHtml({
  description,
  imageUrl,
  title,
  url,
}: {
  description: string
  imageUrl: string
  title: string
  url: string
}): string {
  const escapedDescription = escapeHtml({ value: description })
  const escapedImageUrl = escapeHtml({ value: imageUrl })
  const escapedTitle = escapeHtml({ value: title })
  const escapedUrl = escapeHtml({ value: url })

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImageUrl}" />
  </head>
  <body>
    ShipMax OG metadata endpoint.
  </body>
</html>`
}

http.route({
  path: '/og-meta',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username')?.trim() ?? ''

    if (!username) {
      return new Response('Missing username.', {
        status: 400,
      })
    }

    const shareState = await ctx.runQuery(api.users.queries.getProfileShareState, {
      username,
    })
    const metaPayload = buildMetaPayload({
      shareState,
      fallbackUsername: username,
      imageOrigin: getRequestOrigin({ request }),
      siteOrigin: getSiteOrigin({ request }),
    })

    return new Response(buildMetaHtml(metaPayload), {
      status: 200,
      headers: new Headers({
        'Cache-Control': metaPayload.cacheControl,
        'Content-Type': 'text/html; charset=utf-8',
      }),
    })
  }),
})

http.route({
  path: '/og-image',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username')?.trim() ?? ''

    if (!username) {
      return new Response('Missing username.', {
        status: 400,
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
        }),
      })
    }

    const shareState = await ctx.runQuery(api.users.queries.getProfileShareState, {
      username,
    })
    const imageBytes = await ctx.runAction(
      internal.users.og_actions.renderProfileOgImage,
      {
        shareState,
        username,
      }
    )

    return new Response(imageBytes, {
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': getImageCacheControl({ shareState }),
        'Content-Type': 'image/png',
      }),
    })
  }),
})

http.route({
  path: '/og-data',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username')?.trim() ?? ''

    if (!username) {
      return Response.json(
        { message: 'Missing username.' },
        {
          status: 400,
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
          }),
        }
      )
    }

    const shareState = await ctx.runQuery(api.users.queries.getProfileShareState, {
      username,
    })

    return Response.json(shareState, {
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      }),
    })
  }),
})

export default http
