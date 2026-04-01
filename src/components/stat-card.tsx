import { cn } from '@/utils/cn'

type StatCardProps = {
  label: string
  value: string
  unit: string
  valueClassName?: string
  className?: string
}

function StatCard({
  label,
  value,
  unit,
  valueClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'gap-micro flex flex-col items-center border border-[#3B82F61F] bg-[#3B82F608] px-7 py-4',
        className
      )}
    >
      <span className="text-micro font-semibold tracking-[2px] text-[#60A5FA66] uppercase">
        {label}
      </span>
      <span
        className={cn(
          'text-blue-light text-[24px] leading-[30px] font-bold',
          valueClassName
        )}
      >
        {value}
      </span>
      <span className="text-[10px] leading-[12px] text-[#DBEAFE4D]">
        {unit}
      </span>
    </div>
  )
}

export { StatCard, type StatCardProps }
