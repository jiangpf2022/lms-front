export function modelingLevelBadgeClasses(level: number): string {
  if (level === 1) {
    return 'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/12 dark:text-emerald-200'
  }

  if (level === 2) {
    return 'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-300/30 dark:bg-amber-300/12 dark:text-amber-200'
  }

  return 'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-300/30 dark:bg-rose-400/12 dark:text-rose-200'
}

export function modelingLevelDotClasses(level: number): string {
  if (level === 1) return 'bg-emerald-500 shadow-emerald-500/45'
  if (level === 2) return 'bg-amber-400 shadow-amber-400/45'
  return 'bg-rose-500 shadow-rose-500/45'
}

export function modelingLevelPanelClasses(level: number): string {
  if (level === 1) {
    return 'border-emerald-300/30 bg-emerald-400/[.08] hover:border-emerald-300/50 hover:bg-emerald-400/[.12]'
  }

  if (level === 2) {
    return 'border-amber-300/30 bg-amber-300/[.08] hover:border-amber-300/50 hover:bg-amber-300/[.12]'
  }

  return 'border-rose-300/30 bg-rose-400/[.08] hover:border-rose-300/50 hover:bg-rose-400/[.12]'
}

export function modelingLevelTextClasses(level: number): string {
  if (level === 1) return 'text-emerald-300'
  if (level === 2) return 'text-amber-300'
  return 'text-rose-300'
}
