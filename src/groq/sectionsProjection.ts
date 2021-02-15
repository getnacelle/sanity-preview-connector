import MediaProjection from './MediaProjection'

export default (mediaProjection: string): string => {
  return `
    sections[]->{
      ...,
      ${mediaProjection || MediaProjection}
    }
  `
}
