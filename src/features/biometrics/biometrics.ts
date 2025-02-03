import i18n, { PostProcessorModule } from 'i18next'
import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { store } from '../../store'
import DeviceInfo from 'react-native-device-info'
import { promptAlert } from '../../components'
import { Linking } from 'react-native'

interface SimplePromptOptions {
  promptMessage: string
  fallbackPromptMessage?: string
  cancelButtonText?: string
}

interface SimplePromptResult {
  success: boolean
  error?: string
}

/** Async wrapper for biometrics call */
export const promptBiometrics = (
  simplePromptOptions: SimplePromptOptions,
): Promise<SimplePromptResult> => {
  // Cancel is reported in .then(), failure is reported in .catch()
  return new Promise<SimplePromptResult>((resolve, _) => {
    new ReactNativeBiometrics()
      .simplePrompt(simplePromptOptions)
      .then(response => {
        resolve(response)
      })
      .catch((error?: { code?: string }) => {
        resolve({ success: false, error: error?.code ?? 'BIOMETRICS_FAILED' })
      })
  })
}

/**
 * Infer type of biometric sensor from device model.
 *
 * This is called because when a user refuses to grant sensor access,
 * the device reports no sensor at all.
 **/
export const inferBiometryTypeByDeviceID = (): BiometryType | undefined => {
  const deviceId = DeviceInfo.getDeviceId()
  const iPhoneMatch = /iPhone(\d+),(\d+)/.exec(deviceId)
  if (iPhoneMatch) {
    const major = parseInt(iPhoneMatch[1])
    const minor = parseInt(iPhoneMatch[2])
    // Source: https://everymac.com/systems/apple/iphone/index-iphone-specs.html
    if (major <= 5) {
      // Pre-biometric iPhones
      return undefined
    } else if (major >= 6 && major <= 9) {
      // iPhone 5S, 6, 6+, 6S, 7, 7+
      return 'TouchID'
    } else if (
      major == 10 &&
      (minor == 1 || minor == 2 || minor == 4 || minor == 5)
    ) {
      // iPhone 8, 8+
      return 'TouchID'
    } else if (major == 10 && (minor == 3 || minor == 6)) {
      // iPhone X
      return 'FaceID'
    } else if (major == 12 && minor == 8) {
      // iPhone SE, 2nd gen
      return 'TouchID'
    } else if (major == 14 && minor == 6) {
      // iPhone SE, 3nd gen
      return 'TouchID'
    } else if (major >= 11) {
      // iPhone 11 or greater
      // In the case of a future TouchID SE release,
      // This code will report FaceID until it is updated
      return 'FaceID'
    } else {
      // NOTE: Logic is intended to be exhaustive.
      // This path should never be reached.
      console.warn(`Unhandled iPhone Device ID :: ${deviceId}`)
      return undefined
    }
  } else {
    // Match failed (iPad, Android)
    // It is more likely than not a user has a sensor
    // Attempting to use a non-existent sensor returns
    // the same error as a sensor whose access is denied
    return 'Biometrics'
  }
}

/** Plugin to inject type of biometrics (TouchID, FaceID, Android) into translated string.
 *
 * If device does not support biometrics,
 * {{biometricsType}} will not be replaced in translated string.
 * UI code should hide these items with the `dev:bio` flag.
 */
export const i18nBiometricsType: PostProcessorModule = {
  type: 'postProcessor',
  name: 'i18nBiometricsType',
  process: function (value) {
    const template = '{{biometricsType}}'
    if (typeof value == 'string' && value.includes(template)) {
      const { t } = i18n
      const biometryType = store.getState().biometrics?.biometryType
      // Using a switch here because Typescript cannot safely type cast
      // `'biometrics:${biometryType}'` into a translated string.
      switch (biometryType) {
        case 'Biometrics':
          return value.replaceAll(template, t('biometrics:Biometrics'))
        case 'FaceID':
          return value.replaceAll(template, t('biometrics:FaceID'))
        case 'TouchID':
          return value.replaceAll(template, t('biometrics:TouchID'))
      }
    }
    return value
  },
}

export async function enableBiometrics(): Promise<void> {
  const { t } = i18n
  const title = t('login:enableBiometrics')
  const message = t('biometrics:enableBiometricsFromSettings')
  const yes = t('biometrics:_settingsTitle')
  const no = t('common:notNow')
  const response = await promptAlert(title, message, [
    { title: yes, type: 'primary' },
    { title: no, type: 'secondary' },
  ])

  if (response == yes) {
    await Linking.openSettings()
  }
}

export async function biometricsSetupFailedAlert(): Promise<void> {
  const { t } = i18n
  const title = t('biometrics:biometricsError')
  const message = t('biometrics:unableToSetupBiometrics')
  const yes = t('common:ok')
  await promptAlert(title, message, [{ title: yes, type: 'primary' }])
}
