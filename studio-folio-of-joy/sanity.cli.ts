import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ky6s08oc',
    dataset: 'production'
  },
  studioHost: 'folioofjoy',
  deployment: {
    appId: 'ivo990q2hgbr4bct7ouxa0wq',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
