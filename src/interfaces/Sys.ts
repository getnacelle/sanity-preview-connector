export default interface Sys {
  space: {
    sys: {
      type: string
      linkType: string
      id: string
    }
  }
  id: string
  type: string
  createdAt: string
  updatedAt: string
  environment: {
    sys: {
      id: string
      type: string
      linkType: string
    }
  }
  revision: number
  contentType: {
    sys: {
      type: string
      linkType: string
      id: string
    }
  }
  locale: string
}
