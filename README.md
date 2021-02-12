# Nacelle Sanity Preview Connector

This package is a connector for extending the [`@nacelle/client-js-sdk`](https://www.npmjs.com/package/@nacelle/client-js-sdk) in order to allow live previewing content updates from Sanity.

The Client JS SDK uses connectors in the [`data` module](https://docs.getnacelle.com/api-reference/client-js-sdk.html#data-module) for fetching Nacelle data. By default the SDK is either fetching data from Nacelle's GraphQL or from static JSON files generated during the Nacelle Nuxt Starter's build process.

With this package we can update the `data` module so that by default it will fetch data directly from [Sanity's API](https://www.sanity.io/docs/api-cdn) using the [Sanity JavaScript client](https://www.sanity.io/docs/js-client). That way you can view edits and changes on Sanity without needing to re-index those updates with Nacelle.

## Usage

```js
import NacelleClient from '@nacelle/client-js-sdk'
import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'

// Initialize the Nacelle Client
const client = new NacelleClient(clientOptions)

// Initialize the Sanity Preview Connector
const sanityConnector = new NacelleSanityPreviewConnector({
  sanityConfig: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN
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
// ~/plugins/sanity-preview.js
import NacelleSanityPreviewConnector from '@nacelle/sanity-preview-connector'

export default ({ app }) => {
  const {
    NACELLE_PREVIEW_MODE,
    SANITY_PROJECT_ID,
    SANITY_DATASET,
    SANITY_TOKEN
  } = process.env

  if (NACELLE_PREVIEW_MODE === 'true') {
    // Checks .env file for proper config variables
    if (!SANITY_PROJECT_ID) {
      throw new Error(
        "Couldn't get data from your CMS. Make sure to include SANITY_PROJECT_ID in your .env file"
      )
    }
    if (!SANITY_DATASET) {
      throw new Error(
        "Couldn't get data from your CMS. Make sure to include SANITY_DATASET in your .env file"
      )
    }
    if (!SANITY_TOKEN) {
      throw new Error(
        "Couldn't get data from your CMS. Make sure to include SANITY_TOKEN in your .env file"
      )
    }

    // Initialize the Sanity Preview Connector
    const sanityConnector = new NacelleSanityPreviewConnector({
      sanityConfig: {
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        token: SANITY_TOKEN
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
  // ...other plugins,
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
  SANITY_TOKEN: process.env.SANITY_TOKEN,
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
  SANITY_DATASET: process.env.SANITY_DATASET
},
```

#### 3. Update `.env`

Update your Nuxt app's `.env` file to include variables for initializing the Sanity preview connector.

```bash
NACELLE_PREVIEW_MODE=true
SANITY_TOKEN=your-sanity-token
SANITY_PROJECT_ID=your-sanity-project-id
SANITY_DATASET=your-sanity-dataset
```

You're all set! Running `npm run dev` your Nacelle Nuxt app will now fetch data directly from Sanity. Try updating a piece of content and refreshing the page without publishing.
