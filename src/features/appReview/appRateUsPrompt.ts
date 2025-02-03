import { Platform } from 'react-native'
import { promptAlert } from '../../components'
import { requestReview } from 'react-native-store-review'
import i18n from '../../i18n'

const SUCCESSFUL_REMOTE_THRESHOLD = 15
const SUCCESSFUL_LOCK_COMMAND_THRESHOLD = 6
const SUCCESSFUL_SERVICE_APPOINTMENT_THRESHOLD = 1

export interface RateUsPrompt {
  interactionTrigger: {
    lockCommandCount: number
    remoteRccResCount: number
    serviceAppointmentCount: number
  }
  promptDate: {
    alertCount: number
    currentYear: number
    foreseeSurvey: Date | string
    nextAlertDate: Date
  }
  showAppReviewPrompt: boolean
}

export const setInteractionTrigger = async (
  appReviewData: string | undefined,
  trigger: string,
): Promise<string> => {
  let inAppReview = {
    interactionTrigger: {
      remoteRccResCount: 0,
      lockCommandCount: 0,
      serviceAppointmentCount: 0,
    },
    promptDate: {
      alertCount: 0,
      currentYear: new Date().getFullYear(),
      nextAlertDate: new Date(),
      foreseeSurvey: '',
    },
    showAppReviewPrompt: false,
  } as RateUsPrompt

  if (appReviewData) {
    inAppReview = JSON.parse(appReviewData) as RateUsPrompt
  }

  const { interactionTrigger, promptDate, showAppReviewPrompt } = inAppReview

  // TODO:AK:202406011: Add rate us flag check below
  if (promptDate?.currentYear < new Date().getFullYear()) {
    return JSON.stringify(inAppReview)
  }

  const triggerIndex = trigger as keyof typeof interactionTrigger
  interactionTrigger[triggerIndex] = interactionTrigger[triggerIndex] + 1

  const result = await showInAppReview({
    interactionTrigger,
    promptDate,
    showAppReviewPrompt,
  })

  return JSON.stringify(result)
}

// TODO:RS:20240715: Foresee Conditional check
// TODO:RS:20240715: Adobe tagging

export const showInAppReview = async (
  rateUsData: RateUsPrompt,
): Promise<RateUsPrompt> => {
  const { t } = i18n
  const { interactionTrigger, promptDate, showAppReviewPrompt } = rateUsData
  let lockCommandCount = interactionTrigger.lockCommandCount
  let nextAlertDate = promptDate.nextAlertDate
  let remoteRccResCount = interactionTrigger.remoteRccResCount
  let serviceAppointmentCount = interactionTrigger.serviceAppointmentCount
  let shouldDisplayAppReview = showAppReviewPrompt
  let totalPromptCount = promptDate.alertCount
  if (
    (Platform.OS == 'ios' && promptDate.alertCount > 3) ||
    (Platform.OS == 'android' && promptDate.alertCount > 2)
  ) {
    return rateUsData
  }

  let remainingDaysForNextAlert =
    new Date(nextAlertDate).getTime() - new Date().getTime()
  remainingDaysForNextAlert = Math.floor(
    remainingDaysForNextAlert / (1000 * 60 * 60 * 24),
  )

  if (
    interactionTrigger.remoteRccResCount >= SUCCESSFUL_REMOTE_THRESHOLD ||
    interactionTrigger.lockCommandCount >= SUCCESSFUL_LOCK_COMMAND_THRESHOLD ||
    interactionTrigger.serviceAppointmentCount >=
      SUCCESSFUL_SERVICE_APPOINTMENT_THRESHOLD
  ) {
    if (remainingDaysForNextAlert < 0) {
      // Reset all flags and counters
      lockCommandCount = 0
      remoteRccResCount = 0
      serviceAppointmentCount = 0
      shouldDisplayAppReview = true
    } else {
      shouldDisplayAppReview = false
    }
  }

  if (shouldDisplayAppReview) {
    const title: string = t('appRating:mySubaruAppFeedback')
    const message: string = t('appRating:enjoyingMySubaruApp')
    const yes: string = t('common:yes')
    const no: string = t('appRating:notReally')
    const response = await promptAlert(title, message, [
      { title: yes, type: 'primary' },
      { title: no, type: 'secondary' },
    ])

    if (response == yes) {
      // Next review Prompt after 6 months
      nextAlertDate = new Date(new Date().getTime() + 180 * 86400000)
      totalPromptCount = totalPromptCount + 1
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      requestReview()
    } else {
      // Next review Prompt after 1 month
      nextAlertDate = new Date(new Date().getTime() + 30 * 86400000)
    }
    shouldDisplayAppReview = false
  }
  const data = {
    interactionTrigger: {
      remoteRccResCount: remoteRccResCount,
      lockCommandCount: lockCommandCount,
      serviceAppointmentCount: serviceAppointmentCount,
    },
    promptDate: {
      alertCount: totalPromptCount,
      nextAlertDate: nextAlertDate,
      foreseeSurvey: promptDate.foreseeSurvey,
    },
    showAppReviewPrompt: shouldDisplayAppReview,
  } as RateUsPrompt

  return data
}
