export default interface ArbitraryObject {
  [key: string]:
    | ArbitraryObject
    | ArbitraryObject[]
    | string
    | string[]
    | unknown
}
