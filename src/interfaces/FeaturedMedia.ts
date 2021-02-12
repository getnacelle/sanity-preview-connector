export default interface FeaturedMedia {
  _type: string
  _id?: string
  _createdAt?: string
  _ref?: string
  _updatedAt?: string
  extension?: string
  mimeType?: string
  url?: string
  altText?: string

  asset?: FeaturedMedia
}
