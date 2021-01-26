import { NacelleContent, createMedia } from '@nacelle/client-js-sdk'
import Entry from '../interfaces/Entry'

export default (entry: Entry): NacelleContent => {
  const article: NacelleContent = {
    locale: 'en-us',
    handle: ''
  }
  const fields = entry.fields || {}
  // Save basics of related article
  const {
    title,
    handle,
    description,
    excerpt,
    tags,
    author,
    featuredMedia,
    blogHandle,
    publishDate
  } = fields

  if (entry.sys.locale) {
    article.locale = entry.sys.locale
  }

  if (entry.sys.id) {
    article.cmsSyncSourceContentId = entry.sys.id
  }

  if (entry.sys.createdAt) {
    article.createdAt = Math.floor(
      new Date(entry.sys.createdAt).getTime() / 1000
    )
  }

  if (entry.sys.updatedAt) {
    article.updatedAt = Math.floor(
      new Date(entry.sys.updatedAt).getTime() / 1000
    )
  }

  if (title) {
    article.title = title
  }

  if (handle) {
    article.handle = handle
  }

  if (description) {
    article.description = description
  }

  if (excerpt) {
    article.excerpt = excerpt
  }

  if (tags) {
    article.tags = tags
  }

  if (author) {
    article.author = {
      firstName: '',
      lastName: '',
      email: '',
      bio: ''
    }

    if (author.fields.firstName) {
      article.author.firstName = author.fields.firstName
    }

    if (author.fields.lastName) {
      article.author.lastName = author.fields.lastName
    }

    if (author.fields.email) {
      article.author.email = author.fields.email
    }
    if (author.fields.bio) {
      article.author.bio = author.fields.bio
    }
  }

  if (
    featuredMedia &&
    featuredMedia.fields &&
    featuredMedia.fields.file &&
    featuredMedia.sys
  ) {
    article.featuredMedia = createMedia({
      id: featuredMedia.sys.id,
      type: featuredMedia.fields.file.contentType,
      src: featuredMedia.fields.file.url,
      thumbnailSrc: featuredMedia.fields.file.url,
      altText: featuredMedia.fields.title
    })
  }

  if (publishDate) {
    article.publishDate = Math.floor(new Date(publishDate).getTime() / 1000)
  }

  if (blogHandle) {
    article.blogHandle = blogHandle || 'blog'
  }

  return article
}
