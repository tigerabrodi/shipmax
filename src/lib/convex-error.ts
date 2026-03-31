import { ConvexError } from 'convex/values'
import { toast } from 'sonner'

const FALLBACK_MESSAGE = 'Something went wrong — please try again'

export function getConvexErrorMessage(error: unknown): string {
  if (
    error instanceof ConvexError &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data
  ) {
    return (error.data as { message: string }).message
  }
  return FALLBACK_MESSAGE
}

export function toastConvexError(error: unknown): string {
  const message = getConvexErrorMessage(error)
  toast.error(message)
  return message
}
