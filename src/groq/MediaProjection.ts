export default `
  featuredMedia->{
    ...featuredMedia,
    asset->{
      _id,
      _createdAt,
      _updatedAt,
      _type,
      extension,
      mimeType,
      url
    }
  }
`
