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
import sanityClient, { ClientConfig } from '@sanity/client'
import EntriesQuery from '../interfaces/EntriesQuery'
import EntriesQueryIn from '../interfaces/EntriesQueryIn'
import Entry from '../interfaces/Entry'
import mapSanityEntry from '../utils/mapSanityEntry'

export interface NacelleSanityPreviewConnectorParams
  extends NacelleStaticConnectorParams {
  client?: object
  sanityConfig: ClientConfig
  entryMapper?: (entry: Entry) => NacelleContent
}

export interface FetchContentSanityParams
  extends Omit<FetchContentParams, 'handle'> {
  handle?: string
  handles?: string[]
}

export default class NacelleSanityPreviewConnector extends NacelleStaticConnector {
  sanityClient: any
  sanityConfig: ClientConfig
  entryMapper: (entry: Entry) => NacelleContent

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)
    this.sanityConfig = {
      withCredentials: true,
      ...params.sanityConfig
    }
    this.sanityClient = params.client || sanityClient(this.sanityConfig)
    this.entryMapper = params.entryMapper || mapSanityEntry
  }

  removeDraftCounterparts(entries: Array<Entry>): Array<Entry> {
    // If draft entry exists, Sanity returns both the draft and the published versions.
    // In this case we don't want the published version, so filter these entries out.
    const draftRootIds = entries
      .filter((entry: Entry) => entry._id.includes('drafts.'))
      .map((entry: Entry) => entry._id.substr(7))

    return entries.filter((entry: Entry) => !draftRootIds.includes(entry._id))
  }

  // Override content methods
  async content({
    handle,
    handles,
    type = 'page',
    blogHandle = 'blog'
  }: FetchContentSanityParams): Promise<NacelleContent> {
    const queryTermsEq: EntriesQuery = {
      _type: type
    }
    const queryTermsIn: EntriesQueryIn = {}

    if (handles) {
      queryTermsIn['handle.current'] = handles
    } else {
      queryTermsEq['handle.current'] = handle
    }

    if (type === 'article') {
      queryTermsEq.blogHandle = blogHandle
    }

    // see GROQ docs -> https://www.sanity.io/docs/overview-groq
    const groqFilterEq = Object.keys(queryTermsEq).reduce(
      (acc: string, key: string) => {
        const value = queryTermsEq[key]
        const filter = `${key} == "${value}"`
        return acc.length ? `${acc} && ${filter}` : `${filter}`
      },
      ''
    )
    const groqFilter = Object.keys(queryTermsIn).reduce(
      (acc: string, key: string) => {
        const value = queryTermsIn[key].map(v => `'${v}'`)
        const filter = `${key} in [${value}]`
        return acc.length ? `${acc} && ${filter}` : `${filter}`
      },
      groqFilterEq
    )

    // Resolve references to image assets (_ref -> _id)
    const resolveImages = `"featuredMedia": featuredMedia.asset->{
      _id,
      _createdAt,
      _updatedAt,
      _type,
      extension,
      mimeType,
      url
    }`

    // Resolve references to section children (_ref -> _id)
    const resolveSections = `sections[]->{
      ...,
      ${resolveImages}}
    `

    // Construct full groq
    const query = `*[${groqFilter}]{..., ${resolveSections}, ${resolveImages}}`

    const result = await this.sanityClient.fetch(query)
    if (result && result.length > 0) {
      const resolvedEntries = this.removeDraftCounterparts(result)

      return handle
        ? this.entryMapper(resolvedEntries[0])
        : resolvedEntries.map(this.entryMapper)
    }

    const errorContent = handle
      ? `type ${type}, handle ${handle}`
      : `type ${type}, handles ${handles}`
    throw new Error(
      `Unable to find Sanity preview content with ${errorContent}`
    )
  }

  async allContent(): Promise<NacelleContent[]> {
    const query = `*`
    const result = await this.sanityClient.fetch(query)
    if (result && result.length > 0) {
      return result.map(this.entryMapper)
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

  pages({ handles, locale }: FetchPagesParams): Promise<NacelleContent[]> {
    return this.content({
      handles,
      locale,
      type: 'page'
    })
  }

  article({
    handle,
    locale,
    blogHandle
  }: FetchArticleParams): Promise<NacelleContent> {
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
  }: FetchArticlesParams): Promise<NacelleContent[]> {
    return this.content({
      handles,
      locale,
      blogHandle,
      type: 'article'
    })
  }

  blog({ handle, locale }: FetchBlogParams): Promise<NacelleContent> {
    return this.content({
      handle,
      locale,
      type: 'blog'
    })
  }
}
