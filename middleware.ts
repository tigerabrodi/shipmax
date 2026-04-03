declare const process: {
  env: Record<string, string | undefined>
}

const PROFILE_PATH_PATTERN = /^\/u\/([^/]+)\/?$/
const OG_BOT_PATTERN =
  /Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Googlebot|bingbot/i

function getConvexSiteUrl(): string | null {
  return process.env.CONVEX_SITE_URL ?? process.env.VITE_CONVEX_SITE_URL ?? null
}

function isOgBot({ userAgent }: { userAgent: string | null }): boolean {
  if (!userAgent) {
    return false
  }

  return OG_BOT_PATTERN.test(userAgent)
}

export const config = {
  matcher: '/u/:path*',
}

export default async function middleware(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return undefined
  }

  const url = new URL(request.url)
  const match = PROFILE_PATH_PATTERN.exec(url.pathname)

  if (!match || !isOgBot({ userAgent: request.headers.get('user-agent') })) {
    return undefined
  }

  const convexSiteUrl = getConvexSiteUrl()

  if (!convexSiteUrl) {
    return undefined
  }

  const username = match[1]
  const ogMetaUrl = new URL('/og-meta', convexSiteUrl)
  ogMetaUrl.searchParams.set('username', username)

  try {
    const response = await fetch(ogMetaUrl, {
      headers: new Headers({
        'x-og-origin': url.origin,
      }),
      method: request.method,
    })

    return response
  } catch {
    return undefined
  }
}
