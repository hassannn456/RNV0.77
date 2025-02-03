// cSpell:ignore Cust
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { regions } from '../utils/regions';
import { checkName } from '../utils/name';
import { isValidPostalCode } from '../utils/postalCode';
import {
  AuthorizedUserInfo,
  DropdownValue,
  useAuthorizedUsersQuery,
  useUpdateSaveAuthorizedUserMutation,
} from '../features/profile/securitysettings/securitySettingsApi';
import { MSASuccess } from '../api';
import {
  featureFlagEnabled,
  has,
  isCurrentVehicleRightToRepairByState,
} from '../features/menu/rules';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  EmergencyContacts,
  useEmergencyContactsFetchQuery,
} from '../features/profile/emergencyContacts/emergencyContactsApi';
import { getAccessLevelOptions } from './MgaAuthorizedUserEdit';
import { getVehicleGeneration } from '../utils/vehicle';
import { CsfRadioGroupProps } from '../components/CsfRadioGroup';
import { tomTomFindByPostalCode } from '../features/geolocation/tomtom.api';
import { testID } from '../components/utils/testID';
import { checkAlphabetSpace } from '../utils/validate';
import { MgaFormItemProps } from '../components';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfFormInputView from '../components/CsfForm/CsfFormInputView';
import { CsfRadioButton } from '../components/CsfRadioButton';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';

//TODO: VV:20240122 - Cleanup the custom component
// Once the clickable Radio Group Accordion is available.
export interface CsfCustomRadioGroupProps extends CsfRadioGroupProps {
  features?: string[]
  testID?: string
}
export const CsfCustomRadioGroup: React.FC<
  CsfCustomRadioGroupProps
> = props => {
  const id = testID(props.testID);
  const { disabled, options, value, features, onChange, ...formProps } = props;
  return (
    <CsfFormInputView {...formProps} gap={0} testID={id()}>
      {options &&
        options.map((e, i) => (
          <CsfView key={i}>
            <CsfRadioButton
              label={e.label}
              value={e.value}
              disabled={disabled}
              testID={id(`option-${i}`)}
              onChangeValue={value => {
                onChange && onChange(value);
              }}
              selected={value}
            />
            {features && features[i] && (
              <CsfText testID={id(`featureText-${i}`)}>{features[i]}</CsfText>
            )}
          </CsfView>
        ))}
    </CsfFormInputView>
  );
};

