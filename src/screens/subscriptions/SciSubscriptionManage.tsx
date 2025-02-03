import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppNavigation } from '../../Controller'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import {
  canAddAutoRenewToSciSubscription,
  useCanadaCurrentEnrollmentQuery,
} from '../../api/caManageEnrollment.api'
import {
  getNameForPlan,
  isWritableSubscription,
} from '../../api/manageEnrollment.api'
import { testID } from '../../components/utils/testID'
import { getExpirationStringForPlan } from '../../utils/subscriptions'
import CsfText from '../../components/CsfText'
import CsfTile from '../../components/CsfTile'
import CsfView from '../../components/CsfView'
import MgaButton from '../../components/MgaButton'
import MgaPage from '../../components/MgaPage'
import MgaPageContent from '../../components/MgaPageContent'

export const SciSubscriptionManageAddPaidPlan: React.FC = () => {
  const { t } = useTranslation()
  const id = testID('SciSubscriptionManageAddPaidPlan')
  const navigation = useAppNavigation()
  return (
    <CsfTile>
      <CsfText align="center" variant="heading" testID={id('autoRenewHeader')}>
        {t('subscriptionManage:autoRenewHeader')}
      </CsfText>
      <CsfText
        align="center"
        variant="body2"
        testID={id('makeSureYourBillingInformationIsUpToDate')}>
        {t('subscriptionManage:makeSureYourBillingInformationIsUpToDate')}
      </CsfText>
      <MgaButton
        trackingId="SciSubscriptionManageAddPaidPlan"
        title={t('subscriptionManage:addPaidPlan')}
        onPress={() => navigation.push('SciSubscriptionAutoRenew')}
      />
    </CsfTile>
  )
}

const SciSubscriptionManage: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const vehicle = useCurrentVehicle()
  const { data, isLoading } = useCanadaCurrentEnrollmentQuery({
    vin: vehicle?.vin ?? '',
  })
  const plans = data?.data ?? []
  const allInPlan = plans?.find(plan => plan.starlinkPackage == 'ALLIN')
  const addPaidPlan = plans.some(canAddAutoRenewToSciSubscription)
  const writeableSubscription = plans.some(isWritableSubscription)
  const id = testID('SciSubscriptionManage')

  return (
    <MgaPage
      showVehicleInfoBar
      title={t('remoteService:manageStarlinkSubscription')}>
      <MgaPageContent
        isLoading={isLoading}
        title={t('remoteService:manageStarlinkSubscription')}>
        <CsfView align="center" pt={8}>
          <CsfText variant="heading">
            {t('subscriptionManage:yourCurrentSubscription')}
          </CsfText>
        </CsfView>
        <CsfView>
          <CsfText variant="subheading">{getNameForPlan(allInPlan)}</CsfText>
          {plans[0] && (
            <CsfText variant="body2">
              {getExpirationStringForPlan(plans[0])}
            </CsfText>
          )}
        </CsfView>
        {writeableSubscription && addPaidPlan && (
          <SciSubscriptionManageAddPaidPlan />
        )}
        {writeableSubscription && (
          <CsfTile>
            <CsfText
              align="center"
              variant="heading"
              testID={id('unsubscribe')}>
              {t('subscriptionManage:unsubscribe')}
            </CsfText>
            <CsfText
              align="center"
              variant="body2"
              testID={id('currentPlanNotWorking')}>
              {t('subscriptionManage:currentPlanNotWorking')}
            </CsfText>
            <MgaButton
              trackingId="SciSubscriptionManageUnsubscribe"
              title={t('subscriptionManage:unsubscribe')}
              onPress={() => navigation.push('SciSubscriptionCancel')}
            />
          </CsfTile>
        )}
      </MgaPageContent>
    </MgaPage>
  )
}

export default SciSubscriptionManage;

