/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommonPreference,
  PreferenceFormData,
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../features/starlinkcommunications/starlinkcommunications.api';
import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { MSASuccess } from '../api';
import { useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { MgaFormProps, MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfButton from '../components/CsfButton';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';

const MgaRemoteServiceCommunicationGen1: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { data, isFetching } = useNotificationPreferencesQuery({
    vin: vehicle?.vin,
  });
  const [request, status] = useUpdateNotificationPreferencesMutation();
  const isLoading = status.isLoading;

  const [disabled, setDisabled] = useState(true);
  const preferences = data?.data;

  const isGen1Safety = has(['cap:g1', 'sub:SAFETY'], vehicle);
  const isGen1SafetyRemote = has(
    ['cap:g1', 'sub:SAFETY', 'sub:REMOTE'],
    vehicle,
  );

  interface CustomComponentProps extends MgaFormProps {
    value: string | number
    title: string
    onChange: (
      e: NativeSyntheticEvent<TextInputChangeEventData> | string,
    ) => void
  }

  const CsfTitle = (props: CustomComponentProps) => (
    <CsfText {...props} variant="heading">
      {props.title}
    </CsfText>
  );

  const emailAndSms: Record<string, string>[] = [
    { label: t('common:email'), value: 'EMAIL' },
    { label: t('common:sms'), value: 'SMS' },
  ];

  const getFields = () => {
    let communicationsFields: MgaFormItemProps[] = [];

    if (isGen1Safety) {
      communicationsFields = [
        {
          name: 'vehicleHealthPreference',
          label: t('remoteServiceCommunications:vehicleHealthPreferences'),
          meta: 'header',
          componentProps: {
            title: t('remoteServiceCommunications:vehicleHealthPreferences'),
          },
          component: (props: CustomComponentProps) => <CsfTitle {...props} />,
        },
        {
          name: 'emailCommunications',
          label: t('remoteServiceCommunications:emailCommunicationsSentTo'),
          component: (props: CustomComponentProps) => (
            <>
              <CsfText variant="body" {...props}>
                {t('remoteServiceCommunications:emailCommunicationsSentTo')}{' '}
                {'\n'}
              </CsfText>
              <CsfText bold {...props}>
                {preferences?.siebelEmail}
              </CsfText>
            </>
          ),
        },
        {
          name: 'editProfile',
          label: t('remoteServiceCommunications:change'),
          meta: 'confirmation',
          componentProps: {
            onPress: () => navigation.navigate('MyProfileView'),
            title: t('remoteServiceCommunications:change'),
            variant: 'link',
          },
          component: (props: CustomComponentProps) => <CsfButton {...props} />,
        },
      ];
    }
    if (isGen1SafetyRemote) {
      communicationsFields = [
        {
          name: 'primaryEmail',
          label: t('common:email'),
          type: 'email',
          rules: {
            required: {
              message: t('validation:required'),
            },
            email: {
              message: t('validation:email'),
            },
          },
        },
        {
          name: 'primaryEmailConfirm',
          label: t('remoteServiceCommunications:confirmEmailAddress'),
          type: 'email',
          meta: 'confirmation',
          rules: {
            required: {
              message: t('validation:required'),
            },
            equalsField: {
              message: t('validation:equalTo', {
                label: t('common:email'),
              }),
              value: 'primaryEmail',
            },
            email: {
              message: t('validation:email'),
            },
          },
        },
        {
          name: 'additionalEmail',
          label: t('remoteServiceCommunications:additionalEmail'),
          type: 'email',
        },
        {
          name: 'additionalEmailConfirm',
          label: t('remoteServiceCommunications:confirmEmailAddress'),
          type: 'email',
          meta: 'confirmation',
        },
        {
          name: 'smsPhone1',
          type: 'phone',
          label: t('remoteServiceCommunications:mobilePhone'),

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
          name: 'smsPhone2',
          label: t('remoteServiceCommunications:additionalMobilePhone'),
          type: 'phone',
        },
        {
          name: 'primaryPhone',
          label: t('remoteServiceCommunications:primaryPhone'),
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
          name: 'secondaryPhone',
          label: t('remoteServiceCommunications:additionalPhone1'),
          type: 'phone',
        },
        {
          name: 'otherPhone',
          label: t('remoteServiceCommunications:additionalPhone2'),
          type: 'phone',
        },
        {
          name: 'remoteDoorLockNotifications',
          label: t('remoteServiceCommunications:lockVehicle'),
          type: 'checkboxGroup',
          options: emailAndSms,
        },
        {
          name: 'remoteDoorUnlockNotifications',
          label: t('remoteServiceCommunications:unlockVehicle'),
          type: 'checkboxGroup',
          options: emailAndSms,
        },
        {
          name: 'hornLightsNotifications',
          label: t('remoteServiceCommunications:hornLights'),
          type: 'checkboxGroup',
          options: emailAndSms,
        },
        {
          name: 'alarmNotifications',
          label: t('remoteServiceCommunications:alarm'),
          type: 'checkboxGroup',
          options: emailAndSms,
        },
        {
          name: 'stolenVehicleNotifications',
          label: t('remoteServiceCommunications:stolenVehicleTracker'),
          type: 'checkboxGroup',
          options: emailAndSms,
        },
        ...communicationsFields,
      ];
    }

    const additionalExist =
      preferences?.telematicsPreferenceList &&
      preferences?.telematicsPreferenceList?.length > 0;
    const dynamicFields: MgaFormItemProps[] = additionalExist
      ? preferences.telematicsPreferenceList.map(pref => {
        return {
          name: pref?.preferenceLabelName,
          hint: pref?.description,
          type: 'checkbox',
          label: pref?.preferenceName,
          componentProps: {
            checked: pref?.preferenceValue == 'Y',
          },
        };
      })
      : [];

    const fields = additionalExist
      ? communicationsFields.concat(...dynamicFields)
      : communicationsFields;
    return fields;
  };

  return (
    <CsfView isLoading={isFetching} gap={24}>
      {disabled ? (
        <CsfCard
          action={
            <CsfButton
              title="Edit"
              onPress={() => setDisabled(false)}
              variant="inlineLink"
            />
          }>
          <CsfRuleList>
            {getFields().map((item: MgaFormItemProps, i) => {
              if (item.meta !== 'confirmation') {
                const label = t(item.label);

                const formValue: string | string[] | undefined =
                  item.name === 'emailCommunications'
                    ? preferences?.siebelEmail
                    : preferences?.telematicsPreferenceMap[item.name] ||
                    preferences?.[item.name];
                const value: string = Array.isArray(formValue)
                  ? formValue.join(', ')
                  : formValue || '';
                return item.meta === 'header' ? (
                  <CsfView mb={16} mt={16} key={`header-${i}`}>
                    <CsfText align="center" variant="title3">
                      {label}
                    </CsfText>
                  </CsfView>
                ) : (
                  <CsfDetail
                    key={i}
                    label={label}
                    value={value}
                    stacked={item.name === 'emailCommunications'}
                  />
                );
              }
            })}
          </CsfRuleList>
        </CsfCard>
      ) : (
        <MgaForm
          enabled={!isLoading}
          isLoading={isFetching || isLoading}
          trackingId={'notificationPreferencesGen1'}
          fields={getFields()}
          cancelLabel=""
          initialValues={{
            primaryEmail: preferences?.primaryEmail || '',
            primaryEmailConfirm: preferences?.primaryEmailConfirm || '',
            additionalEmail: preferences?.additionalEmail || '',
            additionalEmailConfirm: preferences?.additionalEmailConfirm || '',
            smsPhone1: preferences?.smsPhone1 || '',
            smsCarrier1: preferences?.smsCarrier1 || '',
            smsPhone2: preferences?.smsPhone2 || '',
            smsCarrier2: preferences?.smsCarrier2 || '',
            primaryPhone: preferences?.primaryPhone || '',
            otherPhone: preferences?.otherPhone || '',
            secondaryPhone: preferences?.secondaryPhone || '',
            remoteDoorLockNotifications:
              preferences?.remoteDoorLockNotifications,
            remoteDoorUnlockNotifications:
              preferences?.remoteDoorUnlockNotifications,
            hornLightsNotifications: preferences?.hornLightsNotifications,
            alarmNotifications: preferences?.alarmNotifications,
            stolenVehicleNotifications: preferences?.stolenVehicleNotifications,
            VehicleHealthUsageReport:
              preferences?.telematicsPreferenceMap?.VehicleHealthUsageReport ===
              'Y',
            WarningLightCommunications:
              preferences?.telematicsPreferenceMap
                ?.WarningLightCommunications === 'Y',
          }}
          submitLabel={t('common:save')}
          onCancel={() => navigation.pop()}
          onSubmit={async (data: PreferenceFormData) => {
            let payload: CommonPreference = {
              primaryEmail: data?.primaryEmail,
              primaryEmailConfirm: data?.primaryEmail,
              additionalEmail: data?.additionalEmail,
              additionalEmailConfirm: data?.additionalEmailConfirm,
              smsPhone1: data?.smsPhone1,
              smsCarrier1: data?.smsCarrier1,
              primaryPhone: data?.primaryPhone,
              secondaryPhone: data?.secondaryPhone || '',
              otherPhone: data?.otherPhone || '',
              smsPhone2: data?.smsPhone2 || '',
              smsCarrier2: data?.smsCarrier2 || '',
            };
            if (
              data.remoteDoorLockNotifications &&
              data.remoteDoorLockNotifications.length
            ) {
              payload = {
                ...payload,
                remoteDoorLockNotifications: data.remoteDoorLockNotifications,
              };
            }
            if (
              data.remoteDoorUnlockNotifications &&
              data.remoteDoorUnlockNotifications.length
            ) {
              payload = {
                ...payload,
                remoteDoorUnlockNotifications:
                  data.remoteDoorUnlockNotifications,
              };
            }
            if (
              data.hornLightsNotifications &&
              data.hornLightsNotifications.length
            ) {
              payload = {
                ...payload,
                hornLightsNotifications: data.hornLightsNotifications,
              };
            }
            if (data.alarmNotifications && data.alarmNotifications.length) {
              payload = {
                ...payload,
                alarmNotifications: data.alarmNotifications,
              };
            }
            if (
              data.stolenVehicleNotifications &&
              data.stolenVehicleNotifications.length
            ) {
              payload = {
                ...payload,
                stolenVehicleNotifications: data.stolenVehicleNotifications,
              };
            }
            if (
              data?.WarningLightCommunications ||
              data?.VehicleHealthUsageReport
            ) {
              if (data.WarningLightCommunications) {
                payload = {
                  ...payload,
                  'telematicsPreferenceMap[WarningLightCommunications]': 'Y',
                };
              }
              if (data.VehicleHealthUsageReport) {
                payload = {
                  ...payload,
                  'telematicsPreferenceMap[VehicleHealthUsageReport]': 'Y',
                };
              }
            }
            try {
              await request(payload).then(async response => {

                const successResponse: MSASuccess = response.data;
                if (successResponse?.success) {
                  await promptAlert(
                    t('common:success'),
                    t('remoteServiceCommunications:changesHaveBeenSaved'),
                    [{ title: t('common:continue'), type: 'primary' }],
                    { type: 'success' },
                  );
                  setDisabled(true);
                } else {
                  await promptAlert(
                    t('common:failed'),
                    t('remoteServiceCommunications:fatalMessage'),
                    [{ title: t('common:continue'), type: 'primary' }],
                  );
                }
              });
            } catch {
              await promptAlert(
                t('common:failed'),
                t('remoteServiceCommunications:fatalMessage'),
                [{ title: t('common:continue'), type: 'primary' }],
              );
            }
          }}
        />
      )}
    </CsfView>
  );
};

export default MgaRemoteServiceCommunicationGen1;
