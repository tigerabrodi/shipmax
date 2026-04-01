import { type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: boolean
}

function Input({ error, value, className, ...props }: InputProps) {
  const hasValue = value !== undefined && value !== ''

  return (
    <input
      type="text"
      value={value}
      className={cn(
        'md:text-body h-[52px] w-full border px-4 text-[14px] leading-[18px] font-medium transition-all duration-150 outline-none md:h-14 md:px-5',
        'text-blue-text caret-blue-light placeholder:text-text-ghost placeholder:font-normal',
        'border-border',
        'focus:border-[rgba(59,130,246,0.45)] focus:bg-[rgba(59,130,246,0.03)] focus:shadow-[0_0_16px_rgba(59,130,246,0.1)]',
        hasValue &&
          !error &&
          'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.02)]',
        error &&
          'border-error-border bg-error-bg text-error caret-error focus:border-error-border focus:bg-error-bg focus:shadow-[0_0_16px_rgba(239,68,68,0.1)]',
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
