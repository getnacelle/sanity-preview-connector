# Nacelle Sanity Preview Connector

This package is a connector for extending the [`@nacelle/client-js-sdk`](https://www.npmjs.com/package/@nacelle/client-js-sdk) in order to allow live previewing content updates from Sanity.

The Client JS SDK uses connectors in the [`data` module](https://docs.getnacelle.com/api-reference/client-js-sdk.html#data-module) for fetching Nacelle data. By default the SDK is either fetching data from Nacelle's GraphQL or from static JSON files generated during the Nuxt build process.

With this package we can update the `data` module so that by default it will fetch data directly from [Sanity's API](https://www.sanity.io/docs/api-cdn) using the [Sanity Javascript client](https://www.sanity.io/docs/js-client). That way you can view edits and changes on Sanity without needing to re-index those updates with Nacelle.

## Usage

```js
import NacelleClient from '@nacelle/client-js-sdk'
import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'

// Initialize the Nacelle Client
const client = new NacelleClient(clientOptions)

// Initialize the Sanity Preview Connector
const sanityConnector = new NacelleSanityPreviewConnector({
  sanityConfig: {
    token: process.env.NACELLE_CMS_PREVIEW_TOKEN,
    dataset: process.env.NACELLE_CMS_PREVIEW_DATASET,
    projectId: process.env.NACELLE_CMS_PREVIEW_SPACE_ID
  }
})

// Update the data module with the new connector
client.data.update({
  connector: previewConnector
})

// Homepage data will be fetched directly from preview API
const pageData = await client.data.page({ handle: 'homepage' })
```

## Examples

See our examples for setting up this package with our different frontend app frameworks:

### Nuxt

Setting up your [Nacelle Starter Project](https://docs.getnacelle.com/nuxt/intro-nuxt.html) to enable Sanity previews is a straightforward process using [Nuxt plugins](https://nuxtjs.org/guide/plugins).

#### 1. Add `sanity-previews.js` into your Nuxt project

Create a file `sanity-previews.js` in your Nuxt's `/plugins` directory and paste the following code.

```js
import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'

export default ({ app }) => {
  if (process.env.NACELLE_PREVIEW_MODE === 'true') {
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
```

#### 2. Update `nuxt.config.js`

Update your `nuxt.config.js` file to include the new plugin file you created.

```js
plugins: [
    '~/plugins/sanity-preview'
  ],
```

And update the `env` object in the config.

```js
env: {
  nacelleSpaceID: process.env.NACELLE_SPACE_ID,
  nacelleToken: process.env.NACELLE_GRAPHQL_TOKEN,
  buildMode: process.env.BUILD_MODE,
  NACELLE_PREVIEW_MODE: process.env.NACELLE_PREVIEW_MODE,
  NACELLE_CMS_PREVIEW_TOKEN: process.env.NACELLE_CMS_PREVIEW_TOKEN,
  NACELLE_CMS_PREVIEW_SPACE_ID: process.env.NACELLE_CMS_PREVIEW_SPACE_ID,
  NACELLE_CMS_PREVIEW_DATASET: process.env.NACELLE_CMS_PREVIEW_DATASET
},
```

#### 3. Update `.env`

Update your Nuxt app's `.env` file to include variables for initializing the Sanity preview connector.

```bash
NACELLE_PREVIEW_MODE=true
NACELLE_CMS_PREVIEW_TOKEN="SANITY_TOKEN"
NACELLE_CMS_PREVIEW_SPACE_ID="SANITY_SPACE_ID"
NACELLE_CMS_PREVIEW_DATASET="SANITY_DATASET"
```

You're all set! Running `npm run dev` your Nacelle Nuxt app will now fetch data directly from Sanity. Try updating a piece of content and refreshing the page without publishing.
