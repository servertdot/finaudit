import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('rounded-[1.35rem] border border-line/78 bg-surface shadow-[var(--surface-shadow)]', className)} {...props} />
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn('flex min-h-[3.65rem] items-center justify-between gap-2 px-[1.15rem] pb-3 pt-[0.9rem]', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-[1.04rem] font-semibold tracking-[-0.018em] text-ink', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 px-4 pb-5 pt-2 sm:px-5 sm:pb-5', className)} {...props} />
}
