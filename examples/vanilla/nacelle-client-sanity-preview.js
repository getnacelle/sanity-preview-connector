import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'
import NacelleClient from '@nacelle/client-js-sdk'

// add $nacelle to window so we can use it in main.js
const settings = {
  id: import.meta.env.VITE_NACELLE_SPACE_ID,
  token: import.meta.env.VITE_NACELLE_SPACE_TOKEN,
  locale: 'en-US',
  nacelleEndpoint: 'https://hailfrequency.com/v3/graphql',
  useStatic: false
}

if (typeof window !== 'undefined') {
  window.process = null
}

const $nacelle = new NacelleClient(settings)
if (import.meta.env.VITE_NACELLE_PREVIEW_MODE) {
  // Checks .env file for proper config variables
  if (!import.meta.env.VITE_NACELLE_CMS_PREVIEW_PROJECT_ID) {
    throw new Error(
      "Couldn't get data from your CMS. Make sure to include VITE_NACELLE_CMS_PREVIEW_PROJECT_ID in your .env file"
    )
  }
  if (!import.meta.env.VITE_NACELLE_CMS_PREVIEW_DATASET) {
    throw new Error(
      "Couldn't get data from your CMS. Make sure to include VITE_NACELLE_CMS_PREVIEW_DATASET in your .env file"
    )
  }
  if (!import.meta.env.VITE_NACELLE_CMS_PREVIEW_TOKEN) {
    throw new Error(
      "Couldn't get data from your CMS. Make sure to include VITE_NACELLE_CMS_PREVIEW_TOKEN in your .env file"
    )
  }

  // Initialize the Sanity Preview Connector
  const sanityConnector = new NacelleSanityPreviewConnector({
    sanityConfig: {
      dataset: import.meta.env.VITE_NACELLE_CMS_PREVIEW_DATASET,
      projectId: import.meta.env.VITE_NACELLE_CMS_PREVIEW_PROJECT_ID,
      token: import.meta.env.VITE_NACELLE_CMS_PREVIEW_TOKEN
    }
  })

  // Update the Nacelle JS SDK Data module to use preview connector
  $nacelle.data.update({
    connector: sanityConnector
  })
}

export { $nacelle }
