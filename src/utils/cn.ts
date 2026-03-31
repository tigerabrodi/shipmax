import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export { cn }
