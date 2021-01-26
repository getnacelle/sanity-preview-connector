import {
  NacelleStaticConnector,
  NacelleStaticConnectorParams,
  FetchContentParams,
  FetchPageParams,
  FetchPagesParams,
  FetchArticleParams,
  FetchArticlesParams,
  FetchBlogParams,
  NacelleContent
} from '@nacelle/client-js-sdk'
import sanityClient from '@sanity/client'
import EntriesQuery from '../interfaces/EntriesQuery'
import Entry from '../interfaces/Entry'
import mapSanityEntry from '../utils/mapSanityEntry'

export interface NacelleSanityPreviewConnectorParams
  extends NacelleStaticConnectorParams {
  sanityProjectID: string
  sanityDataset: string
  sanityToken?: string
  client?: object
  entryMapper?: (entry: Entry) => NacelleContent
}

export default class NacelleSanityPreviewConnector extends NacelleStaticConnector {
  sanityProjectID: string
  sanityDataset: string
  sanityToken: string
  sanityClient: any
  entryMapper: (entry: Entry) => NacelleContent

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)
    this.sanityProjectID = params.sanityProjectID
    this.sanityDataset = params.sanityDataset
    this.sanityToken = params.sanityToken || ''
    this.sanityClient =
      params.client ||
      sanityClient({
        projectId: this.sanityProjectID,
        dataset: this.sanityDataset,
        useCdn: false,
        withCredentials: Boolean(this.sanityToken)
      })
    this.entryMapper = params.entryMapper || mapSanityEntry
  }

  // Override content methods
  async content({
    handle,
    type = 'page',
    blogHandle = 'blog'
  }: FetchContentParams): Promise<NacelleContent> {
    // const query: EntriesQuery = {
    //   'fields.handle': handle,
    //   content_type: type
    // }
    // if (type === 'article') {
    //   query['fields.blogHandle'] = blogHandle
    // }
    // const response = await this.sanityClient.getEntries(query)
    // if (response && response.items.length > 0) {
    //   return this.entryMapper(response.items[0])
    // }
    // throw new Error(
    //   `Unable to find Sanity preview content with handle ${handle}`
    // )
  }

  async allContent(): Promise<NacelleContent[]> {
    // const response = await this.sanityClient.getEntries({
    //   locale: this.sanityPreviewLocales[0],
    //   include: this.sanityIncludeDepth
    // })
    // if (response && response.items.length > 0) {
    //   return response.items.map(this.entryMapper)
    // }
    // return []
  }

  page({ handle, locale }: FetchPageParams): Promise<NacelleContent> {
    // return this.content({
    //   handle,
    //   locale,
    //   type: 'page'
    // })
  }

  async pages({
    handles,
    locale
  }: FetchPagesParams): Promise<NacelleContent[]> {
    // const requests = handles.map((handle: string) => {
    //   return this.content({
    //     handle,
    //     locale,
    //     type: 'page'
    //   })
    // })
    // const results = (await Promise.all(
    //   requests.map((p: Promise<NacelleContent>) => p.catch(e => e))
    // )) as Array<NacelleContent | Error>
    // const validResults = results.filter(
    //   result => !(result instanceof Error)
    // ) as NacelleContent[]
    // return validResults
  }

  article({
    handle,
    locale,
    blogHandle
  }: FetchArticleParams): Promise<NacelleContent> {
    // return this.content({
    //   handle,
    //   locale,
    //   blogHandle,
    //   type: 'article'
    // })
  }

  async articles({
    handles,
    blogHandle,
    locale
  }: FetchArticlesParams): Promise<NacelleContent[]> {
    // const requests = handles.map((handle: string) => {
    //   return this.content({
    //     handle,
    //     blogHandle,
    //     locale,
    //     type: 'article'
    //   })
    // })
    // const results = (await Promise.all(
    //   requests.map((p: Promise<NacelleContent>) => p.catch(e => e))
    // )) as Array<NacelleContent | Error>
    // const validResults = results.filter(
    //   result => !(result instanceof Error)
    // ) as NacelleContent[]
    // return validResults
  }

  blog({ handle, locale }: FetchBlogParams): Promise<NacelleContent> {
    // return this.content({
    //   handle,
    //   locale: locale,
    //   type: 'blog'
    // })
  }
}
