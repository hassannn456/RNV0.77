/* eslint-disable camelcase */
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { checkCC } from '../../utils/cc'
import { validate } from '../../utils/validate'
import { isValidPostalCode } from '../../utils/postalCode'
import { regions } from '../../utils/regions'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import {
  AriaBillingDetails,
  postAriaBilling,
} from '../../api/manageEnrollment.api'
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller'
import { tomTomFindByPostalCode } from '../../features/geolocation/tomtom.api'
import { isCurrentVehicleRightToRepairByState } from '../../features/menu/rules'
import { cNetworkError } from '../../api'
import { testID } from '../../components/utils/testID'
import { MgaFormProps } from '../../components'
import { alertBadConnection } from '../../components/MgaBadConnectionCard'
import promptAlert from '../../components/CsfAlert'
import MgaForm from '../../components/MgaForm'
import CsfCard from '../../components/CsfCard'
import CsfView from '../../components/CsfView'
import CsfCreditCardNumberInput from '../../components/CsfCreditCardNumberInput'
import CsfCreditCardExpInput, { extractCCExp } from '../../components/CsfCreditCardExpInput'
import CsfText from '../../components/CsfText'
import { CsfCheckBox } from '../../components/CsfCheckbox'
import CsfFocusedEdit from '../../components/CsfFocusedEdit'
import MgaButton from '../../components/MgaButton'

export interface BillingInformationParams {
  ariaDirectPostUrl: string
  paymentMethod: AriaBillingDetails
}

export type MgaPaymentInformationFormProps = Omit<
  MgaFormProps,
  'fields' | 'trackingId' | 'onCancel' | 'onSubmit'
> & {
  ariaDirectPostUrl?: string | null
}

export interface MgaPaymentInformationFormRef {
  validate: () => boolean
  submit: (routing?: Partial<AriaBillingDetails>) => Promise<boolean>
}

/** Range of valid CC expiration months (01, 02, ...) */
const CCExpirationMonths: string[] = Array(12)
  .fill(0, 0, 12)
  .map((_, i) => (i + 1).toString().padStart(2, '0'))

export const MgaPaymentInformationForm = forwardRef<
  MgaPaymentInformationFormRef,
  MgaPaymentInformationFormProps
