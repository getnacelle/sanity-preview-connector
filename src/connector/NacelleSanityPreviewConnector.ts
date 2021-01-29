import {
  NacelleStaticConnector,
  NacelleStaticConnectorParams,
  FetchContentParams,
  FetchPageParams,
  // FetchPagesParams,
  // FetchArticleParams,
  // FetchArticlesParams,
  // FetchBlogParams,
  NacelleContent
} from '@nacelle/client-js-sdk'
import sanityClient, { ClientConfig } from '@sanity/client'
import EntriesQuery from '../interfaces/EntriesQuery'
import Entry from '../interfaces/Entry'
import mapSanityEntry from '../utils/mapSanityEntry'

export interface NacelleSanityPreviewConnectorParams
extends NacelleStaticConnectorParams {
  client?: object
  sanityConfig: ClientConfig
  sanityToken?: string
  entryMapper?: (entry: Entry) => NacelleContent
}

export default class NacelleSanityPreviewConnector extends NacelleStaticConnector {
  sanityClient: any
  sanityConfig: ClientConfig
  sanityToken: string
  entryMapper: (entry: Entry) => NacelleContent

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)
    this.sanityToken = params.sanityToken || ''
    this.sanityConfig = params.sanityConfig
    this.sanityClient = params.client || sanityClient(this.sanityConfig)
    this.entryMapper = params.entryMapper || mapSanityEntry
  }

  // Override content methods
  async content({
    handle,
    type = 'page',
    blogHandle = 'blog'
  }: FetchContentParams): Promise<NacelleContent> {
    const queryTerms: EntriesQuery = {
      _type: type,
      'handle.current': handle,
    }
    if (type === 'article') {
      queryTerms.blogHandle = blogHandle
    }

    // see GROQ docs -> https://www.sanity.io/docs/overview-groq
    const groqFilter = Object.keys(queryTerms).reduce((acc: string, key: string) => {
      const value = queryTerms[key]
      const filter = `${key} == "${value}"`
      return acc.length ? `${acc} && ${filter}` : `${filter}`
    }, '')

    // Resolve references to section children (_ref -> _id)
    const groqProjection = `{..., sections[]->{...}}`
    const query = `*[${groqFilter}]${groqProjection}`

    const result = await this.sanityClient.fetch(query)
    if (result && result.length > 0) {
      return this.entryMapper(result[0])
    }
    throw new Error(
      `Unable to find Sanity preview content with type ${type}, handle ${handle}`
    )
  }

  async allContent(): Promise<NacelleContent[]> {
    const query = `*`

    // const response = await this.sanityClient.getDocuments({
    //   locale: this.sanityPreviewLocales[0],
    //   include: this.sanityIncludeDepth
    // })
    const result = await this.sanityClient.fetch(query)
    if (result && result.length > 0) {
      return this.entryMapper(result[0])
    }

    return []
  }

  page({ handle, locale }: FetchPageParams): Promise<NacelleContent> {
    return this.content({
      handle,
      locale,
      type: 'page'
    })
  }

  // async pages({
  //   handles,
  //   locale
  // }: FetchPagesParams): Promise<NacelleContent[]> {
  //   // const requests = handles.map((handle: string) => {
  //   //   return this.content({
  //   //     handle,
  //   //     locale,
  //   //     type: 'page'
  //   //   })
  //   // })
  //   // const results = (await Promise.all(
  //   //   requests.map((p: Promise<NacelleContent>) => p.catch(e => e))
  //   // )) as Array<NacelleContent | Error>
  //   // const validResults = results.filter(
  //   //   result => !(result instanceof Error)
  //   // ) as NacelleContent[]
  //   // return validResults
  // }

  // article({
  //   handle,
  //   locale,
  //   blogHandle
  // }: FetchArticleParams): Promise<NacelleContent> {
  //   // return this.content({
  //   //   handle,
  //   //   locale,
  //   //   blogHandle,
  //   //   type: 'article'
  //   // })
  // }

  // async articles({
  //   handles,
  //   blogHandle,
  //   locale
  // }: FetchArticlesParams): Promise<NacelleContent[]> {
  //   // const requests = handles.map((handle: string) => {
  //   //   return this.content({
  //   //     handle,
  //   //     blogHandle,
  //   //     locale,
  //   //     type: 'article'
  //   //   })
  //   // })
  //   // const results = (await Promise.all(
  //   //   requests.map((p: Promise<NacelleContent>) => p.catch(e => e))
  //   // )) as Array<NacelleContent | Error>
  //   // const validResults = results.filter(
  //   //   result => !(result instanceof Error)
  //   // ) as NacelleContent[]
  //   // return validResults
  // }

  // blog({ handle, locale }: FetchBlogParams): Promise<NacelleContent> {
  //   // return this.content({
  //   //   handle,
  //   //   locale: locale,
  //   //   type: 'blog'
  //   // })
  // }
}
