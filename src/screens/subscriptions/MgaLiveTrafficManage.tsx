// cSpell:ignore Freetrail
import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import {
  defaultLiveTrafficMonthlyCost,
  isLiveTrafficSubscription,
  isWritableSubscription,
  manageEnrollmentApi,
  useCurrentEnrollmentQuery,
  useSetTrafficConnectAutoRenewMutation,
} from '../../api/manageEnrollment.api'
import { MgaPlanDetail } from './MgaSubscriptionManage'
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView'
import { formatFullDate, parseDateObject } from '../../utils/dates'
import { store } from '../../store'
import { SubscriptionDetail } from '../../../@types'
import { formatCurrencyForBilling } from '../../utils/subscriptions'
import { accountApi } from '../../api/account.api'
import { useAppNavigation } from '../../Controller'
import { testID } from '../../components/utils/testID'
import CsfSimpleAlert from '../../components/CsfSimpleAlert'
import promptAlert from '../../components/CsfAlert'
import { successNotice } from '../../components/notice'
import CsfCard from '../../components/CsfCard'
import CsfView from '../../components/CsfView'
import CsfInfoButton from '../../components/CsfInfoButton'
import CsfText from '../../components/CsfText'
import MgaButton from '../../components/MgaButton'
import CsfToggle from '../../components/CsfToggle'
import MgaPage from '../../components/MgaPage'
import CsfActivityIndicator from '../../components/CsfActivityIndicator'

