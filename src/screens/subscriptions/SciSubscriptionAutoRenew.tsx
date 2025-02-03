/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SciStarlinkFeaturesView } from './SciSubscriptionEnrollment'
import {
  canadaManageEnrollmentApi,
  useCanadaCurrentEnrollmentQuery,
  useCanadaUpgradeOptionsQuery,
} from '../../api/caManageEnrollment.api'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import {
  formatCurrencyForBilling,
  getExpirationStringForPlan,
  getPlanDurationString,
} from '../../utils/subscriptions'
import { formatFullDate } from '../../utils/dates'
import { useCanadaPriceCheckMutation } from '../../api/caInitialEnrollment.api'
import { MgaCartItem, MgaCartLineItemView } from '../../components/MgaCart'
import { testID } from '../../components/utils/testID'
import { trackError } from '../../components/useTracking'
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView'
import { MgaPaymentInformationFormRef } from './MgaBillingInformationEdit'
import { store } from '../../store'
import { getNameForPlan } from '../../api/manageEnrollment.api'
import promptAlert from '../../components/CsfAlert'
import { CsfCheckBox } from '../../components/CsfCheckbox'
import CsfText from '../../components/CsfText'
import CsfTile from '../../components/CsfTile'
import CsfView from '../../components/CsfView'
import MgaButton from '../../components/MgaButton'
import MgaPage from '../../components/MgaPage'
import MgaPageContent from '../../components/MgaPageContent'
import MgaProgressIndicator from '../../components/MgaProgressIndicator'

