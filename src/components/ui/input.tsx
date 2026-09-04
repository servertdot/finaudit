import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex min-h-9 w-full min-w-0 rounded-[0.62rem] border border-line bg-paper/72 px-3 py-1.5 text-sm text-ink shadow-xs transition-[border-color,background-color,box-shadow] duration-160 placeholder:text-muted focus:border-accent focus:bg-surface focus:ring-3 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
