import ArbitraryObject from './ArbitraryObject'
import Author from './Author'
import FeaturedMedia from './FeaturedMedia'
import Slug from './Slug'
import { CreateItemListOptions } from '@nacelle/client-js-sdk'
export default interface Entry extends ArbitraryObject {
  _key?: string
  _ref?: string

  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string

  handle: string | Slug
  locale?: string
  title?: string
  publishDate?: string | Date
  publishedDate?: string | Date
  description?: string
  excerpt?: string
  fields?: Entry
  sections?: Entry[]
  tags?: Array<string>
  author?: Author
  featuredMedia?: FeaturedMedia
  content?: ArbitraryObject | ArbitraryObject[]
  contentHtml?: string | undefined
  blogHandle?: string | Slug
  articles?: Array<Entry>
  collectionHandle?: string
  articleLists?: CreateItemListOptions[] | Entry[]
  relatedArticles?: CreateItemListOptions[] | Entry[]
}
