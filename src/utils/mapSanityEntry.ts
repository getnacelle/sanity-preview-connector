import {
  NacelleContent,
  CreateContentOptions,
  // createMedia,
  createItemList,
  createContent
} from '@nacelle/client-js-sdk'
import Entry from '../interfaces/Entry'
// import mapRelatedArticle from './mapRelatedArticle'

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
    content.createdAt = Math.floor(
      new Date(_createdAt).getTime() / 1000
    )
  }

  if (_updatedAt) {
    content.updatedAt = Math.floor(
      new Date(_updatedAt).getTime() / 1000
    )
  }

  if (publishDate) {
    content.publishDate = Math.floor(new Date(publishDate).getTime() / 1000)
  }

  content.type = _type || 'content'

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

  if (author) {
    content.author = {
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      bio: author.bio || '',
      email: author.email || ''
    }
  }

  // TODO: resolve image
  // if (
  //   featuredMedia &&
  //   featuredMedia &&
  //   featuredMedia.fields.file &&
  //   featuredMedia.sys
  // ) {
  //   content.featuredMedia = createMedia({
  //     id: featuredMedia.sys.id,
  //     type: featuredMedia.fields.file.contentType,
  //     src: featuredMedia.fields.file.url,
  //     thumbnailSrc: featuredMedia.fields.file.url,
  //     altText: featuredMedia.fields.title
  //   })
  // }

  if (contentHtml) {
    content.contentHtml = contentHtml
  }

  if (blogHandle) {
    content.blogHandle = blogHandle
  }

  if (articles) {
    const articleHandles = articles
      .filter((article: Entry) => {
        return !!article.handle
      })
      .map((article: Entry) => {
        return article.handle
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

  // TODO:
  // if (relatedArticles) {
  //   content.relatedArticles = relatedArticles.map(mapRelatedArticle)
  // }

  content.fields = { ...otherFields }

  return createContent(content)
}
