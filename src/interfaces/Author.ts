import ArbitraryObject from './ArbitraryObject'
import FeaturedMedia from './FeaturedMedia'
import Slug from './Slug'

export default interface Entry extends ArbitraryObject {
  handle?: Slug | string
  firstName?: string
  lastName?: string
  bio?: string | ArbitraryObject
  email?: string
  featuredMedia?: FeaturedMedia
}
