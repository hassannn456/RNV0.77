/* eslint-disable no-void */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { store } from '../store';
import { navigate, useAppNavigation, useAppRoute } from '../Controller';
import { formatPhone, validPhone } from '../utils/phone';
import { useEmergencyContactsQuery } from '../features/profile/securitysettings/securitySettingsApi';
import {
  EditEmergencyContact,
  EmergencyContacts,
  emergencyContactsApi,
  useUpdateSaveEmergencyContactMutation,
} from '../features/profile/emergencyContacts/emergencyContactsApi';
import { NormalResult } from '../../@types';
import { promptManagerFactory, ConditionalPrompt } from '../utils/controlFlow';
import { checkMiddleInitial } from '../utils/name';
import {
  updateVehicleAccountAttribute,
  selectVehicleAccountAttribute,
  VehicleAttributePayloads,
} from '../api/userAttributes.api';
import { trackError } from '../components/useTracking';
import { has } from '../features/menu/rules';
import { MgaFormItemProps } from '../components';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';

const promptManager = promptManagerFactory('AddEmergencyContact', navigate);

//TODO:MN:20241008 Remove `emergencyContactPromptIfNeeded` once `appStartupSequence` flag is retired.
let nid = 0;
let receivers: {
  id: number
  resolver: (value: NormalResult<boolean>) => void
}[] = [];
export const showAddEmergencyContact = async (): Promise<
  NormalResult<boolean>
> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('AddEmergencyContact', {
      id: nid,
      action: 'add',
      availableContacts: 0,
    });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

