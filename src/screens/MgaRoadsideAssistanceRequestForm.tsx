/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  roadsideAssistanceApi,
  RsaRequestInfo,
  useRoadsideAssistanceRequestMutation,
} from '../api/roadsideAssistance.api'
import { popIfTop, useAppNavigation } from '../Controller'
import { store } from '../store'
import { useCurrentVehicle } from '../features/auth/sessionSlice'
import { pingCurrentLocation } from '../features/geolocation/geolocation.slice'
import { tomTomGetAddressForLatLng } from '../features/geolocation/tomtom.api'
import { validPhone } from '../utils/phone'
import { isValidPostalCode } from '../utils/postalCode'
import { regions } from '../utils/regions'
import { checkAlphabetSpace, checkAlphanumericSpace } from '../utils/validate'
import { testID } from '../components/utils/testID'
import { checkMiddleInitial } from '../utils/name'
import { cNetworkError } from '../api'
import { CsfDropdownItem, CsfFormFieldFunctionPayload, CsfFormFieldList } from '../components'
import CsfCard from '../components/CsfCard'
import CsfSimpleAlert from '../components/CsfSimpleAlert'
import CsfText from '../components/CsfText'
import CsfView from '../components/CsfView'
import { alertBadConnection } from '../components/MgaBadConnectionCard'
import MgaButton from '../components/MgaButton'
import MgaForm from '../components/MgaForm'
import MgaPage from '../components/MgaPage'
import MgaPageContent from '../components/MgaPageContent'
import { successNotice } from '../components/notice'

