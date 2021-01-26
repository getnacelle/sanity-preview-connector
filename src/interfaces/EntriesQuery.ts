export default interface EntriesQuery {
  content_type: string
  locale?: string
  include: number
  [key: string]: string | number | undefined
}
