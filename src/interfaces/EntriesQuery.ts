export default interface EntriesQuery {
  _type: string
  locale?: string
  [key: string]: string | number | undefined
}