const MgaRoadsideAssistanceRequestForm: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()
  const vehicle = useCurrentVehicle()
  const [request, _status] = useRoadsideAssistanceRequestMutation()
  const [isRefreshing, setRefreshing] = useState(false)
  const id = testID('RoadsideAssistanceForm')

  const initialValues: RsaRequestInfo = {
    roadsideAssistanceId: '',
    reasonCode: '',
    comment: '',
    firstName: vehicle?.firstName || '',
    middleInitial: '',
    lastName: vehicle?.lastName || '',
    phone: '',
    lat: 0,
    lng: 0,
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    notificationPreferenceCode: 'SMS',
    notificationEmail: '',
    notificationSmsPhone: '',
    notificationVoicePhone: '',
  }

  const reasonsForAssistance: CsfDropdownItem[] = [
    'Lockout_Keys_in_car',
    'Lockout_Keys_broken_missing',
    'Vehicle_Stuck',
    'Out_of_Fuel',
    'Accident_Vandalism',
    'One_Flat_Tire_Good_spare',
    'Multiple_Flat_Tires',
    'Tow_Not_leaking_fuel',
    'Jump_Start_Did_not_stall_while_driving',
    'Jump_Start_Stalled_while_driving',
    'Unknown_Problem',
  ].map(reason => ({
    label: t(`roadsideAssistance:${reason}`),
    value: reason,
  }))

  const fields: (arg0: CsfFormFieldFunctionPayload) => CsfFormFieldList = ({
    setValue,
  }) => {
    return [
      {
        name: 'reasonCode',
        type: 'select',
        options: reasonsForAssistance,
        label: t('roadsideAssistance:reasonForAssistanceForm'),
        rules: {
          required: {
            message: t('validation:required'),
          },
        },
        meta: 'add',
      },
      {
        name: 'comment',
        type: 'text',
        label: t('roadsideAssistance:detailsAboutYourNeeds'),
        componentProps: {
          maxLength: 500,
        },
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            message: t('validation:alphanumericSpace'),
            validator: (v: string): boolean => !v || checkAlphanumericSpace(v),
          },
        },
        meta: 'add',
      },
      {
        name: 'locationText',
        component: () => (
          <CsfText
            variant="heading"
            align="center"
            testID={id('contactInformation')}>
            {t('common:contactInformation')}
          </CsfText>
        ),
      },
      {
        name: 'firstName',
        label: t('authorizedUsers:firstName'),
        type: 'text',
        componentProps: {
          maxLength: 20,
        },
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            message: t('validation:alphanumericSpace'),
            validator: (v: string): boolean => !v || checkAlphanumericSpace(v),
          },
        },
      },
      {
        name: 'middleInitial',
        label: t('authorizedUsers:middleInitial'),
        type: 'text',
        componentProps: {
          maxLength: 1,
        },
        rules: {
          validate: {
            message: t('validation:alphaOnly'),
            validator: checkMiddleInitial,
          },
        },
      },
      {
        name: 'lastName',
        label: t('authorizedUsers:lastName'),
        type: 'text',
        componentProps: {
          maxLength: 20,
        },
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            message: t('validation:alphanumericSpace'),
            validator: (v: string) => !v || checkAlphanumericSpace(v),
          },
        },
      },
      {
        name: 'phone',
        label: t('roadsideAssistance:callbackNumber'),
        type: 'phone',
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            validator: validPhone,
            message: t('validation:required'),
          },
        },
        meta: 'add',
      },
      {
        name: 'getLocationText',
        component: () => (
          <CsfText
            variant="heading"
            align="center"
            testID={id('yourCurrentLocation')}>
            {t('roadsideAssistance:yourCurrentLocation')}
          </CsfText>
        ),
      },
      {
        name: 'getLocationButton',
        component: () => (
          <MgaButton
            trackingId="RoadsideAssistanceLocationButton"
            title={t('roadsideAssistance:getMyLocation')}
            onPress={async () => {
              const gps = await pingCurrentLocation()
              const addressLatLng = await tomTomGetAddressForLatLng(
                gps?.position?.coords?.latitude,
                gps?.position?.coords?.longitude,
              )
              if (addressLatLng) {
                setValue('lat', gps?.position?.coords?.latitude)
                setValue('lng', gps?.position?.coords?.longitude)
                setValue(
                  'address1',
                  addressLatLng?.addresses[0]?.address.streetNameAndNumber,
                )
                setValue(
                  'city',
                  addressLatLng?.addresses[0].address.localName != undefined
                    ? addressLatLng?.addresses[0].address.localName
                    : addressLatLng?.addresses[0].address.municipality,
                )
                setValue(
                  'state',
                  addressLatLng?.addresses[0]?.address.countrySubdivision,
                )
                setValue('zip', addressLatLng?.addresses[0]?.address.postalCode)
              }
            }}
          />
        ),
      },
      {
        name: 'address1',
        label: t('authorizedUsers:authorizedUserEdit.streetAddress1'),
        type: 'text',
        componentProps: {
          maxLength: 20,
        },
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            message: t('validation:alphanumericSpace'),
            validator: (v: string): boolean => !v || checkAlphanumericSpace(v),
          },
        },
      },
      {
        name: 'city',
        label: t('common:city'),
        type: 'text',
        rules: {
          required: {
            message: t('validation:required'),
          },
          validate: {
            message: t('validation:alphaSpace'),
            validator: (v: string): boolean => !v || checkAlphabetSpace(v),
          },
        },
      },
      {
        name: 'state',
        label: t('geography:state'),
        type: 'select',
        options: regions(),
        rules: {
          required: {
            message: t('validation:required'),
          },
        },
      },
      {
        name: 'zip',
        label: t('geography:zipcode'),
        type: 'text',
        rules: {
          validate: {
            // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed
            // eslint-disable-next-line
            validator: (v: unknown): boolean =>
              // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed
              // eslint-disable-next-line
              isValidPostalCode(null, v?.toString()),
            message: t('validation:zipCode'),
          },
          required: {
            message: t('validation:required'),
          },
        },
      },
    ]
  }

  return (
    <MgaPage title={t('branding:roadsideAssistance')} showVehicleInfoBar>
      <MgaPageContent title={t('branding:roadsideAssistance')}>
        <CsfView testID={id('container')}>
          <CsfText
            variant="heading"
            align="center"
            testID={id('whatsTheProblem')}>
            {t('roadsideAssistance:whatsTheProblem')}
          </CsfText>
          <CsfView testID={id('formContainer')}>
            <MgaForm
              trackingId="rsaRequestForm"
              initialValues={initialValues}
              fields={fields}
              cancelLabel={t('common:cancel')}
              submitLabel={t('roadsideAssistance:requestHelpNow')}
              isLoading={isRefreshing}
              onCancel={() => navigation.pop(1)}
              onSubmit={async function (data: RsaRequestInfo) {
                setRefreshing(true)
                const commonPayload = {
                  roadsideAssistanceId: '',
                  reasonCode: data?.reasonCode,
                  comment: data?.comment,
                  firstName: data?.firstName,
                  middleInitial: data?.middleInitial || '',
                  lastName: data?.lastName,
                  phone: data?.phone,
                  lat: data?.lat ?? 0,
                  lng: data?.lng ?? 0,
                  address1: data?.address1,
                  address2: '',
                  city: data?.city,
                  state: data?.state,
                  zip: data?.zip,
                  country: data?.country,
                  notificationPreferenceCode: data?.notificationPreferenceCode,
                  notificationEmail: '',
                  notificationSmsPhone: data?.phone,
                  notificationVoicePhone: '',
                }
                const response = await request(commonPayload).unwrap()
                if (response.success) {
                  await store.dispatch(
                    roadsideAssistanceApi.endpoints.roadsideAssistance.initiate(
                      undefined,
                    ),
                  )
                  successNotice({
                    subtitle: t('roadsideAssistance:rsaHasBeenRequested'),
                  })
                  popIfTop(navigation, 'RoadsideAssistanceRequestForm')
                } else if (response?.errorCode == cNetworkError) {
                  alertBadConnection()
                } else {
                  CsfSimpleAlert(
                    t('common:error'),
                    t('roadsideAssistance:errorSubmittingRsaRequest'),
                    { type: 'error' },
                  )
                }
                setRefreshing(false)
              }}></MgaForm>
          </CsfView>
          <CsfView testID={id('vehicleDetails')}>
            <CsfCard testID={id('vehicleDetailsCard')}>
              <CsfText variant="heading" testID={id('vinHeading')}>
                {t('common:vin')}
              </CsfText>
              <CsfText testID={id('vin')}>{vehicle?.vin}</CsfText>
              <CsfText variant="heading" testID={id('modelHeading')}>
                {t('common:model')}
              </CsfText>
              <CsfText testID={id('model')}>
                {vehicle?.modelYear} {vehicle?.modelName}
              </CsfText>
            </CsfCard>
          </CsfView>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  )
}

export default MgaRoadsideAssistanceRequestForm
