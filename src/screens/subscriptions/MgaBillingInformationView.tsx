/* eslint-disable camelcase */
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AriaBillingDetails,
  getNameForPlan,
  isLeaseSubscription,
  useAriaDirectPostUrlQuery,
  useBillingInformationQuery,
  useCurrentEnrollmentQuery,
  usePaymentMethodQuery,
} from '../../api/manageEnrollment.api'
import { popIfTop, useAppNavigation } from '../../Controller'
import {
  MgaPaymentInformationForm,
  MgaPaymentInformationFormRef,
} from './MgaBillingInformationEdit'
import { testID } from '../../components/utils/testID'
import { cNetworkError } from '../../api'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import { canAddAutoRenewToSciSubscription } from '../../api/caManageEnrollment.api'
import { has } from '../../features/menu/rules'
import { formatFullDate, parseDateObject } from '../../utils/dates'
import { SciSubscriptionManageAddPaidPlan } from './SciSubscriptionManage'
import MgaButton from '../../components/MgaButton'
import CsfActivityIndicator from '../../components/CsfActivityIndicator'
import CsfTile from '../../components/CsfTile'
import CsfText from '../../components/CsfText'
import CsfView from '../../components/CsfView'
import { CsfRuleList } from '../../components/CsfRuleList'
import CsfDetail from '../../components/CsfDetail'
import MgaPage from '../../components/MgaPage'

export const MgaBillingInformationViewEmbed = forwardRef<
  MgaPaymentInformationFormRef,
  unknown
>((_props, ref) => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const vehicle = useCurrentVehicle()
  const id = testID('BillingInformationDetails')
  const [isSaving, setSaving] = useState(false)
  const ariaBillingInformationResponse = useBillingInformationQuery(undefined)
  const ariaBillingInformation = ariaBillingInformationResponse.data?.data
  const plans =
    useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data?.data ?? []
  const ariaDirectPostUrl = useAriaDirectPostUrlQuery(undefined).data?.data
  const paymentMethodResponse = usePaymentMethodQuery({
    skipCreditCardValidation: true,
  })
  const isLeaseFinance = isLeaseSubscription(
    plans.find(plan => plan.starlinkPackage),
  )
  const paymentMethod = paymentMethodResponse.data?.data
  const formRef = useRef<MgaPaymentInformationFormRef>(null)
  useImperativeHandle(ref, () => ({
    submit: async (routing?: Partial<AriaBillingDetails>): Promise<boolean> => {
      if (!formRef.current) {
        return !isLoading // Form not required
      }
      return await formRef.current.submit(routing)
    },
    validate: (): boolean => {
      // Need loading to finish to know if validation required
      if (isLoading) return false
      // CC info already blessed by ARIA
      if (!formRef.current) return true
      // Check underlying form
      return formRef.current.validate()
    },
  }))
  const isLoading =
    paymentMethodResponse.isFetching ||
    ariaBillingInformationResponse.isFetching
  const editButton =
    ariaBillingInformation && ariaDirectPostUrl && paymentMethod ? (
      <MgaButton
        trackingId="BillingInformationViewEmbedEdit"
        title={t('common:edit')}
        variant="inlineLink"
        onPress={() => {
          const address = paymentMethod.billingContact?.address
          if (!address) return
          navigation.push('BillingInformationEdit', {
            ariaDirectPostUrl: ariaDirectPostUrl,
            paymentMethod: {
              cc_no: '',
              cvv: '',
              cc_exp_mm: '',
              cc_exp_yyyy: '',
              bill_first_name: address.first_name ?? '',
              bill_last_name: address.last_name ?? '',
              bill_address1: address.address1 ?? '',
              bill_address2: address.address2 ?? '',
              bill_city: address.city ?? '',
              bill_state_prov: address.state_prov ?? '',
              bill_postal_cd: address.postal_cd ?? '',
              mode: ariaBillingInformation.ariaBillingMode,
              client_no: ariaBillingInformation.ariaClientNumber,
              inSessionID: ariaBillingInformation.inSessionID,
              formOfPayment: 'CreditCard',
            },
          })
        }}
      />
    ) : (
      <CsfActivityIndicator />
    )
  if (isLoading) {
    return <CsfActivityIndicator />
  }
  if (!ariaBillingInformation) {
    if (ariaBillingInformationResponse?.currentData?.errorCode == cNetworkError)
      return
    return (
      <CsfTile>
        <CsfText testID={id('enrollMissingText')}>Missing Enroll Step!</CsfText>
      </CsfTile>
    )
  }
  if (!paymentMethod?.paymentMethod) {
    return (
      <CsfView>
        <MgaPaymentInformationForm
          ariaDirectPostUrl={ariaDirectPostUrl}
          initialValues={{
            cc_no: '',
            cvv: '',
            cc_exp_mm: '',
            cc_exp_yyyy: '',
            bill_first_name: '',
            bill_last_name: '',
            bill_address1: '',
            bill_address2: '',
            bill_city: '',
            bill_state_prov: '',
            bill_postal_cd: '',
            mode: ariaBillingInformation.ariaBillingMode,
            client_no: ariaBillingInformation.ariaClientNumber,
            inSessionID: ariaBillingInformation.inSessionID,
            formOfPayment: 'CreditCard',
          }}
          ref={formRef}
        />
        {isLeaseFinance && (
          <CsfView flexDirection="row" gap={16}>
            <CsfView flex={1}>
              <MgaButton
                trackingId="BillingInformationViewEdit"
                variant="secondary"
                onPress={() => navigation.pop()}
                title={t('common:back')}
                testID={id('button')}
              />
            </CsfView>
            <CsfView flex={1}>
              <MgaButton
                trackingId="BillingInformationViewSubmit"
                isLoading={isSaving}
                onPress={async () => {
                  if (isSaving) return
                  if (!formRef.current) return
                  setSaving(true)
                  const ok = await formRef.current.submit()
                  if (ok) {
                    popIfTop(navigation, 'BillingInformationEdit')
                  }
                  setSaving(false)
                }}
                testID={id('button')}
                title={t('common:save')}
              />
            </CsfView>
          </CsfView>
        )}
      </CsfView>
    )
  }
  return (
    <CsfTile gap={8} pv={8}>
      {paymentMethod.paymentMethod && (
        <CsfView flexDirection="row" justify="space-between" align="center">
          <CsfText variant="subheading" testID={id('paymentInformation')}>
            {t('billingInformation:paymentInformation')}
          </CsfText>
          {editButton}
        </CsfView>
      )}
      {paymentMethod.paymentMethod && (
        <CsfRuleList testID={id('list')}>
          <CsfDetail
            label={t('billingInformation:cardNumber')}
            value={'****-****-****-' + paymentMethod.paymentMethod.last4}
            testID={id('cardNumber')}
          />
          <CsfDetail
            label={t('billingInformation:expiration')}
            value={
              String(paymentMethod.paymentMethod.expireMonth).padStart(2, '0') +
              ' / ' +
              String(paymentMethod.paymentMethod.expireYear)
            }
            testID={id('expiration')}
          />
        </CsfRuleList>
      )}
      {paymentMethod.billingContact && (
        <CsfView flexDirection="row" justify="space-between" align="center">
          <CsfText variant="subheading" testID={id('billingInfoTitle')}>
            {t('billingInformation:title')}
          </CsfText>
          {!paymentMethod.paymentMethod && editButton}
        </CsfView>
      )}
      {paymentMethod.billingContact && (
        <CsfRuleList testID={id('list')}>
          <CsfDetail
            label={t('common:firstName')}
            value={paymentMethod.billingContact.address.first_name}
            testID={id('firstName')}
          />
          <CsfDetail
            label={t('common:lastName')}
            value={paymentMethod.billingContact.address.last_name}
            testID={id('lastName')}
          />
          <CsfDetail
            label={t('billingInformation:addressLine1')}
            value={paymentMethod.billingContact.address.address1}
            testID={id('addressLine1')}
          />
          <CsfDetail
            label={t('billingInformation:addressLine2')}
            value={paymentMethod.billingContact.address.address2}
            testID={id('addressLine2')}
          />
          <CsfDetail
            label={t('common:city')}
            value={paymentMethod.billingContact.address.city}
            testID={id('city')}
          />
          <CsfDetail
            label={t('geography:state')}
            value={paymentMethod.billingContact.address.state_prov}
            testID={id('state')}
            // options={regions()}
          />
          <CsfDetail
            label={t('geography:zipcode')}
            value={paymentMethod.billingContact.address.postal_cd}
            testID={id('zip')}
          />
        </CsfRuleList>
      )}
      {has('reg:CA', vehicle) && (
        <CsfView>
          <CsfText variant="subheading">
            {t('billingInformation:autoRenewalOn')}
          </CsfText>
          <CsfRuleList testID={id('sci-auto-renew')}>
            {plans.map(p => {
              const dateString =
                p.nextBillingDate && p.automaticRenewal
                  ? formatFullDate(parseDateObject(p.nextBillingDate))
                  : '--'
              return (
                <CsfDetail
                  key={p.masterPlanId}
                  label={getNameForPlan(p)}
                  value={dateString}
                />
              )
            })}
          </CsfRuleList>
        </CsfView>
      )}
    </CsfTile>
  )
})

