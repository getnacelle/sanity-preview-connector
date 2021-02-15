import mapLocale from '../src/utils/mapLocale'

describe('mapLocale', () => {
  it('returns locale from array if match', () => {
    const locale = 'es-419'
    const locales = ['es-MX', 'es-419']

    const useLocale = mapLocale(locale, locales)

    expect(useLocale).toBe('es-419')
  })

  it('returns the first locale in array if no match', () => {
    const locale = 'en-US'
    const locales = ['es-MX', 'es-419']

    const useLocale = mapLocale(locale, locales)

    expect(useLocale).toBe('es-MX')
  })

  it('matches locales with lowercase', () => {
    const locale = 'es-mx'
    const locales = ['en-US', 'es-MX']

    const useLocale = mapLocale(locale, locales)

    expect(useLocale).toBe('es-MX')
  })
})