>(({ ariaDirectPostUrl, initialValues, ...formProps }, ref) => {
  const { t } = useTranslation()
  const id = testID('PaymentInformationForm')
  const [state, setState] = useState(initialValues as AriaBillingDetails)
  const vehicle = useCurrentVehicle()
  const sessionCustomer = vehicle?.customer.sessionCustomer
  const [showErrors, setShowErrors] = useState(false)
  const errors = validate(
    state,
    {
      cc_no: {
        required: true,
        custom: {
          creditCardNumber: () => !!state.cc_no && !checkCC(state.cc_no),
        },
      },
      cvv: {
        required: true,
        digits: true,
      },
      cc_exp_mm: {
        required: true,
        digits: true,
        custom: {
          month: () =>
            state.cc_exp_mm != '' &&
            !CCExpirationMonths.includes(state.cc_exp_mm),
        },
      },
      cc_exp_yyyy: {
        required: true,
        digits: true,
        custom: {
          past: () => {
            if (state.cc_exp_mm.length == 0) return false
            if (state.cc_exp_yyyy.length == 0) return false
            const now = new Date()
            const now_year = now.getFullYear()
            const now_month = now.getMonth() + 1
            const cc_year = parseInt(state.cc_exp_yyyy)
            const cc_month = parseInt(state.cc_exp_mm)
            return (
              cc_year < now_year ||
              (cc_year == now_year && cc_month < now_month)
            )
          },
        },
      },
      bill_first_name: {
        required: true,
        alphanumericSpace: true,
      },
      bill_last_name: {
        required: true,
        alphanumericSpace: true,
      },
      bill_address1: {
        required: true,
        alphanumericSpace: true,
      },
      bill_address2: 'alphanumericSpace',
      bill_city: {
        required: true,
        alphanumericSpace: true,
      },
      bill_state_prov: 'required',
      bill_postal_cd: {
        required: true,
        custom: {
          zipCode: () =>
            !!state.bill_postal_cd &&
            // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed
            // eslint-disable-next-line
            !isValidPostalCode(null, state.bill_postal_cd),
        },
      },
    },
    (key, error) => {
      return t(
        `subscriptionEnrollment:paymentInformationFormValidateMessages.${key}.${error as string
        }`,
        { defaultValue: t(`validation:${error as string}`) },
      )
    },
  )
  const hasErrors = Object.keys(errors).length != 0
  const submit = async (
    routing?: Partial<AriaBillingDetails>,
  ): Promise<boolean> => {
    setShowErrors(true)
    if (hasErrors) return false
    if (!ariaDirectPostUrl) return false
    const request = routing ? { ...state, ...routing } : state
    const aria = await postAriaBilling(ariaDirectPostUrl, request)
    if (!aria.success) {
      const errors = aria.data
      const code =
        errors && errors.length > 0 ? errors[0].error_code : undefined
      if (code == cNetworkError) {
        alertBadConnection()
      } else {
        const message = (() => {
          switch (code) {
            case '6013':
              return t('subscriptionEnrollment:cvvNoMatch', { code: code })
            case '6020':
              return t('subscriptionEnrollment:zipCodeError', { code: code })
            case '6003':
            case '4011':
            default:
              return t('subscriptionEnrollment:genericCreditCardError', {
                code: code,
              })
          }
        })()
        // Prompt alert should not hold up return.
        // Failure may cause cancelPlans to fire in calling code
        promptAlert(t('common:error'), message).then().catch(console.error)
      }
      return aria.success
    }
    const location = await tomTomFindByPostalCode(request.bill_postal_cd)
    if (
      isCurrentVehicleRightToRepairByState(
        vehicle,
        location?.address.countrySubdivision,
      ) ||
      isCurrentVehicleRightToRepairByState(vehicle, request.bill_state_prov)
    ) {
      // Prompt alert should not hold up return.
      // Failure may cause cancelPlans to fire in calling code
      promptAlert(
        t('common:error'),
        t('subscriptionEnrollment:rightToRepairSelectState'),
      )
        .then()
        .catch(console.error)
      return false
    }
    return true
  }
  useImperativeHandle(ref, () => ({
    submit,
    validate: () => {
      setShowErrors(true)
      return !hasErrors
    },
  }))
  const isSameAsHome: boolean = (() => {
    if (!sessionCustomer) return false
    if (sessionCustomer.firstName != state.bill_first_name) return false
    if (sessionCustomer.lastName != state.bill_last_name) return false
    if (sessionCustomer.address != state.bill_address1) return false
    if (sessionCustomer.address2 != state.bill_address2) return false
    if (sessionCustomer.city != state.bill_city) return false
    if (sessionCustomer.state != state.bill_state_prov) return false
    if (sessionCustomer.zip5Digits != state.bill_postal_cd) return false
    return true
  })()
  const setSameAsHome = (value: boolean) => {
    if (!sessionCustomer) return
    setState({
      ...state,
      bill_first_name: value ? sessionCustomer.firstName ?? '' : '',
      bill_last_name: value ? sessionCustomer.lastName ?? '' : '',
      bill_address1: value ? sessionCustomer.address ?? '' : '',
      bill_address2: value ? sessionCustomer.address2 ?? '' : '',
      bill_city: value ? sessionCustomer.city ?? '' : '',
      bill_state_prov: value ? sessionCustomer.state ?? '' : '',
      // MGAS-77: Use zip to support Canada postal codes
      bill_postal_cd: value ? sessionCustomer.zip ?? '' : '',
    })
  }
  const r = (s: string) => {
    return s + ' *'
  }
  return (
    <MgaForm
      {...formProps}
      fields={[]}
      onSubmit={() => { }}
      trackingId="PaymentInformationForm">
      {/* Payment Information */}
      <CsfCard gap={8} title={t('billingInformation:paymentInformation')}>
        <CsfView flexDirection="row" gap={8}>
          <CsfView flex={16}>
            <CsfCreditCardNumberInput
              errors={showErrors && errors.cc_no}
              label={r(t('billingInformation:cardNumber'))}
              value={state.cc_no}
              onChangeText={text => setState({ ...state, cc_no: text })}
              testID={id('cardNumber')}
            />
          </CsfView>
          <CsfView flex={5}>
            <CsfInput
              errors={showErrors && errors.cvv}
              keyboardType="number-pad"
              label={r(t('billingInformation:cvv'))}
              maxLength={4}
              value={state.cvv}
              testID={id('cvv')}
              onChangeText={(text: any) => setState({ ...state, cvv: text })}
            />
          </CsfView>
        </CsfView>
        <CsfCreditCardExpInput
          errors={showErrors && (errors.cc_exp_mm || errors.cc_exp_yyyy)}
          label={r(t('billingInformation:expiration'))}
          value={state.cc_exp_mm + state.cc_exp_yyyy}
          onChangeText={(text: any) => {
            const [cc_exp_mm, cc_exp_yyyy] = extractCCExp(text)
            setState({ ...state, cc_exp_mm, cc_exp_yyyy })
          }}
          testID={id('expiration')}
        />
        <CsfText variant="caption" testID={id('cardBeCharged')}>
          {t('billingInformation:cardBeCharged')}
        </CsfText>
      </CsfCard>
      {/* Billing Information */}
      <CsfCard gap={8} title={t('billingInformation:title')}>
        <CsfCheckBox
          inline={false}
          label={t('billingInformation:sameHomeAddress')}
          checked={isSameAsHome}
          onChangeValue={setSameAsHome}
          testID={id('sameHomeAddress')}
        />
        <CsfInput
          errors={showErrors && errors.bill_first_name}
          label={r(t('common:firstName'))}
          maxLength={50}
          value={state.bill_first_name}
          onChangeText={(text: any) => setState({ ...state, bill_first_name: text })}
          testID={id('firstName')}
        />
        <CsfInput
          errors={showErrors && errors.bill_last_name}
          label={r(t('common:lastName'))}
          maxLength={50}
          value={state.bill_last_name}
          onChangeText={(text: any) => setState({ ...state, bill_last_name: text })}
          testID={id('lastName')}
        />
        <CsfInput
          errors={showErrors && errors.bill_address1}
          label={r(t('billingInformation:addressLine1'))}
          maxLength={120}
          value={state.bill_address1}
          onChangeText={(text: any) => setState({ ...state, bill_address1: text })}
          testID={id('addressLine1')}
        />
        <CsfInput
          errors={showErrors && errors.bill_address2}
          label={t('billingInformation:addressLine2')}
          maxLength={120}
          value={state.bill_address2}
          onChangeText={(text: any) => setState({ ...state, bill_address2: text })}
          testID={id('addressLine2')}
        />
        <CsfInput
          errors={showErrors && errors.bill_city}
          label={r(t('common:city'))}
          maxLength={120}
          value={state.bill_city}
          onChangeText={(text: any) => setState({ ...state, bill_city: text })}
          testID={id('city')}
        />
        <CsfSelect
          errors={showErrors && errors.bill_state_prov}
          label={r(t('geography:state'))}
          value={state.bill_state_prov}
          options={regions()}
          onSelect={(value: any) => setState({ ...state, bill_state_prov: value })}
          testID={id('state')}
        />
        <CsfInput
          errors={showErrors && errors.bill_postal_cd}
          label={r(t('geography:zipcode'))}
          value={state.bill_postal_cd}
          onChangeText={async (bill_postal_cd: string | undefined) => {
            setState({ ...state, bill_postal_cd })
            // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed
            // eslint-disable-next-line
            if (isValidPostalCode(null, bill_postal_cd)) {
              const result = await tomTomFindByPostalCode(bill_postal_cd)
              const bill_state_prov = result?.address.countrySubdivision
              if (bill_state_prov && bill_state_prov != state.bill_state_prov) {
                setState({ ...state, bill_state_prov, bill_postal_cd })
              }
            }
          }}
          testID={id('zip')}
        />
      </CsfCard>
    </MgaForm>
  )
})

