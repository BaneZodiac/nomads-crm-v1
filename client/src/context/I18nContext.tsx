import { createContext, useContext, ReactNode } from 'react'
import { useSettings } from './SettingsContext'
import { translations, rtlLanguages, supportedLanguages } from '../i18n/translations'

interface I18nContextType {
  t: (key: string) => string
  lang: string
  isRtl: boolean
}

const I18nContext = createContext<I18nContextType>({} as I18nContextType)

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const lang = supportedLanguages.includes(settings.language || 'en') ? settings.language || 'en' : 'en'
  const isRtl = rtlLanguages.includes(lang)
  const dict = translations[lang] || translations.en

  const t = (key: string) => dict[key] || translations.en[key] || key

  if (isRtl) {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = lang
  } else {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = lang
  }

  return (
    <I18nContext.Provider value={{ t, lang, isRtl }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
