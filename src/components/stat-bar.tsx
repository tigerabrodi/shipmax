import { cn } from '@/utils/cn'

type StatBarProps = {
  label: string
  value: number
  className?: string
}

const FILL_GRADIENT =
  'linear-gradient(in oklab 90deg, oklab(54.6% -0.027 -0.214) 0%, oklab(71.4% -0.038 -0.138) 100%)'

function StatBar({ label, value, className }: StatBarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-label w-20 shrink-0 leading-[14px] font-semibold text-[#60A5FA80]">
        {label}
      </span>
      <div className="h-1.5 flex-1 bg-[#3B82F61A]">
        <div
          className="h-full"
          style={{
            width: `${value}%`,
            backgroundImage: FILL_GRADIENT,
          }}
        />
      </div>
      <span className="text-caption text-blue-light w-7 shrink-0 text-right leading-4 font-semibold">
        {value}
      </span>
    </div>
  )
}

export { StatBar, type StatBarProps }