export const MgaBillingInformationEdit: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const route = useAppRoute<'BillingInformationEdit'>()
  const [isSaving, setSaving] = useState(false)
  const formRef = useRef<MgaPaymentInformationFormRef>(null)
  const id = testID('BillingInformationEdit')

  return (
    <CsfFocusedEdit title={t('billingInformation:title')} testID={id()}>
      <CsfView edgeInsets standardSpacing>
        <MgaPaymentInformationForm
          ariaDirectPostUrl={route.params.ariaDirectPostUrl}
          initialValues={route.params.paymentMethod}
          ref={formRef}
        />
        {/* Actions */}
        <CsfView flexDirection="row" gap={16}>
          <CsfView flex={1}>
            <MgaButton
              trackingId="BillingInformationEditBack"
              variant="secondary"
              onPress={() => navigation.pop()}
              title={t('common:back')}
            />
          </CsfView>
          <CsfView flex={1}>
            <MgaButton
              trackingId="BillingInformationEditSave"
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
              title={t('common:save')}
            />
          </CsfView>
        </CsfView>
        {/* Caption */}
        <CsfText align="center" testID={id('adjustmentText')}>
          {t('trafficConnectManage:adjustmentText')}
        </CsfText>
      </CsfView>
    </CsfFocusedEdit>
  )
}
