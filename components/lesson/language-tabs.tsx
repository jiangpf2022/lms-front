'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type LessonLanguage = 'en' | 'zh'

const LanguageContext = createContext<LessonLanguage>('en')

export function LanguageTabs({
  children,
  defaultLanguage = 'en',
}: {
  children: ReactNode
  defaultLanguage?: LessonLanguage
}) {
  const [language, setLanguage] = useState<LessonLanguage>(defaultLanguage)
  const labels = useMemo(
    () => ({ en: 'English', zh: '中文' }),
    []
  )

  return (
    <LanguageContext.Provider value={language}>
      <div className="not-prose sticky top-3 z-20 mb-8 flex justify-end">
        <div
          className="inline-flex rounded-full border border-border/80 bg-background/90 p-1 shadow-lg backdrop-blur"
          role="group"
          aria-label="Lesson language"
        >
          {(['en', 'zh'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLanguage(item)}
              aria-pressed={language === item}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                language === item
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {labels[item]}
            </button>
          ))}
        </div>
      </div>
      {children}
    </LanguageContext.Provider>
  )
}

export function LanguagePanel({
  children,
  language,
}: {
  children: ReactNode
  language: LessonLanguage
  label?: string
}) {
  const activeLanguage = useContext(LanguageContext)
  if (language !== activeLanguage) return null
  return <div lang={language === 'zh' ? 'zh-CN' : 'en'}>{children}</div>
}
