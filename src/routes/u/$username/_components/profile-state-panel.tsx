import { Link } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { cn } from '@/utils/cn'

type ProfileStatePanelProps = {
  description: string
  showRetry?: boolean
  title: string
  username: string
  onRetry?: () => void
}

function ProfileStatePanel({
  description,
  showRetry = false,
  title,
  username,
  onRetry,
}: ProfileStatePanelProps) {
  return (
    <div className="bg-bg relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-4 hidden border border-[#3B82F61F] md:block" />
      <div className="border-error-border bg-error-bg flex w-full max-w-[560px] flex-col items-center gap-4 border px-6 py-8 text-center md:px-10 md:py-10">
        <p className="text-[10px] leading-3 font-semibold tracking-[4px] text-[rgba(96,165,250,0.45)] uppercase">
          {username}
        </p>
        <h1 className="text-[24px] leading-8 font-bold tracking-[3px] text-error uppercase md:text-[30px] md:leading-9">
          {title}
        </h1>
        <p className="max-w-[420px] text-[13px] leading-5 text-[rgba(219,234,254,0.55)] md:text-[14px] md:leading-6">
          {description}
        </p>

        <div
          className={cn('flex w-full flex-col gap-2 pt-2 md:w-auto md:flex-row', {
            'md:justify-center': showRetry,
          })}
        >
          {showRetry && onRetry ? (
            <Button className="w-full md:w-auto" onClick={onRetry}>
              RETRY ANALYSIS
            </Button>
          ) : null}
          <Link to="/" className="w-full md:w-auto">
            <Button variant="ghost" className="w-full md:w-auto">
              BACK HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export { ProfileStatePanel }
export type { ProfileStatePanelProps }
