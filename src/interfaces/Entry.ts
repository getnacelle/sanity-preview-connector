// import Sys from './Sys'
import FeaturedMedia from './FeaturedMedia'

export default interface Entry {
  [key: string]: string | number | undefined | Array<Entry> | Array<string> | Array<object> | object
  // sys: Sys
  _key: string
  _ref: string

  // move these to Sys?
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string

  handle: string
  locale?: string
  title?: string
  description?: string
  excerpt?: string
  sections?: Array<Entry>
  tags?: Array<string>
  author?: {
    firstName: string
    lastName: string
    bio: string
    email: string
  }
  featuredMedia?: FeaturedMedia
  contentHtml?: any
  publishDate?: string
  blogHandle?: string
  articles?: Array<Entry>
  articleLists?: any
  collectionHandle?: string
  relatedArticles?: Array<object>
}
