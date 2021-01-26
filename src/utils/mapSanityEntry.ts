import {
  NacelleContent,
  CreateContentOptions,
  createMedia,
  createItemList,
  createContent
} from '@nacelle/client-js-sdk'
import Entry from '../interfaces/Entry'
import mapRelatedArticle from './mapRelatedArticle'

export default (entry: Entry): NacelleContent => {
  const content = {
    cmsSyncSource: 'sanity',
    source: 'sanity'
  } as CreateContentOptions
  const fields = entry.fields
  const {
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
  } = fields

  if (entry.sys.locale) {
    content.locale = entry.sys.locale
  }

  if (entry.sys.id) {
    content.cmsSyncSourceContentId = entry.sys.id
  }

  if (entry.sys.createdAt) {
    content.createdAt = Math.floor(
      new Date(entry.sys.createdAt).getTime() / 1000
    )
  }

  if (entry.sys.updatedAt) {
    content.updatedAt = Math.floor(
      new Date(entry.sys.updatedAt).getTime() / 1000
    )
  }

  if (publishDate) {
    content.publishDate = Math.floor(new Date(publishDate).getTime() / 1000)
  }

  if (entry.sys.contentType.sys.id) {
    content.type = entry.sys.contentType.sys.id
  } else {
    content.type = 'content'
  }

  if (title) {
    content.title = title
  }

  if (handle) {
    content.handle = handle
  }

  if (description) {
    content.description = description
  }

  if (excerpt) {
    content.excerpt = excerpt
  }

  if (sections) {
    content.sections = sections
  }

  if (tags) {
    content.tags = tags
  }

  if (author && author.fields) {
    content.author = {
      firstName: author.fields.firstName || '',
      lastName: author.fields.lastName || '',
      bio: author.fields.bio || '',
      email: author.fields.email || ''
    }
  }

  if (
    featuredMedia &&
    featuredMedia.fields &&
    featuredMedia.fields.file &&
    featuredMedia.sys
  ) {
    content.featuredMedia = createMedia({
      id: featuredMedia.sys.id,
      type: featuredMedia.fields.file.contentType,
      src: featuredMedia.fields.file.url,
      thumbnailSrc: featuredMedia.fields.file.url,
      altText: featuredMedia.fields.title
    })
  }

  if (contentHtml) {
    content.contentHtml = contentHtml
  }

  if (blogHandle) {
    content.blogHandle = blogHandle
  }

  if (articles) {
    const articleHandles = articles
      .filter((article: Entry) => {
        if (!article.fields || !article.fields.handle) {
          return false
        }
        return true
      })
      .map((article: Entry) => {
        return article.fields.handle
      })

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

  if (relatedArticles) {
    content.relatedArticles = relatedArticles.map(mapRelatedArticle)
  }

  content.fields = { ...otherFields }

  return createContent(content)
}
