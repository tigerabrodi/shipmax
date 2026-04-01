import { type ReactNode } from 'react'
import { type HTMLMotionProps, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import './button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: ButtonVariant
  icon?: ReactNode
}

const sizeByVariant: Record<ButtonVariant, string> = {
  primary:
    'py-3 px-8 text-[13px] tracking-[2px] leading-4 md:py-4 md:px-11 md:text-[14px] md:tracking-[3px] md:leading-[18px] font-bold',
  secondary:
    'py-3 px-6 gap-1.5 text-[12px] tracking-[1.5px] leading-4 md:py-3.5 md:px-8 md:text-[13px] md:tracking-[2px] font-semibold',
  ghost:
    'py-3 px-6 text-[12px] tracking-[1.5px] leading-4 md:py-3.5 md:px-8 md:text-[13px] md:tracking-[2px] font-semibold',
}

const glowByVariant: Record<ButtonVariant, { hover: string; tap: string }> = {
  primary: {
    hover: '0 0 28px rgba(59,130,246,0.3)',
    tap: '0 0 12px rgba(59,130,246,0.2)',
  },
  secondary: {
    hover: '0 0 20px rgba(59,130,246,0.2)',
    tap: '0 0 8px rgba(59,130,246,0.15)',
  },
  ghost: {
    hover: '0 0 14px rgba(59,130,246,0.12)',
    tap: '0 0 6px rgba(59,130,246,0.1)',
  },
}

function Button({
  variant = 'primary',
  icon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const glow = glowByVariant[variant]

  return (
    <motion.button
      whileHover={
        !disabled
          ? {
              boxShadow: glow.hover,
              transition: { duration: 0.1, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={
        !disabled
          ? {
              boxShadow: glow.tap,
              transition: { duration: 0.08 },
            }
          : undefined
      }
      className={cn(
        'inline-flex cursor-pointer items-center justify-center border uppercase transition-[background-image,border-color,color] duration-150',
        sizeByVariant[variant],
        `btn-${variant}`,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children as React.ReactNode}
    </motion.button>
  )
}

export { Button, type ButtonVariant, type ButtonProps }
