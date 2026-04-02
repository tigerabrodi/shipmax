import { Link } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { XIcon } from '@/components/icons/x-icon'

type ProfileActionsProps = {
  isDownloading: boolean
  onDownload: () => void
  onShare: () => void
}

function ProfileActions({
  isDownloading,
  onDownload,
  onShare,
}: ProfileActionsProps) {
  return (
    <div className="flex w-full flex-col items-center px-5 pt-6 md:px-0 md:pt-7">
      {/* Share buttons — stacked on mobile, side by side on desktop */}
      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:gap-3">
        <Button
          variant="secondary"
          icon={<XIcon />}
          className="w-full md:w-auto"
          onClick={onShare}
        >
          SHARE ON X
        </Button>
        <Button
          variant="ghost"
          className="w-full md:w-auto"
          disabled={isDownloading}
          onClick={onDownload}
        >
          {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD IMAGE'}
        </Button>
      </div>

      {/* Analyze another link */}
      <Link
        to="/"
        className="mt-4 text-[12px] leading-4 font-medium text-[rgba(96,165,250,0.35)] transition-colors hover:text-[rgba(96,165,250,0.55)]"
      >
        Analyze another hunter →
      </Link>
    </div>
  )
}

export { ProfileActions }
export type { ProfileActionsProps }
