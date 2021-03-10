import mapSanityEntry from '../src/utils/mapSanityEntry'
import mockArticle from '../__mocks__/mockArticle'
import mockBlog from '../__mocks__/mockBlog'
import mockHeroBanner from '../__mocks__/mockHeroBanner'

describe('mapSanityEntry', () => {
  it('creates an object of type heroBanner', () => {
    const item = mapSanityEntry(mockHeroBanner)

    expect(item.cmsSyncSourceContentId).toBe(
      'drafts.445cf20e-82d9-43ee-876d-c0563629ccc6'
    )
    expect(item.title).toBe('The future of furniture')
    expect(item.handle).toBe('the-future-of-furniture')
    expect(item.cmsSyncSource).toBe('sanity')
    expect(item.type).toBe('heroBanner')
    expect(item.featuredMedia).toStrictEqual({
      id: 'image-57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675-jpg',
      type: 'image/jpeg',
      src:
        'https://cdn.sanity.io/images/ciu31kkt/production/57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675.jpg',
      thumbnailSrc:
        'https://cdn.sanity.io/images/ciu31kkt/production/57db6970e0fe735f6ef2d45d1367a92f1afed9a9-1200x675.jpg',
      altText: 'Some visually-descriptive text'
    })
  })

  it('creates an object of type article that has featuredMedia with altText empty string', () => {
    const item = mapSanityEntry(mockArticle)

    expect(item.type).toBe('article')
    expect(item.featuredMedia).toStrictEqual({
      id: 'image-ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700-jpg',
      type: 'image/jpeg',
      src:
        'https://cdn.sanity.io/images/ciu31kkt/production/ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700.jpg',
      thumbnailSrc:
        'https://cdn.sanity.io/images/ciu31kkt/production/ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700.jpg',
      altText: ''
    })
  })

  it('turns blog articles into articleList', () => {
    const item = mapSanityEntry(mockBlog)

    expect(item.articleLists).toStrictEqual([
      {
        title: 'default',
        slug: 'default',
        locale: 'en-US',
        handles: ['fluctuations-in-energy-readings']
      }
    ])
  })
})
