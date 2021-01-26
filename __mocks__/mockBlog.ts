import mockArticle from './mockArticle'

export default {
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'q3p82tpg7dld'
      }
    },
    type: 'Entry',
    id: '5cULf1o9TdEQIquxx22P1a',
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'blog'
      }
    },
    revision: 2,
    createdAt: '2020-01-28T00:43:49.958Z',
    updatedAt: '2020-02-05T21:33:00.603Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    locale: 'en-US'
  },
  fields: {
    title: 'News',
    handle: 'news',
    articles: [mockArticle]
  }
}
