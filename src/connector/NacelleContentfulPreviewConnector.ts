import {
  NacelleStaticConnector,
  NacelleStaticConnectorParams,
  FetchContentParams,
  FetchPageParams,
  FetchPagesParams,
  FetchArticleParams,
  FetchArticlesParams,
  FetchBlogParams,
  Content
} from '@nacelle/client-js-sdk'
import { createClient } from 'sanity'
import EntriesQuery from '../interfaces/EntriesQuery'
import Entry from '../interfaces/Entry'
import mapSanityEntry from '../utils/mapSanityEntry'
import mapLocale from '../utils/mapLocale'

export interface NacelleSanityPreviewConnectorParams
  extends NacelleStaticConnectorParams {
  sanityToken: string
  sanitySpaceID: string
  sanityEndpoint?: string
  sanityPreviewLocales?: string[]
  include?: number
  client?: object
  entryMapper?: (entry: Entry) => Content
}

export default class NacelleSanityPreviewConnector extends NacelleStaticConnector {
  sanityToken: string
  sanityEndpoint: string
  sanitySpaceID: string
  sanityPreviewLocales: string[]
  sanityClient: any
  sanityIncludeDepth: number
  entryMapper: (entry: Entry) => Content

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)

    this.sanityToken = params.sanityToken
    this.sanitySpaceID = params.sanitySpaceID
    this.sanityEndpoint = params.sanityEndpoint || 'preview.sanity.com'
    this.sanityPreviewLocales = params.sanityPreviewLocales || ['en-US']
    this.sanityClient =
      params.client ||
      createClient({
        space: this.sanitySpaceID,
        accessToken: this.sanityToken,
        host: this.sanityEndpoint
      })
    this.sanityIncludeDepth = params.include || 3
    this.entryMapper = params.entryMapper || mapSanityEntry
  }

  // Override content methods
  async content({
    handle,
    type = 'page',
    locale,
    blogHandle = 'blog'
  }: FetchContentParams): Promise<Content> {
    const useLocale = locale
      ? mapLocale(locale, this.sanityPreviewLocales)
      : 'en-US'

    const query: EntriesQuery = {
      'fields.handle': handle,
      content_type: type,
      locale: useLocale,
      include: this.sanityIncludeDepth
    }

    if (type === 'article') {
      query['fields.blogHandle'] = blogHandle
    }

    const response = await this.sanityClient.getEntries(query)

    if (response && response.items.length > 0) {
      return this.entryMapper(response.items[0])
    }

    throw new Error(
      `Unable to find Sanity preview content with handle ${handle}`
    )
  }

  async allContent(): Promise<Content[]> {
    const response = await this.sanityClient.getEntries({
      locale: this.sanityPreviewLocales[0],
      include: this.sanityIncludeDepth
    })

    if (response && response.items.length > 0) {
      return response.items.map(this.entryMapper)
    }

    return []
  }

  page({ handle, locale }: FetchPageParams): Promise<Content> {
    return this.content({
      handle,
      locale,
      type: 'page'
    })
  }

  async pages({ handles, locale }: FetchPagesParams): Promise<Content[]> {
    const requests = handles.map((handle: string) => {
      return this.content({
        handle,
        locale,
        type: 'page'
      })
    })
    const results = (await Promise.all(
      requests.map((p: Promise<Content>) => p.catch(e => e))
    )) as Array<Content | Error>
    const validResults = results.filter(
      result => !(result instanceof Error)
    ) as Content[]

    return validResults
  }

  article({
    handle,
    locale,
    blogHandle
  }: FetchArticleParams): Promise<Content> {
    return this.content({
      handle,
      locale,
      blogHandle,
      type: 'article'
    })
  }

  async articles({
    handles,
    blogHandle,
    locale
  }: FetchArticlesParams): Promise<Content[]> {
    const requests = handles.map((handle: string) => {
      return this.content({
        handle,
        blogHandle,
        locale,
        type: 'article'
      })
    })
    const results = (await Promise.all(
      requests.map((p: Promise<Content>) => p.catch(e => e))
    )) as Array<Content | Error>
    const validResults = results.filter(
      result => !(result instanceof Error)
    ) as Content[]

    return validResults
  }

  blog({ handle, locale }: FetchBlogParams): Promise<Content> {
    return this.content({
      handle,
      locale: locale,
      type: 'blog'
    })
  }
}
