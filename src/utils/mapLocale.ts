export default (locale: string, locales: string[]) => {
  if (Array.isArray(locales) && locales.length > 0) {
    const useLocale = locales.find(loc => {
      return loc === locale || loc.toLowerCase() === locale
    })

    if (useLocale) {
      return useLocale
    }

    return locales[0]
  }

  return 'en-US'
}
