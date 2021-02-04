// import Sys from './Sys'

export default interface Entry {
  // sys: Sys

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
  featuredMedia?: {
    _id: string
    _createdAt: string
    _updatedAt: string
    _type: string
    extension: string
    mimeType: string
    url: string
  }
  contentHtml?: any
  publishDate?: string
  blogHandle?: string
  articles?: Array<Entry>
  articleLists?: any
  collectionHandle?: string
  relatedArticles?: Array<object>
}
