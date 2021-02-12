import { createMedia } from '@nacelle/client-js-sdk'
import FeaturedMedia from '../interfaces/FeaturedMedia'

export default function resolveMedia(featuredMedia: FeaturedMedia | undefined) {
  if (!featuredMedia) {
    return null
  }

  const media = featuredMedia.asset || featuredMedia

  const mappedMedia = createMedia({
    id: media._id,
    type: media.mimeType,
    src: media.url,
    thumbnailSrc: media.url,
    altText: featuredMedia.altText
  })

  const mergedMedia = { ...featuredMedia, ...mappedMedia }

  delete mergedMedia.asset
  delete mergedMedia._type

  return mergedMedia
}
