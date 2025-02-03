/* eslint-disable eol-last */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SciStarlinkFeaturesView } from './SciSubscriptionEnrollment'
import { formatCurrencyForBilling } from '../../utils/subscriptions'
import { testID } from '../../components/utils/testID'
import { useAppNavigation } from '../../Controller'
import {
  canadaManageEnrollmentApi,
  useCanadaCancelPriceCheckQuery,
} from '../../api/caManageEnrollment.api'
import { store } from '../../store'
import { accountApi } from '../../api/account.api'
import { getNameForPlan } from '../../api/manageEnrollment.api'
import { CsfCheckBox } from '../../components/CsfCheckbox'
import CsfText from '../../components/CsfText'
import CsfTile from '../../components/CsfTile'
import CsfView from '../../components/CsfView'
import MgaButton from '../../components/MgaButton'
import MgaPage from '../../components/MgaPage'
import MgaPageContent from '../../components/MgaPageContent'
import MgaProgressIndicator from '../../components/MgaProgressIndicator'

const SciSubscriptionCancel: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const [page, setPage] = useState(1)
  const { data: cancelPlansResponse } = useCanadaCancelPriceCheckQuery({
    doWrite: false,
  })
  const [confirm, setConfirm] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [isCanceling, setCanceling] = useState(false)
  const id = testID('SciSubscriptionCancel')
  const [badCreditCardMessage, setBadCreditCardMessage] = useState(false)

  const PlansPage = () => {
    return (
      <CsfView gap={8}>
        <CsfTile>
          <CsfText variant="heading" testID={id('connectedServices')}>
            {getNameForPlan()}
          </CsfText>
          <MgaButton
            trackingId="SciSubscriptionCancel"
            title={t('subscriptionCancel:cancelSubscription')}
            onPress={() => setPage(2)}
          />
        </CsfTile>
        <SciStarlinkFeaturesView />
      </CsfView>
    )
  }
  const onCancel = async () => {
    const request =
      canadaManageEnrollmentApi.endpoints.canadaCancelPriceCheck.initiate({
        doWrite: true,
      })
    const response = await store.dispatch(request).unwrap()
    // NOTE: No error handling path
    if (response.success) {
      if (
        response.data?.allInRefund &&
        response.data.allInRefund.refundDeferred
      ) {
        setBadCreditCardMessage(true)
      }
      // Refresh vehicle data after sub change
      await store
        .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
        .unwrap()
      setPage(3)
    }
  }
  const InvoiceLine: React.FC<{
    bold?: boolean
    testID?: string
    title?: string
    amount?: number
  }> = ({ bold, title, amount, ...props }) => {
    const invoiceTestID = testID(props.testID)
    return (
      <CsfView flexDirection="row" align="center" justify="space-between">
        <CsfText bold={bold} testID={invoiceTestID()}>
          {title}
        </CsfText>
        <CsfText bold={bold} testID={invoiceTestID('amount')}>
          {amount != undefined
            ? formatCurrencyForBilling(amount)
            : t('subscriptionEnrollment:calculating')}
        </CsfText>
      </CsfView>
    )
  }
  const RefundPage = () => {
    return (
      <CsfView gap={8}>
        <CsfTile>
          <CsfText variant="heading" testID={id('yourRefund')}>
            {t('subscriptionCancel:yourRefund')}
          </CsfText>
          <CsfText variant="body2" testID={id('connectedServices')}>
            {getNameForPlan()}
          </CsfText>
        </CsfTile>
        <InvoiceLine
          bold
          testID={id('refundAmount')}
          title={t('subscriptionCancel:estimatedRefund')}
          amount={cancelPlansResponse?.data?.refundAmount}
        />
        <CsfText variant="body2" testID={id('finalRefund')}>
          {t('subscriptionCancel:finalRefund')}
        </CsfText>
        <CsfText variant="body2" testID={id('cancellationDescription1')}>
          {t('subscriptionCancel:cancellationDescription1')}
        </CsfText>
        <CsfText variant="body2" testID={id('cancellationDescription2')}>
          {t('subscriptionCancel:cancellationDescription2')}
        </CsfText>
        <CsfText variant="body2">
          {t('subscriptionCancel:cancellationDescription3')}
        </CsfText>
        <CsfCheckBox
          label={t('subscriptionCancel:checkBoxMsg')}
          checked={confirm}
          onChangeValue={value => setConfirm(value)}
          errors={showErrors && !confirm && t('validation:required')}
          testID={id('confirmCancel')}
        />
        <CsfView flexDirection="row" gap={8}>
          <MgaButton
            trackingId="SciSubscriptionCancelBack"
            flex={1}
            title={t('common:back')}
            variant="secondary"
            onPress={() => setPage(1)}
          />
          <MgaButton
            trackingId="SciSubscriptionCancel"
            isLoading={isCanceling}
            flex={1}
            title={t('subscriptionCancel:cancelSubscription')}
            variant="primary"
            bg={
              cancelPlansResponse?.success && cancelPlansResponse.data
                ? 'button'
                : 'disabled'
            }
            onPress={async () => {
              setShowErrors(true)
              if (!confirm) return
              if (isCanceling) return
              setCanceling(true)
              await onCancel()
              setCanceling(false)
            }}
          />
        </CsfView>
      </CsfView>
    )
  }
  const ExitPage = () => {
    const totalRefund = cancelPlansResponse?.data?.refundAmount
    return (
      <CsfView gap={8}>
        <CsfTile>
          <CsfText variant="heading" testID={id('yourRefund')}>
            {t('subscriptionCancel:yourRefund')}
          </CsfText>
          <CsfText variant="body2" testID={id('connectedServices')}>
            {getNameForPlan()}
          </CsfText>
        </CsfTile>
        <InvoiceLine
          bold
          testID={id('totalRefund')}
          title={t('subscriptionCancel:estimatedRefund')}
          amount={totalRefund}
        />
        <CsfText variant="body2" testID={id('finalRefund')}>
          {t('subscriptionCancel:finalRefund')}
        </CsfText>
        <CsfText variant="body2" testID={id('cancellationDone')}>
          {t('subscriptionCancel:cancellationDone')}
        </CsfText>
        {badCreditCardMessage && (
          <CsfText variant="body2" testID={id('badCreditCardMessage')}>
            {t('subscriptionCancel:badCreditCardMessage', {
              totalRefund: totalRefund,
            })}
          </CsfText>
        )}
        <MgaButton
          trackingId="SciSubscriptionServiceLanding"
          title={t('subscriptionCancel:returnToSubscriptions')}
          onPress={() => navigation.navigate('SciSubscriptionServiceLanding')}
        />
      </CsfView>
    )
  }
  return (
    <MgaPage showVehicleInfoBar title={t('subscriptionServices:title')}>
      <MgaPageContent title={t('subscriptionServices:title')}>
        {(page == 1 || page == 2 || page == 3) && (
          <MgaProgressIndicator current={page} length={3} />
        )}
        {page == 1 && <PlansPage />}
        {page == 2 && <RefundPage />}
        {page == 3 && <ExitPage />}
      </MgaPageContent>
    </MgaPage>
  )
}

export default SciSubscriptionCancel;