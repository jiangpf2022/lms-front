'use client'

import { cn } from '@/lib/utils'
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconBulb,
  IconCircleCheck,
  IconAlertCircle,
} from '@tabler/icons-react'

type CalloutType = 'info' | 'warning' | 'tip' | 'success' | 'danger'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
  className?: string
}

const calloutConfig: Record<
  CalloutType,
  { icon: React.ElementType; className: string; iconClassName: string; label: string }
> = {
  info: {
    icon: IconInfoCircle,
    className: 'border-sky-200/80 bg-gradient-to-br from-sky-50/95 via-white/95 to-cyan-50/80 text-sky-950 dark:border-sky-300/20 dark:from-sky-400/10 dark:via-white/[0.035] dark:to-cyan-400/5 dark:text-sky-100',
    iconClassName: 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-300/20 dark:bg-sky-300/10 dark:text-sky-200',
    label: 'Note',
  },
  warning: {
    icon: IconAlertTriangle,
    className: 'border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white/95 to-orange-50/75 text-amber-950 dark:border-amber-300/20 dark:from-amber-300/10 dark:via-white/[0.035] dark:to-orange-300/5 dark:text-amber-100',
    iconClassName: 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200',
    label: 'Watch closely',
  },
  tip: {
    icon: IconBulb,
    className: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white/95 to-lime-50/70 text-emerald-950 dark:border-emerald-300/20 dark:from-emerald-300/10 dark:via-white/[0.035] dark:to-lime-300/5 dark:text-emerald-100',
    iconClassName: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200',
    label: 'Key idea',
  },
  success: {
    icon: IconCircleCheck,
    className: 'border-teal-200/90 bg-gradient-to-br from-teal-50/95 via-white/95 to-emerald-50/75 text-teal-950 dark:border-teal-300/20 dark:from-teal-300/10 dark:via-white/[0.035] dark:to-emerald-300/5 dark:text-teal-100',
    iconClassName: 'border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200',
    label: 'Verified',
  },
  danger: {
    icon: IconAlertCircle,
    className: 'border-rose-200/90 bg-gradient-to-br from-rose-50/95 via-white/95 to-pink-50/70 text-rose-950 dark:border-rose-300/20 dark:from-rose-300/10 dark:via-white/[0.035] dark:to-pink-300/5 dark:text-rose-100',
    iconClassName: 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200',
    label: 'Important',
  },
}

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const config = calloutConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'group/callout relative my-7 overflow-hidden rounded-[22px] border px-5 py-5 shadow-[0_18px_45px_-35px_rgba(15,65,45,0.65)] sm:px-6',
        config.className,
        className
      )}
      role="note"
      aria-label={title ?? config.label}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-current opacity-55" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-current opacity-[0.045] blur-2xl" />
      <div className="relative flex items-start gap-4">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm', config.iconClassName)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {title && <p className="mb-2 text-sm font-black tracking-tight">{title}</p>}
          <div className="text-[0.95rem] leading-7 text-current/85 [&>ol]:my-3 [&>p]:my-0 [&>p+p]:mt-3 [&>ul]:my-3">
          {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Alias para uso más sencillo en MDX
export const Info = (props: Omit<CalloutProps, 'type'>) => <Callout type="info" {...props} />
export const Warning = (props: Omit<CalloutProps, 'type'>) => <Callout type="warning" {...props} />
export const Tip = (props: Omit<CalloutProps, 'type'>) => <Callout type="tip" {...props} />
export const Success = (props: Omit<CalloutProps, 'type'>) => <Callout type="success" {...props} />
export const Danger = (props: Omit<CalloutProps, 'type'>) => <Callout type="danger" {...props} />
