import NacelleSanityPreviewConnector from '../src/connector/NacelleSanityPreviewConnector'
import mockHeroBanner from '../__mocks__/mockHeroBanner'
import mockBlog from '../__mocks__/mockBlog'
import mapSanityEntry from '../src/utils/mapSanityEntry'

import dotenv from 'dotenv'
dotenv.config()

const credentials = {
  dataset: process.env.SANITY_DATASET || '',
  projectId: process.env.SANITY_PROJECT_ID || '',
  token: process.env.SANITY_TOKEN || ''
}

const mockClient = { fetch: jest.fn() }

describe('NacelleSanityPreviewConnector', () => {
  beforeEach(() => {
    mockClient.fetch.mockClear()
  })

  it('initializes the connector with the correct properties', () => {
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId,
        token: credentials.token
      }
    })

    expect(connector.locale).toBe('en-us')
    expect(connector.basePath).toBe('/')
    expect(connector.sanityConfig.dataset).toBe(process.env.SANITY_DATASET)
    expect(connector.sanityConfig.projectId).toBe(process.env.SANITY_PROJECT_ID)
    expect(connector.sanityConfig.token).toBe(process.env.SANITY_TOKEN)
  })

  it('content calls sanity client fetch', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.content({
      handle: 'the-future-of-furniture',
      type: 'heroBanner'
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`_type == "heroBanner"`)
    expect(call).toContain(`handle.current == "the-future-of-furniture"`)
  })

  it('content returns Nacelle Content item', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    const item = await connector.content({
      handle: 'the-future-of-furniture',
      type: 'heroBanner'
    })

    expect(item.handle).toBe('the-future-of-furniture')
    expect(item.type).toBe('heroBanner')
    expect(item.featuredMedia).toStrictEqual({
      id: 'image-57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675-jpg',
      src:
        'https://cdn.sanity.io/images/ciu31kkt/production/57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675.jpg',
      thumbnailSrc:
        'https://cdn.sanity.io/images/ciu31kkt/production/57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675.jpg',
      altText: 'Some visually-descriptive text',
      type: 'image/jpeg'
    })
  })

  it('allContent calls sanity client getEntries', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.allContent()

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
  })

  it('page calls sanity client with correct options', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.page({
      handle: 'test-page'
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`_type == "page"`)
    expect(call).toContain(`handle.current == "test-page"`)
  })

  it('article calls sanity client with correct options', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.article({
      handle: 'test-article'
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`_type == "article"`)
    expect(call).toContain(`blogHandle == "blog"`)
    expect(call).toContain(`handle.current == "test-article"`)
  })

  it('blog calls sanity client with correct options', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.blog({
      handle: 'test-blog'
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`_type == "blog"`)
    expect(call).toContain(`handle.current == "test-blog"`)
  })

  it('blogPage calls articles method and sanity client with correct options', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.blogPage({
      blog: mapSanityEntry(mockBlog),
      list: 'default'
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`blogHandle == "the-future-of-furniture"`)
    expect(call).toContain(
      `handle.current in ['fluctuations-in-energy-readings']`
    )
  })

  it('pages calls sanity client with correct options', async () => {
    mockClient.fetch.mockResolvedValue([mockHeroBanner])
    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    await connector.pages({
      handles: ['test', 'test-2']
    })

    const call = mockClient.fetch.mock.calls[0][0]

    expect(mockClient.fetch).toHaveBeenCalledTimes(1)
    expect(call).toContain(`_type == "page"`)
    expect(call).toContain(`handle.current in ['test','test-2']`)
  })

  it('pages filters out errors', async () => {
    mockClient.fetch
      .mockResolvedValueOnce([mockHeroBanner])
      .mockResolvedValueOnce(undefined)

    const connector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        dataset: credentials.dataset,
        projectId: credentials.projectId
      },
      client: mockClient
    })

    const results = await connector.pages({
      handles: ['test', 'test-2']
    })

    expect(results.length).toBe(1)
  })
})
