import {
  RemoteServiceCommunicationsGen2,
  UpdateNotificationPreferenceGen2,
} from '../features/starlinkcommunications/starlinkcommunications.api'

export const setNotificationPreferenceGen2Response = (
  draft: RemoteServiceCommunicationsGen2,
  parameters: UpdateNotificationPreferenceGen2,
): RemoteServiceCommunicationsGen2 => {
  const notificationPreferences = parameters.notificationPreferences.map(pref =>
    pref.toLowerCase(),
  )
  let prefName
  draft.data?.preferences?.forEach(preference => {
    prefName = preference.preferenceName
      .toString()
      .replace(/\s/g, '')
      .toLowerCase()

    notificationPreferences?.indexOf(prefName + '_text') != -1
      ? (preference.notifyTextFlag = 'Y')
      : (preference.notifyTextFlag = 'N')

    notificationPreferences?.indexOf(prefName + '_push') != -1
      ? (preference.notifyPushFlag = 'Y')
      : (preference.notifyPushFlag = 'N')

    notificationPreferences?.indexOf(prefName + '_email') != -1
      ? (preference.notifyEmailFlag = 'Y')
      : (preference.notifyEmailFlag = 'N')
  })
  return draft
}
