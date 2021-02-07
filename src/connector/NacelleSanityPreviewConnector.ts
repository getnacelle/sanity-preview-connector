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
import Reference from '../interfaces/Reference'
import mapSanityEntry from '../utils/mapSanityEntry' 

export interface NacelleSanityPreviewConnectorParams
  extends NacelleStaticConnectorParams {
  client?: object
  sanityConfig: ClientConfig
  include: number
  entryMapper?: (entry: Entry) => NacelleContent
}

export interface FetchContentSanityParams
  extends Omit<FetchContentParams, 'handle'> {
  handle?: string
  handles?: string[]
  maxDepth?: number
}

export default class NacelleSanityPreviewConnector extends NacelleStaticConnector {
  sanityClient: any
  sanityConfig: ClientConfig
  maxDepth: number
  entryMapper: (entry: Entry) => NacelleContent

  constructor(params: NacelleSanityPreviewConnectorParams) {
    super(params)
    this.sanityConfig = {
      withCredentials: true,
      ...params.sanityConfig
    }
    this.maxDepth = params.include || 3
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
    const resolveMedia = `"featuredMedia.asset": featuredMedia.asset->{
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
      ${resolveMedia}}
    `
    // const resolveSections = `"sections": sections`

    // Construct full groq
    const query = `*[${groqFilter}]{..., ${resolveSections}, ${resolveMedia}}`

    const result = await this.sanityClient.fetch(query)
    if (result && result.length > 0) {
      const dedupedEntries: Array<Entry> = this.removeDraftCounterparts(result)

      const resolvedEntryPromises = dedupedEntries
        .map((entry: Entry) => this.resolveReferences(entry))

      const resolvedEntries: Array<Entry> = await Promise.all(resolvedEntryPromises)

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

  // Recursively search and resolve references up to a set depth.
  // Depth pertains only to depth of references not actually object levels
  async resolveReferences(obj: any, currentDepth: number = 0): Promise<any> {
    // Resolve each object key
    let newObj: any = {...obj}

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
  async lookupReference(reference: Reference, currentDepth: number = 0): Promise<any> {
    // Lookup References
    const referencedEntry = await this.fetchEntryById(reference._ref)

    if (
      referencedEntry &&
      currentDepth < this.maxDepth
    ) {
      const newDepth = currentDepth + 1
      return this.resolveReferences(referencedEntry, newDepth)
    } else {
      throw new Error(
        `Unable to dereference Sanity entry with _id ${reference._ref}`
      )
    }
  }
  async fetchEntryById(id: string): Promise<Entry> {
    const query = `*[_id == "${id}"]`
    const result = await this.sanityClient.fetch(query)

    return result && result[0]
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
