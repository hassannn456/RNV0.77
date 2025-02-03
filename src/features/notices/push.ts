import { useEffect } from 'react'
import { PermissionsAndroid, Platform } from 'react-native'
import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
} from 'react-native-notifications'
import { trackError } from '../../components/useTracking'

/** Dispatch function for notifications. */
const onNotification = (
  _notification: Notification,
  _type: 'background' | 'foreground' | 'initial',
) => {
  // TODO:AG:20240319: Add action logic if we want to do anything with the notification
}

/** React hook to connect notifications to application. */
export const useNotifications = (): void => {
  useEffect(() => {
    Notifications.getInitialNotification()
      .then((initial: Notification | undefined) => {
        if (initial) {
          onNotification(initial, 'initial')
        }
      })
      .catch(trackError('push.ts'))
    Notifications.events().registerNotificationReceivedBackground(
      (notification: Notification) => {
        onNotification(notification, 'background')
      },
    )
    Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification) => {
        onNotification(notification, 'foreground')
      },
    )
  })
}

/** Token for push notifications. Triggers a permissions dialog on first call. */
export const getPushToken = async (): Promise<string> => {
  return new Promise((resolve, _) => {
    Notifications.registerRemoteNotifications()
    // See: https://github.com/wix/react-native-notifications/issues/937
    if (Platform.OS == 'android') {
      void PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS')
    }
    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        resolve(event.deviceToken)
      },
    )
    Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
      resolve('')
    })
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (_error: RegistrationError) => {
        resolve('')
      },
    )
  })
}