const MgaAuthorizedUserAdd: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vehicleGeneration = getVehicleGeneration(vehicle);
  const isGen1Safety = has(['cap:g1', 'sub:SAFETY'], vehicle);
  const [request, status] = useUpdateSaveAuthorizedUserMutation();
  const emergencyContactsQuery = useEmergencyContactsFetchQuery(undefined);
  const { data: response } = emergencyContactsQuery;
  const emergencyContactsData: EmergencyContacts[] = response?.data || [];
  const route = useAppRoute<'AuthorizedUserEdit'>();
  const relationsData: DropdownValue[] = route.params?.relationData;
  const action: string = route.params?.action;
  const nameTitles =
    useAuthorizedUsersQuery(undefined).data?.data.nameTitles ?? [];

  const id = testID('AuthorizedUserAdd');

  const initialValues = {
    title: 'N/A',
    firstName: '',
    lastName: '',
    email: '',
    emailConfirm: '',
    phone: '',
    streetAddress1: '',
    city: '',
    state: '',
    postalCode: '',
    accessLevel: '1',
    emergencyContact: false,
    emergencyContactRelationShip: '',
  };

  const generalFields: MgaFormItemProps[] = [
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
          validator: checkName,
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
          validator: checkName,
        },
      },
    },
    {
      name: 'email',
      label: t('authorizedUsers:authorizedUserEdit.emailAddress'),
      type: 'email',
      rules: {
        email: {
          message: t('validation:email'),
        },
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'emailConfirm',
      label: t('authorizedUsers:authorizedUserEdit.confirmEmailAddress'),
      type: 'email',
      rules: {
        required: {
          message: t('validation:required'),
        },
        equalsField: {
          message: t('validation:equalTo', {
            label: t('authorizedUsers:authorizedUserEdit.emailAddress'),
          }),
          value: 'email',
        },
      },
    },
  ];
  // MGAS-15
  if (featureFlagEnabled('mga.authorizedUsers.gender')) {
    generalFields.unshift({
      name: 'gender',
      placeholder: t('common:selectGender'),
      type: 'select',
      label: t('common:gender'),
      options: [
        { label: t('common:male'), value: 'Male' },
        { label: t('common:female'), value: 'Female' },
        { label: t('common:other'), value: 'Other' },
      ],
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    });
  }
  if (nameTitles && featureFlagEnabled('mga.authorizedUsers.title')) {
    generalFields.unshift({
      name: 'title',
      type: 'select',
      label: t('common:title'),
      options: nameTitles.map(t => ({ label: t, value: t })),
    });
  }

  const gen2PlusFields: MgaFormItemProps[] = [
    {
      name: 'phone',
      label: t('authorizedUsers:authorizedUserEdit.mobilePhone'),
      type: 'phone',
      rules: {
        required: {
          message: t('validation:required'),
        },
        phone: {
          message: t('validation:phone'),
        },
      },
    },
    {
      name: 'streetAddress1',
      label: t('authorizedUsers:authorizedUserEdit.streetAddress1'),
      type: 'text',
      rules: {
        required: {
          message: t('validation:required'),
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
          validator: v => checkAlphabetSpace(v as string),
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
      name: 'postalCode',
      label: t('geography:zipcode'),
      type: 'text',
      rules: {
        validate: {
          validator: (v: string | undefined): boolean =>
            // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed

            isValidPostalCode(null, v?.toString()),
          message: t('validation:zipCode'),
        },
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'accessLevel',
      type: 'radio',
      componentProps: {},
      component: (props: CsfCustomRadioGroupProps) => (
        <CsfCustomRadioGroup
          {...props}
          testID={id('levelRadioGroup')}
          features={[
            getAccessLevelOptions('level1', vehicle, vehicleGeneration).join(
              '\n',
            ),
            getAccessLevelOptions('level2', vehicle, vehicleGeneration).join(
              '\n',
            ),
          ]}
        />
      ),
      label: t('authorizedUsers:accessLevel'),
      options: [
        {
          label: t('authorizedUsers:level1Access'),
          value: '1',
        },
        {
          label: t('authorizedUsers:level2Access'),
          value: '2',
        },
      ],
    },
  ];

  if (emergencyContactsData?.length < 3) {
    gen2PlusFields.push({
      name: 'emergencyContact',
      type: 'checkbox',
      label: t('authorizedUsers:authorizedUserEdit.addContacts'),
      componentProps: {
        onChangeValue: (ev: boolean) => handleEmergencyContact(ev),
      },
    });
  }

  const initialFields = !isGen1Safety
    ? [...generalFields, ...gen2PlusFields]
    : generalFields;

  const [fieldsToRender, setFieldsToRender] = useState(initialFields);
  const [defaultValues, setDefaultValues] = useState(initialValues);

  const additionalFields: MgaFormItemProps[] = [
    {
      name: 'emergencyContactRelationShip',
      label: t('authorizedUsers:authorizedUserEdit.relationship'),
      type: 'select',
      options: relationsData,
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'addToEmergencyContact',
      type: 'checkbox',
      label: t('authorizedUsers:authorizedUserEdit.setContacts'),
    },
  ];

  const handleEmergencyContact = (ev: boolean) => {
    if (ev) {
      const combinedFieldsToRender = fieldsToRender.concat(additionalFields);
      const combinedInitialValues = {
        ...initialValues,
        addToEmergencyContact: false,
      };
      setDefaultValues({ ...combinedInitialValues });
      setFieldsToRender([...combinedFieldsToRender]);
    } else {
      setDefaultValues(initialValues);
      setFieldsToRender([...initialFields]);
    }
  };

  return (
    <MgaPage title={t('authorizedUsers:addUser')} focusedEdit>
      <MgaPageContent
        isLoading={
          emergencyContactsQuery.isFetching || emergencyContactsQuery.isLoading
        }>
        {featureFlagEnabled('mga.authorizedUsers.disclaimer') && (
          <CsfAlertBar
            title={t('authorizedUsers:confirmationMsgToAddUser')}
            flat
            icon={<CsfAppIcon icon="Information" color="button" />}
          />
        )}
        <MgaForm
          initialValues={defaultValues}
          trackingId={'AddAuthorizedUser'}
          fields={fieldsToRender}
          cancelLabel={t('common:cancel')}
          submitLabel={t('common:submit')}
          onCancel={() => navigation.pop(2)}
          isLoading={status.isLoading}
          onSubmit={async (data: AuthorizedUserInfo) => {
            const location = await tomTomFindByPostalCode(data.postalCode);
            if (
              isCurrentVehicleRightToRepairByState(
                vehicle,
                location?.address.countrySubdivision,
              ) ||
              isCurrentVehicleRightToRepairByState(vehicle, data.state)
            ) {
              CsfSimpleAlert(
                t('authorizedUsers:authorizeUserReview:addUser'),
                t(
                  'authorizedUsers:authorizedUserEdit.rightToRepairSelectState',
                ),
                {
                  type: 'warning',
                },
              );
              return false;
            }
            const sharedPayload = {
              ...data,
              accessLevel: Number(data?.accessLevel),
              action,
              vehicleAuthorizedAccountKey: '',
            };
            let payload = { ...sharedPayload };
            if (data?.emergencyContact) {
              payload = {
                ...payload,
                addToEmergencyContact: 'Y',
              };
            }
            if (data?.addToEmergencyContact) {
              payload = {
                ...payload,
                relPriority: '1',
              };
            }
            try {
              const successResponse: MSASuccess =
                await request(payload).unwrap();
              if (successResponse?.success) {
                navigation.navigate('AuthorizedUsers');
                successNotice({
                  title: t('common:success'),
                  subtitle: t('authorizedUsers:userSaved'),
                });
              } else {
                if (successResponse?.errorCode) {
                  switch (successResponse.errorCode) {
                    case 'invalidMarket':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t('authorizedUsers:authorizedUserEdit.invalidMarket'),
                        { type: 'error' },
                      );
                      return;
                    case 'AUTH_USER_EMAIL_SHOULD_NOT_SAME_AS_PRIMARY':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.AUTH_USER_EMAIL_SHOULD_NOT_SAME_AS_PRIMARY',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'EXISTING_INACTIVE_AUTH_USER_ACCOUNT':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.EXISTING_INACTIVE_AUTH_USER_ACCOUNT',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'alreadyAuthorized':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.alreadyAuthorized',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'rightToRepairSelectState':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.rightToRepairSelectState',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'errorCreateAuthUser':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorCreateAuthUser',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'errorSamePrimaryCustId':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorSamePrimaryCustId',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'errorSaveAuthUser':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorSaveAuthUser',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'errorUpdateAuthUser':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorUpdateAuthUser',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'errorCreateEmergencyContact':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorCreateEmergencyContact',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'maxEmergencyContact':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.maxEmergencyContact',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'numberExistsEmergencyContact':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.numberExistsEmergencyContact',
                        ),
                        { type: 'error' },
                      );
                      return;
                    case 'activeSubscription':
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorCreateEmergencyContact',
                        ),
                        { type: 'error' },
                      );
                      return;
                    default: {
                      CsfSimpleAlert(
                        t('common:failed'),
                        t(
                          'authorizedUsers:authorizedUserEdit.errorSaveAuthUser',
                        ),
                        { type: 'error' },
                      );
                      return;
                    }
                  }
                } else {
                  CsfSimpleAlert(
                    t('common:failed'),
                    t('authorizedUsers:authorizedUserEdit.errorSaveAuthUser'),
                    { type: 'error' },
                  );
                }
              }
            } catch (error) {
              CsfSimpleAlert(
                t('common:failed'),
                t('authorizedUsers:authorizedUserEdit.errorSaveAuthUser'),
                { type: 'error' },
              );
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAuthorizedUserAdd;
