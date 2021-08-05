import NacelleClient, {
  NacelleGraphQLConnector,
  NacelleGraphQLConnectorParams,
  FetchContentParams,
  FetchPageParams,
  FetchPagesParams,
  FetchArticleParams,
  FetchArticlesParams,
  FetchBlogParams,
  NacelleContent
} from '@nacelle/client-js-sdk'
import sanityClient, { ClientConfig, SanityClient } from '@sanity/client'
import { Entry, EntriesQuery, EntriesQueryIn, Reference } from '~/interfaces'
import { mapSanityEntry } from '../utils'
import { MediaProjection, sectionsProjection } from '../groq'

export interface NacelleSanityPreviewConnectorParams
  extends NacelleGraphQLConnectorParams {
  sanityConfig: ClientConfig
  client?: SanityClient | any
  include?: number
  entryMapper?: (entry: Entry) => NacelleContent
  mediaProjection?: string
  sectionsProjection?: string
}

export interface CreateConnectorOptions {
  sanityConfig: ClientConfig
  client?: SanityClient | any
  include?: number
  entryMapper?: (entry: Entry) => NacelleContent
  mediaProjection?: string
  sectionsProjection?: string
}

export interface FetchContentSanityParams
  extends Omit<FetchContentParams, 'handle'> {
  handle?: string
  handles?: string[]
  maxDepth?: number
}

export function createSanityPreviewConnector(
  client: NacelleClient,
  options: CreateConnectorOptions
): NacelleSanityPreviewConnector {
  const params = {
    ...options,
    endpoint: client.nacelleEndpoint,
    spaceId: client.id,
    token: client.token
  }
  return new NacelleSanityPreviewConnector(params)
}

export default class NacelleSanityPreviewConnector extends NacelleGraphQLConnector {
  sanityClient: SanityClient
  sanityConfig: ClientConfig
  maxDepth: number
  entryMapper: (entry: Entry) => NacelleContent
  mediaProjection?: string
  sectionsProjection?: string

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)
    this.sanityConfig = {
      withCredentials: true,
      ...params.sanityConfig
    }
    this.maxDepth = params.include || 3
    this.entryMapper = params.entryMapper || mapSanityEntry
    this.mediaProjection = params.mediaProjection || MediaProjection
    this.sectionsProjection =
      params.sectionsProjection || sectionsProjection(this.mediaProjection)

    const useCdn =
      typeof this.sanityConfig.useCdn === 'boolean'
        ? this.sanityConfig.useCdn
        : false
    this.sanityClient =
      params.client || sanityClient({ ...this.sanityConfig, useCdn })
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
  }: FetchContentSanityParams): Promise<NacelleContent | NacelleContent[]> {
    const queryTermsEq: EntriesQuery = {
      _type: type
    }
    const queryTermsIn: EntriesQueryIn = {}
    const singleHandle = Boolean(handle) && !handles
    const multipleHandles = !handle && Boolean(handles)

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
        return acc.length ? `${acc} && ${filter}` : filter
      },
      ''
    )
    const groqFilter = Object.keys(queryTermsIn).reduce(
      (acc: string, key: string) => {
        const value = queryTermsIn[key].map(v => `'${v}'`)
        const filter = `${key} in [${value}]`
        return acc.length ? `${acc} && ${filter}` : filter
      },
      groqFilterEq
    )

    const result = await this.fetchFromSanity(groqFilter)

    if (result && result.length > 0) {
      const dedupedEntries: Array<Entry> = this.removeDraftCounterparts(result)

      const resolvedEntryPromises = dedupedEntries.map((entry: Entry) =>
        this.resolveReferences(entry)
      )

      const resolvedEntries: Array<Entry> = await Promise.all(
        resolvedEntryPromises
      )

      if (singleHandle) {
        return this.entryMapper(resolvedEntries[0])
      } else if (multipleHandles) {
        return resolvedEntries.map(entry => this.entryMapper(entry))
      }
    }

    const errorContent = singleHandle
      ? `type ${type}, handle ${handle}`
      : `type ${type}, handles ${handles?.join(', ')}`

    throw new Error(
      `Unable to find Sanity preview content with ${errorContent}`
    )
  }

  // Recursively search and resolve references up to a set depth.
  // Depth pertains only to depth of references not actually object levels
  async resolveReferences(obj: any, currentDepth: number = 0): Promise<any> {
    // Resolve each object key
    let newObj: any = { ...obj }

    if (typeof obj === 'object' && typeof obj._ref === 'string') {
      newObj = await this.lookupReference(obj)
      return newObj
    }

    const resolvedPromises = Object.keys(obj).map(async (key: string) => {
      let value: any = obj[key]
      let resolvedValue: any = value

      if (Array.isArray(value)) {
        const allResolved = value.map(async (item: any) => {
          return await this.resolveReferences(item, currentDepth)
        })
        resolvedValue = await Promise.all(allResolved)
      } else if (typeof value === 'object' && typeof value._ref === 'string') {
        resolvedValue = await this.lookupReference(value)
      } else if (typeof value === 'object') {
        resolvedValue = await this.resolveReferences(value, currentDepth)
      }
      newObj[key] = resolvedValue
    })
    await Promise.all(resolvedPromises)
    return newObj
  }

  async lookupReference(
    reference: Reference,
    currentDepth: number = 0
  ): Promise<any> {
    // Lookup References
    const referencedEntry = await this.fetchEntryById(reference._ref)

    if (referencedEntry && currentDepth < this.maxDepth) {
      const newDepth = currentDepth + 1
      return this.resolveReferences(referencedEntry, newDepth)
    } else {
      throw new Error(
        `Unable to dereference Sanity entry with _id ${reference._ref}`
      )
    }
  }

  async fetchFromSanity(groqFilter?: string): Promise<any> {
    const query = `*[${groqFilter || ''}]{
      ...,
      ${this.sectionsProjection},
      ${this.mediaProjection}}
    `
    const result = await this.sanityClient.fetch(query)

    return result
  }

  async fetchEntryById(id: string): Promise<Entry> {
    const result = await this.fetchFromSanity(`_id == "${id}"`)
    return result && result[0]
  }

  async allContent(): Promise<NacelleContent[]> {
    const result = await this.fetchFromSanity()
    if (result && result.length > 0) {
      const dedupedEntries: Array<Entry> = this.removeDraftCounterparts(result)

      const resolvedEntryPromises = dedupedEntries.map(
        async (entry: Entry) => await this.resolveReferences(entry)
      )

      const resolvedEntries: Array<Entry> = await Promise.all(
        resolvedEntryPromises
      )

      return resolvedEntries.map(entry => this.entryMapper(entry))
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

  articles({
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
