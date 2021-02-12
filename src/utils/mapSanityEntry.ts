import {
  NacelleContent,
  CreateContentOptions,
  createItemList,
  createContent
} from '@nacelle/client-js-sdk'
import Entry from '../interfaces/Entry'
import getShortText from './getShortText'
import getMedia from './getMedia'

export default (entry: Entry): NacelleContent => {
  const content = {
    cmsSyncSource: 'sanity',
    source: 'sanity'
  } as CreateContentOptions
  const {
    _id,
    _createdAt,
    _updatedAt,
    _type,
    locale,
    title,
    handle,
    description,
    excerpt,
    sections,
    tags,
    author,
    featuredMedia,
    contentHtml,
    publishDate,
    blogHandle,
    articles,
    articleLists,
    collectionHandle,
    relatedArticles,
    ...otherFields
  } = entry

  if (locale) {
    content.locale = locale
  }

  if (_id) {
    content.cmsSyncSourceContentId = _id
  }

  if (_createdAt) {
    content.createdAt = Math.floor(new Date(_createdAt).getTime() / 1000)
  }

  if (_updatedAt) {
    content.updatedAt = Math.floor(new Date(_updatedAt).getTime() / 1000)
  }

  if (publishDate) {
    content.publishDate = Math.floor(new Date(publishDate).getTime() / 1000)
  }

  content.type = _type || 'content'

  if (title) {
    content.title = title
  }

  if (handle) {
    content.handle = getShortText(entry, 'handle')
  }

  if (description) {
    content.description = description
  }

  if (excerpt) {
    content.excerpt = excerpt
  }

  if (tags) {
    content.tags = tags
  }

  if (author) {
    content.author = {
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      bio: author.bio || '',
      email: author.email || ''
    }
  }

  if (featuredMedia) {
    const altText = getShortText(otherFields, 'altText')

    if (altText) {
      featuredMedia.altText = altText
    }

    content.featuredMedia = getMedia(featuredMedia)
  }

  if (sections) {
    content.sections = sections.map((section: Entry) => {
      const altText = getShortText(section, 'altText')

      if (section && section.featuredMedia && altText) {
        section.featuredMedia.altText = altText
      }

      const featuredMedia = getMedia(section.featuredMedia)
      const handle = getShortText(section, 'handle')

      return {
        ...section,
        featuredMedia,
        handle
      }
    })
  }

  if (contentHtml) {
    content.contentHtml = contentHtml
  }

  if (blogHandle) {
    content.blogHandle = getShortText(entry, 'blogHandle')
  }

  if (articles) {
    const articleHandles = articles
      .filter((article: Entry) => Boolean(article.handle))
      .map((article: Entry) => getShortText(article, 'handle'))

    content.articleLists = [
      createItemList({
        title: 'default',
        locale: content.locale || 'en-US',
        handles: articleHandles
      })
    ]
  } else if (articleLists) {
    content.articleLists = articleLists
  }

  if (collectionHandle) {
    content.collectionHandle = collectionHandle
  }

  content.fields = { ...otherFields }

  return createContent(content)
}
