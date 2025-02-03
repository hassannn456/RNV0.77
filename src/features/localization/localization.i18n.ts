import { BackendModule } from 'i18next'
import { fileExists, readFromFile } from './localization.write'
import { loadLocalesFromS3 } from './localization.api'
import { getCurrentEnvironmentConfig } from './environment'
import { trackError } from '../../components/useTracking'

/**
 * Gets country from market ID.
 *
 * Most modules should use the current vehicle's country code.
 * This function allows regional functionality prior to login.
 */
export const getAppRegion: () => string = () => {
  const defaultAppRegion = 'US'
  const config = getCurrentEnvironmentConfig()
  const marketId = config?.marketId
  if (!marketId) {
    trackError('localization.i18n.ts::getAppRegion')(
      'MarketId not found in environment. Using fallback.',
    )
    return defaultAppRegion
  }
  switch (marketId) {
    case 1:
      return 'US'
    case 2:
      return 'CA'
    default: {
      trackError('localization.i18n.ts::getAppRegion')(
        `Region folder not found for marketId ${marketId}. Using fallback.`,
      )
      return defaultAppRegion
    }
  }
}

/**
 * i18next backend to download language content from an S3 bucket.
 */
export const MgaS3Backend: BackendModule = {
  type: 'backend',
  init: function (): void {
    setImmediate(async () => {
      await loadLocalesFromS3()
    })
  },
  read: function (language, namespace, callback): void {
    setImmediate(async () => {
      const localeFile = `locales/${language}/${namespace}.json`
      if (await fileExists(localeFile)) {
        const data = await readFromFile(localeFile)
        const content = JSON.parse(data) as object
        callback(null, content)
        return
      }
      const regionFile = `regions/${getAppRegion()}/${namespace}.json`
      if (await fileExists(regionFile)) {
        const data = await readFromFile(regionFile)
        const content = JSON.parse(data) as object
        callback(null, content)
        return
      }
      // TODO:UA:20230707: Route error to redux
      callback(null, {})
    })
  },
}
