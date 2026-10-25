import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
export const locales = ['en', 'es', 'zh'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    // The modeling academy has its own complete bilingual reading interface.
    // Shared LMS chrome falls back to English until a full generic Chinese
    // catalog is introduced.
    messages: locale === 'zh'
      ? (await import('./messages/en.json')).default
      : (await import(`./messages/${locale}.json`)).default,
  }
})
