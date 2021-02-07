export default interface FeaturedMedia {
  _id: string
  _createdAt: string
  _updatedAt: string
  _type: string
  extension: string
  mimeType: string
  url: string

  asset?: FeaturedMedia
}
