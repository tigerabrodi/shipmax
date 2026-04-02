import { ConvexError } from 'convex/values'

type AppErrorCode =
  | 'INVALID_GITHUB_USERNAME'
  | 'GITHUB_ANALYSIS_FAILED'
  | 'GITHUB_TOKEN_MISSING'

function appError({
  code,
  message,
}: {
  code: AppErrorCode
  message: string
}): never {
  throw new ConvexError({ code, message })
}

export { appError }
export type { AppErrorCode }
