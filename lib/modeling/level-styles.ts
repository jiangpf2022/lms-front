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

export function modelingLevelIconClasses(level: number): string {
  if (level === 1) {
    return 'border-emerald-300/60 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-900 shadow-emerald-900/10 dark:border-emerald-300/20 dark:from-emerald-400/20 dark:to-emerald-300/5 dark:text-emerald-200'
  }

  if (level === 2) {
    return 'border-amber-300/70 bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-950 shadow-amber-900/10 dark:border-amber-300/25 dark:from-amber-300/20 dark:to-yellow-300/5 dark:text-amber-200'
  }

  return 'border-rose-300/70 bg-gradient-to-br from-rose-100 to-red-50 text-rose-950 shadow-rose-900/10 dark:border-rose-300/25 dark:from-rose-400/20 dark:to-red-300/5 dark:text-rose-200'
}

export function modelingLevelTitleClasses(level: number): string {
  if (level === 1) return 'text-emerald-900 dark:text-emerald-200'
  if (level === 2) return 'text-amber-900 dark:text-amber-200'
  return 'text-rose-900 dark:text-rose-200'
}

export function modelingLevelRowClasses(level: number): string {
  if (level === 1) return 'border-l-4 border-l-emerald-500 hover:bg-emerald-50/70 dark:hover:bg-emerald-400/[.06]'
  if (level === 2) return 'border-l-4 border-l-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-300/[.06]'
  return 'border-l-4 border-l-rose-500 hover:bg-rose-50/75 dark:hover:bg-rose-400/[.06]'
}
