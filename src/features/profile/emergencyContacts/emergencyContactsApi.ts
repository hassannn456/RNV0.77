import { NormalResult } from '../../../../@types'
import {
  baseApi,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
} from '../../../api'

export interface EditEmergencyContact {
  emergencyContactId?: number
  firstName: string
  lastName: string
  middleInitial: string
  relationship: string
  relationshipPriority?: string
  phone: string
  phoneEdit?: string
  phoneType: string
}

export interface EmergencyContacts extends EditEmergencyContact {
  vehicleId: number
}

export interface DeleteEmergencyContact {
  emergencyContactId?: number
}

export const emergencyContactsEndpoints: (builder: MSAEndpointBuilder) => {
  emergencyContactsFetch: MSAQueryDefinition<
    undefined,
    NormalResult<EmergencyContacts[]>
  >
  updateSaveEmergencyContact: MSAMutationDefinition<
    EditEmergencyContact,
    NormalResult<boolean>
  >
  updateDeleteEmergencyContact: MSAMutationDefinition<
    DeleteEmergencyContact,
    NormalResult<boolean>
  >
} = builder => ({
  emergencyContactsFetch: builder.query({
    query: parameters => ({
      params: parameters,
      url: '/profile/emergencyContacts.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    providesTags: ['emergencyContact'],
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  updateSaveEmergencyContact: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/saveEmergencyContact.json',
      method: 'POST',
    }),
    invalidatesTags: ['emergencyContact'],
    extraOptions: { requires: ['session'] },
  }),
  updateDeleteEmergencyContact: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/deleteEmergencyContact.json',
      method: 'POST',
    }),
    invalidatesTags: ['emergencyContact'],
    extraOptions: { requires: ['session'] },
  }),
})

export const emergencyContactsApi = baseApi.injectEndpoints({
  endpoints: emergencyContactsEndpoints,
})
export const {
  useEmergencyContactsFetchQuery,
  useUpdateSaveEmergencyContactMutation,
  useUpdateDeleteEmergencyContactMutation,
} = emergencyContactsApi