export const MgaAddEmergencyContact: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'AddEmergencyContact'>();
  const initialData: EmergencyContacts = route.params?.data;
  const action = route.params?.action;
  const emergencyContacts = useEmergencyContactsQuery();
  const [isLoadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [request, status] = useUpdateSaveEmergencyContactMutation();

  const noAvailableContacts = route.params?.availableContacts === 0;
  const hasAvailableContacts = route.params?.availableContacts > 0;
  const isPrompt = !!route.params?.id;
  const onlyOneContactAvailable =
    route.params?.availableContacts === 1 && action === 'edit';

  useEffect(() => {
    if (isPrompt) {
      const send = () =>
        promptManager.send(route.params.id, {
          success: true,
          data: null,
          dataName: null,
          errorCode: null,
        });
      const fetchContacts = async () => {
        setLoadingContacts(true);
        const request =
          emergencyContactsApi.endpoints.emergencyContactsFetch.initiate(
            undefined,
          );
        const response = await store.dispatch(request).unwrap();

        if (response.success && response.data?.length) {
          void updateVehicleAccountAttribute(
            'mga.account.emergencyContactPrompt',
            true,
          );
          send();
        }

        if (!response.success) { send(); } // keep moving if emergency contact request blows up.

        setLoadingContacts(false);
      };
      void fetchContacts();
    }

    navigation.setOptions({
      // Hides back button if presented modally
      headerBackVisible: !disableBack(),
    });
  }, []);

  const disableBack = (): boolean => {
    if (route.params.id && noAvailableContacts) {
      return true;
    }
    return false;
  };

  const phoneType: Record<string, string>[] = [
    {
      value: 'Mobile',
      label: t('emergencyContacts:emergencyContactsEdit.mobile'),
    },
    {
      value: 'Home',
      label: t('emergencyContacts:emergencyContactsEdit.home'),
    },
    {
      value: 'Work',
      label: t('emergencyContacts:emergencyContactsEdit.work'),
    },
  ];
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'firstName',
      label: t('authorizedUsers:firstName'),
      type: 'text',
      componentProps: {
        maxLength: 30,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
        alphanumericSpace: {
          message: t('validation:alphanumericSpace'),
        },
      },
    },
    {
      name: 'middleInitial',
      label: t('emergencyContacts:emergencyContactsEdit.mi'),
      type: 'text',
      componentProps: {
        maxLength: 1,
      },
      rules: {
        validate: {
          validator: checkMiddleInitial,
        },
      },
    },
    {
      name: 'lastName',
      label: t('authorizedUsers:lastName'),
      type: 'text',
      componentProps: {
        maxLength: 30,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
        alphanumericSpace: {
          message: t('validation:alphanumericSpace'),
        },
      },
    },
    {
      name: 'relationship',
      label: t('authorizedUsers:authorizedUserEdit.relationship'),
      type: 'select',
      options: emergencyContacts,
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'phone',
      type: 'phone',
      label: t('emergencyContacts:emergencyContactsLanding.phone'),
      componentProps: {},
      rules: {
        required: {
          message: t('validation:required'),
        },
        phone: {
          message: t('validation:phone'),
        },
        validate: {
          message: t(
            'emergencyContacts:emergencyContactsLanding.contactInfoFormValidateMessages.phone',
          ),
          validator: validPhone,
        },
      },
    },
    {
      name: 'phoneType',
      label: t('emergencyContacts:emergencyContactsLanding.phoneType'),
      type: 'select',
      options: phoneType,
    },
    {
      name: 'relationshipPriority',
      label: t('emergencyContacts:emergencyContactsEdit.setPrimaryContact'),
      type: 'checkbox',
      componentProps: {
        editable: !(noAvailableContacts || onlyOneContactAvailable),
      },
    },
  ];

  const relationshipPriority =
    Number(initialData?.relationshipPriority) === 1 || noAvailableContacts;

  return (
    <MgaPage
      focusedEdit
      title={isLoadingContacts && isPrompt ? '' : t('emergencyContacts:title')}
      disableHardwareBack={disableBack()}
      isLoading={isLoadingContacts}>
      <MgaPageContent isLoading={isLoadingContacts}>
        <MgaForm
          initialValues={{
            firstName: initialData?.firstName || '',
            lastName: initialData?.lastName || '',
            middleInitial: initialData?.middleInitial || '',
            phone: initialData?.phone || '',
            phoneType: initialData
              ? initialData?.phoneType || ''
              : phoneType[0].value,
            relationship: initialData?.relationship || '',
            relationshipPriority,
          }}
          trackingId={'addOrEditEmergencyContact'}
          cancelLabel={
            isPrompt
              ? t('biometrics:skipForNow')
              : hasAvailableContacts
                ? t('common:cancel')
                : undefined
          }
          submitLabel={t('common:save')}
          onCancel={
            isPrompt
              ? () => {
                promptManager.send(route.params.id, {
                  data: null,
                  dataName: null,
                  errorCode: null,
                  success: true,
                });
              }
              : hasAvailableContacts
                ? () => navigation.goBack()
                : undefined
          }
          fields={fieldsToRender}
          isLoading={status.isLoading}
          onSubmit={async (data: EmergencyContacts) => {
            const commonPayload = {
              firstName: data?.firstName,
              lastName: data?.lastName,
              middleInitial: data?.middleInitial || '',
              phone: data?.phone,
              phoneType: data?.phoneType,
              relationship: data?.relationship,
            };
            const addEditPayload = initialData?.emergencyContactId
              ? {
                ...commonPayload,
                emergencyContactId: initialData.emergencyContactId,
                phoneEdit: formatPhone(data.phone?.toString() || ''),
              }
              : commonPayload;

            const payload: EditEmergencyContact = data?.relationshipPriority
              ? {
                ...addEditPayload,
                relationshipPriority: '1',
              }
              : addEditPayload;
            try {
              const response: NormalResult<boolean> =
                await request(payload).unwrap();
              if (response?.success) {
                // update the flag if it's false so we don't get double hit
                if (
                  !selectVehicleAccountAttribute(
                    'mga.account.emergencyContactPrompt',
                  )
                ) {
                  void updateVehicleAccountAttribute(
                    'mga.account.emergencyContactPrompt',
                    true,
                  );
                }
                if (!route.params.id) {
                  navigation.navigate('EmergencyContacts');
                  if (data.emergencyContactId) {
                    successNotice({
                      title: t('common:success'),
                      subtitle: t(
                        'emergencyContacts:emergencyContactPrompt.contactInformationUpdated',
                      ),
                    });
                  } else {
                    successNotice({
                      title: t('common:success'),
                      subtitle: t(
                        'emergencyContacts:emergencyContactPrompt.successTitle',
                      ),
                    });
                  }
                } else {
                  promptManager.send(route.params.id, response);
                }
              } else {
                const message: string =
                  response?.data === 'numberAlreadyAdded'
                    ? t(
                      'emergencyContacts:emergencyContactsEdit.numberAlreadyAdded',
                    )
                    : t(
                      'authorizedUsers:authorizedUserEdit.errorCreateEmergencyContact',
                    );
                CsfSimpleAlert(t('common:failed'), message, { type: 'error' });
              }
            } catch (error) {
              CsfSimpleAlert(
                t('common:failed'),
                t(
                  'authorizedUsers:authorizedUserEdit.errorCreateEmergencyContact',
                ),
                { type: 'error' },
              );
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export const emergencyContactPrompt: ConditionalPrompt = {
  displayName: 'emergencyContact',
  predicate: () => {
    const emergencyContactAttributes =
      selectVehicleAccountAttribute('mga.account.emergencyContactPrompt') || '';
    if (!emergencyContactAttributes && has('usr:primary')) { return true; }
    let skipPrompt: VehicleAttributePayloads['mga.account.emergencyContactPrompt'] =
      false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      skipPrompt = JSON.parse(emergencyContactAttributes);
    } catch (error) {
      console.error('Failed to parse emergencyContactAttributes ', error);
      trackError(
        'MgaAddEmergencyContact.tsx::emergencyContactPrompt/predicate',
      )(error);
    }

    return !skipPrompt;
  },
  userInputFlow: async () => {
    return await promptManager.show({
      action: 'add',
      availableContacts: 0,
    });
  },
};
