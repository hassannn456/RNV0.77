/* eslint-disable semi */
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import { capabilityRESCC, gen2Plus, has } from '../../features/menu/rules'
import { testID } from '../../components/utils/testID'
import CsfBulletedList, { CsfBulletedListProps } from '../../components/CsfBulletedList'
import CsfText from '../../components/CsfText'

export interface MgaSubscriptionFeatureListRemoteProps
  extends CsfBulletedListProps {
  /** Hide "All Safety and...". Used in combined list for PHEV trial. */
  hideSafetyIntro?: boolean
}

const MgaSubscriptionFeatureListRemote: React.FC<MgaSubscriptionFeatureListRemoteProps> = ({
  hideSafetyIntro,
  ...props
}) => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const id = testID('SubscriptionFeatureListRemote')
  return (
    <CsfBulletedList {...props}>
      {!hideSafetyIntro && (
        <CsfText bold testID={id('allSafetyPlusFeatures')}>
          {t('subscriptionUpgrade:allSafetyPlusFeatures')}
        </CsfText>
      )}
      {has(gen2Plus, vehicle) && t('subscriptionUpgrade:stolenVehicleRecoveryPlus')}
      {has(gen2Plus, vehicle) && t('subscriptionUpgrade:stolenVehicleImmobilizer')}
      {t('subscriptionUpgrade:vehicleSecurityAlarmNotification')}
      {t('subscriptionUpgrade:remoteLockUnlock')}
      {t('subscriptionUpgrade:remoteHornLights')}
      {t('subscriptionUpgrade:remoteVehicleLocator')}
      {has(capabilityRESCC, vehicle) && t('subscriptionUpgrade:remoteEngineStart')}
      {has('cap:RDP', vehicle) && t('subscriptionUpgrade:remoteVehicleConfiguration')}
      {has('cap:TLD', vehicle) && t('subscriptionUpgrade:tripLogs')}
      {has('cap:VALET', vehicle) && t('subscriptionUpgrade:valetModeNotifications')}
      {has('cap:VALET', vehicle) && t('subscriptionUpgrade:valetModeNotifications2')}
      {t('subscriptionUpgrade:boundaryAlert')}
      {t('subscriptionUpgrade:speedAlert')}
      {t('subscriptionUpgrade:curfewAlert')}
      {has('cap:RPOI', vehicle) && t('subscriptionUpgrade:destinationToVehicle')}
      {has('cap:PHEV', vehicle) && t('subscriptionUpgrade:remoteClimateControl-phev')}
      {has('cap:PHEV', vehicle) && t('subscriptionUpgrade:remoteBatteryChargingTimer-phev')}
    </CsfBulletedList>
  )
}

export default MgaSubscriptionFeatureListRemote