export const MgaLiveTrafficPlanTile: React.FC<{
  trafficPlan?: SubscriptionDetail
  testID?: string
}> = ({ trafficPlan, testID: derivedTestID }) => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const navigation = useAppNavigation()
  const [isLoading, setLoading] = useState(false)
  const [setTrafficConnectAutoRenew, _] =
    useSetTrafficConnectAutoRenewMutation()
  const isAutoRenew = trafficPlan?.automaticRenewal
  const isFreeTrial = trafficPlan?.trial
  const when = formatFullDate(parseDateObject(trafficPlan?.expirationDate))
  const tcMonthlyFee = formatCurrencyForBilling(
    trafficPlan?.rolloverPlanRateSchedule?.price ??
      defaultLiveTrafficMonthlyCost,
  )
  const cancelTrafficSubscription = async () => {
    // Confirmation prompt
    const yes: string = t('trafficConnectManage:cancelTrafficFreetrail')
    const no: string = t('common:back')
    const selection = await promptAlert(
      t('trafficConnectManage:cancelFreetrail'),
      t('trafficConnectManage:cancelFreetrailMessage1', { when, tcMonthlyFee }),
      [
        { title: yes, type: 'primary' },
        { title: no, type: 'secondary' },
      ],
    )
    if (selection != yes) return
    const cancelRequest =
      manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
        doWrite: true,
        starlinkPackage: 'TOMTOM',
      })
    const cancelResponse = await store.dispatch(cancelRequest).unwrap()
    if (cancelResponse.success) {
      // Refresh vehicles after
      const refreshRequest =
        accountApi.endpoints.refreshVehicles.initiate(undefined)
      await store.dispatch(refreshRequest).unwrap()
    }
    return cancelResponse
  }
  const trafficConnectErrorHandler = (
    errorCode: string | null,
    errorMessage: string,
  ) => {
    const errorKey = (() => {
      if (!errorCode) return errorMessage
      if (errorCode.includes('VEHICLE_ACCOUNT_TYPE_MAPPING_ERROR')) {
        return 'invalidAccountType'
      }
      if (
        errorCode.includes('TRAFFIC_CONNECT_SUBSCRIPTION_PLAN_MISSING_ERROR')
      ) {
        return 'noPlanOptionForAccountType'
      }
      return errorMessage
    })()
    CsfSimpleAlert(
      t('common:error'),
      t(`trafficConnectSubscription:${errorKey}`),
      { type: 'error' },
    )
  }
  const toggleAutoRenew = async () => {
    // Confirmation prompt if stopping auto-renew
    if (isAutoRenew) {
      const disable = t('trafficConnectManage:disableAutoRenew')
      const cancel: string = t('common:back')
      const selection = await promptAlert(
        t('trafficConnectManage:cancelAutoRenewal'),
        t('trafficConnectManage:cancelMessage1', { when, tcMonthlyFee }),
        [
          { title: disable, type: 'primary' },
          { title: cancel, type: 'secondary' },
        ],
      )
      if (selection != disable) return
    }
    const response = await setTrafficConnectAutoRenew(!isAutoRenew).unwrap()
    if (response.success) {
      const refresh = await store
        .dispatch(
          manageEnrollmentApi.endpoints.currentEnrollment.initiate({
            vin: vehicle?.vin ?? '',
          }),
        )
        .unwrap()
      if (refresh.success) {
        const newTrafficPlan = refresh.data?.find(isLiveTrafficSubscription)
        if (newTrafficPlan) {
          const when = isAutoRenew
            ? formatFullDate(parseDateObject(newTrafficPlan.expirationDate))
            : formatFullDate(parseDateObject(newTrafficPlan.nextBillingDate))
          const tcMonthlyFee = formatCurrencyForBilling(
            newTrafficPlan.rolloverPlanRateSchedule?.price ??
              defaultLiveTrafficMonthlyCost,
          )
          successNotice({
            subtitle: t(
              isAutoRenew
                ? 'trafficConnectManage:autoRenewOff'
                : 'trafficConnectManage:autoRenewOn',
              { when, tcMonthlyFee },
            ),
            dismissable: true,
          })
        }
      }
    } else {
      trafficConnectErrorHandler(response.errorCode, 'autoRenewChangeFailed')
    }
  }

  const id = testID(derivedTestID)
  return (
    trafficPlan && (
      <CsfCard
        pr={20}
        title={t('subscriptionManage:yourCurrentSubscription')}
        action={
          isFreeTrial ? (
            <CsfView>
              <CsfInfoButton
                title={t(
                  'trafficConnectManage:liveTrafficSubscriptionInformationTitle',
                )}
                text={t(
                  'trafficConnectManage:liveTrafficSubscriptionInformationMessage',
                  { when, tcMonthlyFee },
                )}
                testID={id('subscriptionInformationTitle')}
              />
            </CsfView>
          ) : (
            <CsfView>
              <CsfInfoButton
                title={t('trafficConnectManage:autoRenewalSettings')}
                text={t('trafficConnectManage:autoRenewalInfo', {
                  when,
                  tcMonthlyFee,
                })}
                testID={id('autoRenewalSettings')}
              />
            </CsfView>
          )
        }
        isLoading={isLoading}>
        <CsfView flexDirection="column" mt={0}>
          <MgaPlanDetail plan={trafficPlan} testID={id('trafficPlan')} />
          {trafficPlan.rolloverPlanRateSchedule && (
            <CsfText testID={id('nextBillAmount')}>
              {t('trafficConnectManage:nextBillAmount', {
                when,
                tcMonthlyFee,
              })}
            </CsfText>
          )}
          {isFreeTrial ? (
            <CsfView mt={16} align="flex-start">
              <MgaButton
                trackingId="LiveTrafficManageCancelSubscription"
                variant="inlineLink"
                title={t('trafficConnectManage:cancelSubscription')}
                onPress={async () => {
                  setLoading(true)
                  const response = await cancelTrafficSubscription()
                  setLoading(false)
                  if (response?.success) {
                    navigation.navigate('SubscriptionServicesLanding')
                  }
                }}
              />
            </CsfView>
          ) : (
            <CsfToggle
              small
              label={t('trafficConnectManage:autoRenew')}
              inline
              testID={id('autoRenew')}
              checked={trafficPlan.automaticRenewal}
              onChangeValue={async () => {
                setLoading(true)
                await toggleAutoRenew()
                setLoading(false)
              }}
            />
          )}
        </CsfView>
      </CsfCard>
    )
  )
}

export const MgaLiveTrafficManage: React.FC = () => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const plans = useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data
    ?.data
  const trafficPlan = plans?.find(isLiveTrafficSubscription)
  const writeableSubscription = isWritableSubscription(trafficPlan)

  const id = testID('LiveTrafficManage')
  return (
    <MgaPage showVehicleInfoBar title={t('trafficConnectManage:header')}>
      {plans ? (
        <CsfView edgeInsets standardSpacing>
          <CsfText align="center" variant="title3" testID={id('header')}>
            {t('trafficConnectManage:header')}
          </CsfText>
          <MgaLiveTrafficPlanTile
            trafficPlan={trafficPlan}
            testID={id('trafficPlanTile')}
          />
          {writeableSubscription && (
            <CsfText align="center" testID={id('adjustmentText')}>
              {t('trafficConnectManage:adjustmentText')}
            </CsfText>
          )}
          {writeableSubscription && <MgaBillingInformationViewEmbed />}
        </CsfView>
      ) : (
        <CsfView p={20}>
          <CsfActivityIndicator />
        </CsfView>
      )}
    </MgaPage>
  )
}
