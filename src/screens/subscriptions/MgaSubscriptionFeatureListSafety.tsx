/* eslint-disable semi */
import React from 'react'
import { useTranslation } from 'react-i18next'
import CsfBulletedList, { CsfBulletedListProps } from '../../components'

const MgaSubscriptionFeatureListSafety: React.FC<CsfBulletedListProps> = props => {
  const { t } = useTranslation()
  return (
    <CsfBulletedList {...props}>
      {t('subscriptionModify:sosEmergencyAssistance')}
      {t('subscriptionModify:enhancedRoadsideAssistance')}
      {t('subscriptionModify:collisionNotification')}
      {t('subscriptionModify:maintenanceNotifications')}
      {t('subscriptionModify:vehicleHealthReports')}
      {t('subscriptionModify:vehicleConditionCheck')}
      {t('subscriptionModify:diagnosticAlerts')}
      {t('subscriptionModify:serviceAppointmentScheduler')}
    </CsfBulletedList>
  )
}

export default MgaSubscriptionFeatureListSafety
