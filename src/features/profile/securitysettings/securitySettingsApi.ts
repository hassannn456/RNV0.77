import { useTranslation } from 'react-i18next'
import { NormalResult } from '../../../../@types'
import {
  baseApi,
  MSAEndpointBuilder,
  MSASuccess,
  MSAMutationDefinition,
  MSAQueryDefinition,
} from '../../../api'
import { trackError } from '../../../components/useTracking'
import { CsfDropdownItem } from '../../../components'

export interface DropdownValue {
  label: string | undefined
  value: string | undefined
}

export interface EmergencyResponse {
  createdDate: string
  displayOrder: number
  modifiedDate: string
  name: string
  referenceKey: number
  type: string
  value: string
}

export interface EmergencyResponses {
  data: EmergencyResponse[]
}

export interface ForgotPinRequest {
  contactMethod: string
  verificationCode: string
  pin: string | undefined
}

export interface ValidatePasswordRequest {
  password: string
}

export type ContactMethodConfirm = {
  phone?: string
  userName?: string
  email?: string
  pin?: string
  biometrics?: boolean
  rememberPin?: boolean
}

export interface AuthorizedUser {
  accountId: number
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  phone: string
  timeZone: string
  city: string
  postalCode: string
  state: string
  country: string
  addToEmergencyContact?: string
  emergencyContactRelationShip: string
  emergencyContactAsPrimary: string
  oemCustIdAU: string
  contactId: string
  deactivatedCellFlag: string
  streetAddress1: string
  streetAddress2: string
  relationTypeDesc: string
  relPriority: number
  statusDesc: string
  accessLevel: number
  memberUID: string
  genType: string
  vehicleAuthorizedAccountKey?: number
  vehicleId: string
  title: string
  gender: string
  suffix: string
}

export interface AuthorizedUsers {
  authorizedUsers: AuthorizedUser[]
  emergencyContactSize: number
  genType: number
  nameTitles: string[]
}

export interface AuthorizedUsersResponse {
  success: true
  data: AuthorizedUsers
  dataName: string
  errorCode: string
}

export interface AuthorizedUserInfo {
  firstName: string
  lastName: string
  email: string
  emailConfirm: string
  phone: string
  streetAddress1: string
  city: string
  state: string
  postalCode: string
  accessLevel: number | string
  emergencyContact: boolean
  addToEmergencyContact?: string
  emergencyContactRelationShip: string
  vehicleAuthorizedAccountKey?: string | number
  relPriority?: string
}

export interface EditAuthorizedUserInfo {
  accessLevel: number | string
  vehicleAuthorizedAccountKey?: number
}

export interface EditAuthorizedUser {
  vehicleAuthorizedAccountKey?: number
}

export const securitySettingsEndpoints: (builder: MSAEndpointBuilder) => {
  updateSaveAuthorizedUser: MSAMutationDefinition<
    AuthorizedUserInfo | EditAuthorizedUserInfo,
    MSASuccess
  >
  updateDeleteAuthorizedUser: MSAMutationDefinition<
    EditAuthorizedUser,
    MSASuccess
  >
  forgotPin: MSAMutationDefinition<ForgotPinRequest, MSASuccess>
  authorizedUsers: MSAQueryDefinition<undefined, AuthorizedUsersResponse>
  editAuthorizedUsers: MSAQueryDefinition<
    EditAuthorizedUser,
    NormalResult<AuthorizedUser>
  >
  validatePassword: MSAMutationDefinition<ValidatePasswordRequest, MSASuccess>
  emergencyContacts: MSAQueryDefinition<undefined, MSASuccess>
} = builder => ({
  updateSaveAuthorizedUser: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/authorized/createOrSaveAuthorizedUser.json',
      method: 'POST',
    }),
    invalidatesTags: ['authorizedUsers', 'emergencyContact'],
    extraOptions: { requires: ['session', 'timestamp'] },
  }),
  updateDeleteAuthorizedUser: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/authorized/deleteAuthorizedUser.json',
      method: 'POST',
    }),
    invalidatesTags: ['authorizedUsers', 'emergencyContact'],
    extraOptions: { requires: ['session', 'timestamp'] },
  }),

  forgotPin: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/twoStepAuthVerify.json',
      method: 'POST',
    }),
    extraOptions: { requires: ['session', 'timestamp'] },
  }),
  authorizedUsers: builder.query({
    query: () => ({
      url: '/authorized/authorizedUsers.json',
      method: 'GET',
    }),
    providesTags: ['authorizedUsers'],
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  editAuthorizedUsers: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'authorized/editAuthorizedUser.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  validatePassword: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/authorized/validateAuthorizedUserAccess.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
})
export const securitySettingsApi = baseApi.injectEndpoints({
  endpoints: securitySettingsEndpoints,
})

export const {
  useUpdateSaveAuthorizedUserMutation,
  useUpdateDeleteAuthorizedUserMutation,
  useAuthorizedUsersQuery,
  useEditAuthorizedUsersQuery,
  useForgotPinMutation,
  useValidatePasswordMutation,
} = securitySettingsApi

/** Hook to provide a list of contact names (parent, child, spouse, etc...) for a dropdown. */
export const useEmergencyContactsQuery = (): CsfDropdownItem[] => {
  const { t } = useTranslation()
  const content = t('emergencyContactRelationships:data', {
    returnObjects: true,
  }) as unknown as EmergencyResponse[]
  if (!Array.isArray(content)) {
    trackError('useEmergencyContactsQuery')('content::notArray')
    return []
  }
  const options = content
    .filter(tz => tz.name && tz.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((tz: EmergencyResponse) => ({ label: tz.name, value: tz.value }))
  return options
}