const SciSubscriptionAutoRenew: React.FC = () => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const currentEnrollment = useCanadaCurrentEnrollmentQuery({
    vin: vehicle?.vin ?? '',
  })
  const upgradeOptions = useCanadaUpgradeOptionsQuery(undefined)
  const [priceCheck, priceCheckResponse] = useCanadaPriceCheckMutation()
  const [page, setPage] = useState(1)
  const [terms, setTerms] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const formRef = useRef<MgaPaymentInformationFormRef>(null)
  const [isAddingPlan, setAddingPlan] = useState(false)
  const id = testID('SciSubscriptionAutoRenew')
  const allInPlan = currentEnrollment?.data?.data?.find(
    plan => plan.starlinkPackage == 'ALLIN',
  )
  const allInRate = upgradeOptions.data?.data?.upgradeOptions.allInServicesTerm
  // + 1 year + 1 day
  // Ref: https://github.com/SubaruOfAmerica/tb2c-mysubaru-canada-blob/main/www/pages/subscriptionEnrollmentPage.js#L612
  const paidPlanExpirationDate =
    allInPlan?.automaticRenewal == false &&
    allInPlan.expirationDate &&
    new Date(
      allInPlan.expirationDate.year + 1,
      allInPlan.expirationDate.monthValue - 1,
      allInPlan.expirationDate.dayOfMonth + 1,
      0,
      0,
      0,
    )
  /** Auto-Renew Page 1 - Plans */
  const PlansPage: React.FC = () => {
    const next = () => {
      if (!allInRate) { return }
      priceCheck({
        allInMasterPlanId: allInRate.planId,
        allInRateScheduleId: allInRate.rateScheduleId,
      })
        .then()
        .catch(trackError('SciSubscriptionAutoRenew::priceCheck'))
      setPage(2)
    }
    return (
      <CsfView gap={8}>
        {allInPlan && (
          <CsfTile gap={4}>
            <CsfText variant="subheading">{getNameForPlan(allInPlan)}</CsfText>
            <CsfView>
              <CsfText variant="body2">
                {getPlanDurationString(allInPlan)}
              </CsfText>
              <CsfText variant="body2">
                {getExpirationStringForPlan(allInPlan)}
              </CsfText>
            </CsfView>
          </CsfTile>
        )}
        {paidPlanExpirationDate && (
          <CsfView>
            <CsfText align="center" variant="subheading">
              {t('subscriptionUpgrade:autoRenewHeader')}
            </CsfText>
            <CsfText align="center" variant="body2">
              {t('subscriptionManage:makeSureYourBillingInformationIsUpToDate')}
            </CsfText>
            <CsfTile gap={4}>
              <CsfText variant="subheading">
                {getNameForPlan(allInPlan)}
              </CsfText>
              <CsfText variant="body2">
                {t('subscriptionEnrollment:annualSubscription')}
              </CsfText>
              <CsfText variant="body2">
                {t('subscriptionEnrollment:through', {
                  when: formatFullDate(paidPlanExpirationDate),
                })}
              </CsfText>
              <CsfText variant="body2">
                {formatCurrencyForBilling(allInRate?.fullPrice)}
              </CsfText>
            </CsfTile>
          </CsfView>
        )}
        <MgaButton title={t('common:next')} onPress={next} />
        <SciStarlinkFeaturesView />
        <MgaButton title={t('common:next')} onPress={next} />
      </CsfView>
    )
  };
  const CheckoutPage: React.FC = () => {
    const {
      addedPlans,
      invoiceCreditAmount,
      invoicePreTaxTotal,
      invoiceTaxTotal,
      invoiceTotal,
    } = priceCheckResponse.data?.data?.enrollResponse.subscriptionResult ?? {}
    const priceCheckOk = priceCheckResponse.data?.data?.enrollResponse
    const InvoiceLine: React.FC<{
      bold?: boolean
      testID?: string
      title?: string
      amount?: number
    }> = ({ bold, testID, title, amount }) => {
      return (
        <CsfView flexDirection="row" align="center" justify="space-between">
          <CsfText bold={bold} testID={testID}>
            {title}
          </CsfText>
          <CsfText bold={bold} testID={id('calculating')}>
            {amount != undefined
              ? formatCurrencyForBilling(amount)
              : t('subscriptionEnrollment:calculating')}
          </CsfText>
        </CsfView>
      )
    }
    return (
      <CsfView gap={8}>
        <CsfTile>
          <CsfText variant="heading" testID={id('confirmation')}>
            {t('common:confirmation')}
          </CsfText>
          <CsfText variant="subheading" testID={id('orderDetails')}>
            {t('subscriptionUpgrade:orderDetails')}
          </CsfText>
          {addedPlans
            ?.filter(plan => plan.planId)
            .map(plan => {
              const item: MgaCartItem = {
                title: getNameForPlan(),
                priceString: formatCurrencyForBilling(plan?.amount),
              }
              return (
                <MgaCartLineItemView
                  key={plan.planId}
                  id={plan.planId}
                  item={item}
                  onEdit={() => setPage(1)}
                />
              )
            })}
          <InvoiceLine
            testID={id('yourSubTotal')}
            title={t('subscriptionModify:yourSubTotal')}
            amount={
              invoicePreTaxTotal != undefined &&
                invoiceCreditAmount != undefined
                ? invoicePreTaxTotal - invoiceCreditAmount
                : undefined
            }
          />
          <InvoiceLine
            testID={id('tax')}
            title={t('subscriptionModify:tax')}
            amount={invoiceTaxTotal}
          />
          <InvoiceLine
            bold
            testID={id('total')}
            title={t('subscriptionModify:total')}
            amount={invoiceTotal}
          />
        </CsfTile>
        <CsfCheckBox
          label={t('subscriptionUpgrade:iAgree')}
          checked={terms}
          errors={showErrors && !terms && t('validation:required')}
          onChangeValue={setTerms}
          testID={id('iAgree')}
        />
        <CsfView flexDirection="row" gap={8}>
          <MgaButton
            trackingId="SubscriptionAutoRenewBack"
            flex={1}
            title={t('common:back')}
            variant="secondary"
            onPress={() => setPage(1)}
          />
          <MgaButton
            trackingId="SubscriptionAutoRenewBilling"
            flex={1}
            title={t('common:continue')}
            variant="primary"
            bg={priceCheckOk ? 'button' : 'disabled'}
            onPress={
              priceCheckOk
                ? () => {
                  setShowErrors(true)
                  if (!terms) return
                  setPage(3)
                }
                : undefined
            }
          />
        </CsfView>
      </CsfView>
    )
  }
  const onAddPlan = async () => {
    if (!formRef) if (!formRef.current) return
    const billingOk = await formRef.current.submit()
    if (!billingOk) return
    const request =
      canadaManageEnrollmentApi.endpoints.canadaAddPaidPlan.initiate(undefined)
    const response = await store.dispatch(request).unwrap()
    if (response.success && response.data?.overallResult?.success) {
      setPage(4)
    } else {
      const errorCode4027 =
        response.errorCode == 'UNABLE_TO_AUTHORIZE_CREDIT_CARD' ||
        response.data?.overallResult?.errorCode == 4027
      await promptAlert(
        t('common:error'),
        errorCode4027
          ? t('subscriptionEnrollment:4027error')
          : t('subscriptionEnrollment:notAbleToEnroll'),
        [{ title: t('common:continue') }],
      )
    }
  }
  const BillingInfoPage: React.FC = () => {
    return (
      <CsfView gap={8}>
        <MgaBillingInformationViewEmbed ref={formRef} />
        <CsfView flexDirection="row" gap={8}>
          <MgaButton
            testID="SubscriptionAutoRenewBack"
            flex={1}
            title={t('common:back')}
            variant="secondary"
            onPress={() => setPage(page - 1)}
          />
          <MgaButton
            testID="SubscriptionAutoRenewSaveBillingInfo"
            flex={1}
            title={t('common:subscribeNow')}
            variant="primary"
            isLoading={isAddingPlan}
            onPress={async () => {
              setAddingPlan(true)
              await onAddPlan()
              setAddingPlan(false)
            }}
          />
        </CsfView>
      </CsfView>
    )
  }
  const ThankYouPage: React.FC = () => {
    return (
      <CsfView gap={8}>
        <CsfText variant="subheading" testID={id('thanksForYourOrder')}>
          {t('subscriptionUpgrade:thanksForYourOrder')}
        </CsfText>
        {paidPlanExpirationDate && (
          <CsfText testID={id('thankYouMessage1')}>
            {t('subscriptionUpgrade:thankYouMessage', {
              when: formatFullDate(paidPlanExpirationDate),
            })}
          </CsfText>
        )}
      </CsfView>
    )
  }
  return (
    <MgaPage showVehicleInfoBar title={t('subscriptionModify:title')}>
      <MgaPageContent title={t('subscriptionModify:title')}>
        {(page == 1 || page == 2 || page == 3) && (
          <MgaProgressIndicator current={page} length={3} />
        )}
        {page == 1 && <PlansPage />}
        {page == 2 && <CheckoutPage />}
        {page == 3 && <BillingInfoPage />}
        {page == 4 && <ThankYouPage />}
      </MgaPageContent>
    </MgaPage>
  )
}

export default SciSubscriptionAutoRenew;