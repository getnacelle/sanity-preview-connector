import mapSanityEntry from '../src/utils/mapSanityEntry'
import mockArticle from '../__mocks__/mockArticle'
import mockBlog from '../__mocks__/mockBlog'

describe('mapSanityEntry', () => {
  it('creates an object of type Content', () => {
    const item = mapSanityEntry(mockArticle)

    expect(item.cmsSyncSourceContentId).toBe(
      'drafts.2aa6f3c2-04f3-4d3c-96c9-e6d6ddabe0a7'
    )
    expect(item.title).toBe('Fluctuations in energy readings')
    expect(item.handle).toBe('fluctuations-in-energy-readings')
    expect(item.cmsSyncSource).toBe('sanity')
    expect(item.type).toBe('article')
    expect(item.featuredMedia).toStrictEqual({
      id: 'image-ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700-jpg',
      type: 'image/jpeg',
      src:
        'https://cdn.sanity.io/images/ciu31kkt/production/ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700.jpg',
      thumbnailSrc:
        'https://cdn.sanity.io/images/ciu31kkt/production/ca4484084823a781e6436bb5b7ab6c8164ab197c-1200x700.jpg',
      altText: 'Some visually-descriptive text'
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
