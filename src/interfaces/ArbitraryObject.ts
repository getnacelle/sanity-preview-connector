export default interface ArbitraryObject {
  _ref?: string
  _type?: string
  [key: string]:
    | ArbitraryObject
    | ArbitraryObject[]
    | string
    | string[]
    | unknown
}
