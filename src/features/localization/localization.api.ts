import { getCurrentEnvironmentConfig, getLanguages } from './environment'
import { getAppRegion } from './localization.i18n'
import { readFromFile, writeToFile } from './localization.write'
import { ScreenList } from '../../Controller'
import { trackError } from '../../components/useTracking'
import i18n from '../../i18n'
import { store } from '../../store'
import { NormalResult } from '../../../@types'

interface LocaleContainer {
  name: string
  path: string
  hash?: string
}

const HASH_FILE_NAME = '_hash.json'

/**
 * S3 bucket has two styles of listing (not sure why):
 *
 * File (complete) :{"name":"locales.en.index","path":"locales/en/index.json","hash":"..."}
 * Folder (_hash.json implied): {"name":"locales","path":"locales","hash":"..."}
 *
 * This function adds _hash.json to paths that should have it.
 */
const fixS3Path: (path: string) => string = path => {
  return path.endsWith('.json') ? path : `${path}/${HASH_FILE_NAME}`
}

/** Get URL for S3 bucket */
export const getS3BucketUrl: () => string = () => {
  const config = getCurrentEnvironmentConfig()
  return config?.s3BucketUrl ?? ''
}

/**
 * Read content from local storage
 *
 * Errors are thrown to calling function.
 **/
const fetchLocalVersion: (
  path: string,
) => Promise<object | LocaleContainer[] | undefined> = async path => {
  const localData = await readFromFile(path)
  if (!localData) {
    return undefined
  }
  const localVersion = (await JSON.parse(localData)) as
    | object
    | LocaleContainer[]
  return localVersion
}

/**
 * Download content from S3.
 *
 * Network / parsing errors are thrown to calling function.
 **/
const fetchRemoteVersion: (
  path: string,
) => Promise<LocaleContainer[] | object | undefined> = async path => {
  let result: LocaleContainer[] | object | undefined = undefined
  const url = `${getS3BucketUrl()}/${path}?_=${new Date().getTime()}`
  const response = await fetch(url)
  const text = await response.text()
  result = JSON.parse(text) as LocaleContainer[] | object
  return result
}

/**
 * Content downloader
 *
 * - Download content file from S3.
 * - Check against local version.
 * - If mismatch, kick off any dependent updates.
 * - After mismatch is resolved, save file.
 *
 * @param path
 * @param fileName
 */
const evaluateLocales: (path: string) => Promise<void> = async path => {
  const localVersion = await fetchLocalVersion(path)
  const remoteVersion = await fetchRemoteVersion(path)

  if (localVersion !== remoteVersion) {
    // Remote is collection, check each item
    if (Array.isArray(remoteVersion)) {
      const children: Promise<void>[] = []
      const pathCompare = (aObj: LocaleContainer, bObj: LocaleContainer) => {
        const a = aObj.path?.toLowerCase()
        const b = bObj.path?.toLowerCase()
        return a < b ? -1 : a > b ? 1 : 0
      }
      // Sort for comparison
      const localVersionSorted = Array.isArray(localVersion)
        ? (localVersion.sort(pathCompare) as LocaleContainer[])
        : []
      const remoteVersionSorted: LocaleContainer[] = remoteVersion.sort(
        pathCompare,
      ) as LocaleContainer[]
      let localPtr = 0
      let remotePtr = 0
      while (remotePtr < remoteVersionSorted.length) {
        const localObject = localVersionSorted[localPtr]
        const remoteObject = remoteVersionSorted[remotePtr]
        if (
          localObject &&
          localObject.path === remoteObject.path &&
          localObject.hash === remoteObject.hash
        ) {
          // No action, values match
          localPtr += 1
          remotePtr += 1
        } else if (
          !localObject ||
          (localObject.path === remoteObject.path &&
            localObject.hash !== remoteObject.hash) ||
          pathCompare(localObject, remoteObject) == 1
        ) {
          // New value found, eval to trigger download
          children.push(evaluateLocales(fixS3Path(remoteObject.path)))
          localPtr += 1
          remotePtr += 1
        } else {
          // if (pathCompare(localObject, remoteObject) == -1)
          // File on local no longer present on remote
          // Delete is probably safe here, but not necessary
          localPtr += 1
        }
      }
      await Promise.all(children)
    }
    await writeToFile(path, JSON.stringify(remoteVersion), true)
  }
}

/** Read local storage and route data to i18n */
const readLocaleFromDisk: (path: string) => Promise<void> = async path => {
  const localVersion = await fetchLocalVersion(path)
  if (Array.isArray(localVersion)) {
    const promises = (localVersion as LocaleContainer[]).map(container =>
      readLocaleFromDisk(fixS3Path(container.path)),
    )
    await Promise.all(promises)
  } else {
    const parts = path.replace('.json', '').split('/')
    if (parts.length != 3) {
      return
    }
    const [type, lng, ns] = parts
    if (type == 'locales') {
      i18n.addResourceBundle(lng, ns, localVersion)
    } else if (type == 'regions') {
      if (lng == getAppRegion()) {
        getLanguages().forEach(lng => {
          i18n.addResourceBundle(lng, ns, localVersion)
        })
      }
    } else {
      trackError('localization.api.ts::readLocaleFromDisk')(
        `S3 Type not handled :: ${type}`,
      )
    }
  }
}

/**
 * Entry point for content downloader
 *
 * Returns false if S3 download fails or
 * if there is an error loading from disk.
 *
 * In cases where some S3 content is fetched,
 * this will return false. Check namespaces to see
 * if you have enough to proceed anyway.
 **/
export const loadLocalesFromS3: () => Promise<
  NormalResult<null>
> = async () => {
  let errorCode: string | null = null
  store.dispatch({
    type: 'localization/started',
  })
  // Download from S3
  try {
    await evaluateLocales(HASH_FILE_NAME)
  } catch (error) {
    trackError('localization.api.ts::evaluateLocales')(error)
    errorCode = 'I18N_S3_FAILED'
  }
  // Read downloaded copy from disk
  try {
    await readLocaleFromDisk(HASH_FILE_NAME)
  } catch (error) {
    trackError('localization.api.ts::readLocaleFromDisk')(error)
    errorCode = 'I18N_DISK_FAILED'
  }
  if (errorCode && !hasLoadedNamespaceForScreen('Login')) {
    store.dispatch({
      type: 'localization/error',
    })
  } else {
    store.dispatch({
      type: 'localization/complete',
    })
  }
  return { success: !errorCode, errorCode, dataName: null, data: null }
}

const namespacesForScreen = (screen: keyof ScreenList): string[] => {
  switch (screen) {
    case 'Dashboard':
      return [
        'common',
        'contact',
        'home',
        'resPresets',
        'tripLog',
        'tripSearch',
        'urls',
      ]
    case 'Login':
      return ['common', 'login', 'validation']
    default:
      trackError('hasLoadedNamespaceForScreen')(
        `Namespace list for ${screen} not found!`,
      )
      return []
  }
}

// TODO:TL:20241009: Connect to account.api.ts after login changes complete
export const hasLoadedNamespaceForScreen = (
  screen: keyof ScreenList,
): boolean => {
  return namespacesForScreen(screen).every(ns => i18n.hasLoadedNamespace(ns))
}
