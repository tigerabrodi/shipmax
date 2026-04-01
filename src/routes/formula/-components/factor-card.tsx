import { cn } from '@/utils/cn'

type FactorCardProps = {
  title: string
  mobileTitle?: string
  percentage: string
  description: string
  mobileDescription?: string
  scoreRef?: string
  mobileScoreRef?: string
  fullWidth?: boolean
}

function FactorCard({
  title,
  mobileTitle,
  percentage,
  description,
  mobileDescription,
  scoreRef,
  mobileScoreRef,
  fullWidth,
}: FactorCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border border-[#3B82F61F] bg-[#3B82F605] p-4',
        'md:gap-2.5 md:p-6',
        fullWidth ? 'w-full' : 'w-full md:w-[calc(50%-1px)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {mobileTitle ? (
          <>
            <span className="text-[14px] leading-[18px] font-bold text-[#DBEAFE] md:hidden">
              {mobileTitle}
            </span>
            <span className="hidden text-[16px] leading-[20px] font-bold text-[#DBEAFE] md:block">
              {title}
            </span>
          </>
        ) : (
          <span className="text-[14px] leading-[18px] font-bold text-[#DBEAFE] md:text-[16px] md:leading-[20px]">
            {title}
          </span>
        )}
        <span className="text-[13px] leading-[16px] font-bold text-[#60A5FA] md:text-[14px] md:leading-[18px]">
          {percentage}
        </span>
      </div>

      {/* Description */}
      {mobileDescription ? (
        <>
          <p className="text-[11px] leading-[150%] text-[#DBEAFE66] md:hidden">
            {mobileDescription}
          </p>
          <p className="hidden text-[12px] leading-[160%] text-[#DBEAFE66] md:block">
            {description}
          </p>
        </>
      ) : (
        <p className="text-[11px] leading-[150%] text-[#DBEAFE66] md:text-[12px] md:leading-[160%]">
          {description}
        </p>
      )}

      {/* Divider — desktop only, only when desktop score ref exists */}
      {scoreRef && (
        <div className="hidden h-px w-full bg-[#3B82F614] md:block" />
      )}

      {/* Desktop score reference */}
      {scoreRef && (
        <p className="hidden text-[11px] leading-[14px] font-medium text-[#60A5FA59] md:block">
          {scoreRef}
        </p>
      )}

      {/* Mobile score reference */}
      {mobileScoreRef && (
        <p className="text-[10px] leading-[12px] text-[#60A5FA59] md:hidden">
          {mobileScoreRef}
        </p>
      )}
    </div>
  )
}

export { FactorCard, type FactorCardProps }
