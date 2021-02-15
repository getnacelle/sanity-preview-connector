import { ArbitraryObject } from '~/interfaces'
/**
 * Get a string value from an entry, whether the string value is stored as a string or within a Slug object
 * @param entry - the entry object
 * @param property - the property name (ex: 'handle')
 */
export default function getShortText(entry: ArbitraryObject, property: string) {
  if (typeof entry[property] === 'object') {
    const handle = entry[property] as ArbitraryObject

    if (handle.current) {
      return handle.current as string
    }

    return ''
  } else if (typeof entry[property] === 'string') {
    return entry[property] as string
  }

  return ''
}
