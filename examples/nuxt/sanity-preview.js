import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'

export default ({ app }) => {
  if (process.env.NACELLE_PREVIEW_MODE) {
    // Checks .env file for proper config variables
    if (!process.env.NACELLE_CMS_PREVIEW_TOKEN) {
      throw new Error(
        "Couldn't get data from your CMS. Make sure to include NACELLE_CMS_PREVIEW_TOKEN in your .env file"
      )
    }
    if (!process.env.NACELLE_CMS_PREVIEW_SPACE_ID) {
      throw new Error(
        "Couldn't get data from your CMS. Make sure to include NACELLE_CMS_PREVIEW_SPACE_ID in your .env file"
      )
    }

    // Initialize the Sanity Preview Connector
    const sanityConnector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        token: process.env.NACELLE_CMS_PREVIEW_TOKEN,
        dataset: process.env.NACELLE_CMS_PREVIEW_DATASET,
        projectId: process.env.NACELLE_CMS_PREVIEW_SPACE_ID
      }
    })

    // Update the Nacelle JS SDK Data module to use preview connector
    app.$nacelle.data.update({
      connector: sanityConnector
    })
  }
}
