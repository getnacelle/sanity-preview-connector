// import Sys from './Sys'
import FeaturedMedia from './FeaturedMedia'
import ArbitraryObject from './ArbitraryObject'
export default interface Entry {
  [key: string]:
    | string
    | number
    | undefined
    | Array<Entry>
    | Array<string>
    | Array<object>
    | object
  _key: string
  _ref: string

  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string

  handle: string
  locale?: string
  title?: string
  publishDate?: string | Date
  description?: string
  excerpt?: string
  fields?: Entry
  sections?: Entry[]
  tags?: Array<string>
  author?: ArbitraryObject
  featuredMedia?: FeaturedMedia
  contentHtml?: string | undefined
  blogHandle?: string
  articles?: Array<Entry>
  articleLists?: ArbitraryObject[]
  collectionHandle?: string
  relatedArticles?: ArbitraryObject[]
}