export const MgaBillingInformationView: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const vehicle = useCurrentVehicle()
  const formRef = useRef<MgaPaymentInformationFormRef>(null)
  const [isSaving, setSaving] = useState(false)
  const ariaBillingInformationResponse = useBillingInformationQuery(undefined)
  const ariaBillingInformation = ariaBillingInformationResponse.data?.data
  const ariaDirectPostUrl = useAriaDirectPostUrlQuery(undefined).data?.data
  const paymentMethodResponse = usePaymentMethodQuery({
    skipCreditCardValidation: true,
  })
  const showActions =
    ariaBillingInformation &&
    ariaDirectPostUrl &&
    !paymentMethodResponse.isFetching &&
    !paymentMethodResponse.data?.data?.billingContact
  const plans =
    useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data?.data ?? []
  const addSciPaidPlan = plans.some(canAddAutoRenewToSciSubscription)
  const id = testID('BillingInformation')
  return (
    <MgaPage title={t('billingInformation:title')} showVehicleInfoBar>
      <CsfView>
        <CsfView edgeInsets standardSpacing>
          <CsfText align="center" variant="title3" testID={id('title')}>
            {t('billingInformation:title')}
          </CsfText>
          <MgaBillingInformationViewEmbed ref={formRef} />
          {addSciPaidPlan && <SciSubscriptionManageAddPaidPlan />}
          {showActions && (
            <CsfView flexDirection="row" gap={8}>
              <MgaButton
                trackingId="BillingInformationBack"
                flex={1}
                title={t('common:back')}
                variant="secondary"
                onPress={() => popIfTop(navigation, 'BillingInformationView')}
              />
              <MgaButton
                trackingId="BillingInformationSave"
                isLoading={isSaving}
                flex={1}
                title={t('common:save')}
                variant="primary"
                onPress={async () => {
                  setSaving(true)
                  await formRef.current?.submit()
                  setSaving(false)
                }}
              />
            </CsfView>
          )}
        </CsfView>
      </CsfView>
    </MgaPage>
  )
}
