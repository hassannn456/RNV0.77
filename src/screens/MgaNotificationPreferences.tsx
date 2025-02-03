/* eslint-disable react/no-unstable-nested-components */
// cSpell:ignore TermsandConditions_text RSRR
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PreferenceData,
  NotificationPreferenceGen2Plus,
  useNotificationPreferencesGen2Query,
  useUpdateNotificationPreferencesGen2Mutation,
} from '../features/starlinkcommunications/starlinkcommunications.api';
import { useAppNavigation, useAppRoute } from '../Controller';
import { MSASuccess } from '../api';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import {
  CustomerProfileResponse,
  useCustomerProfileQuery,
} from '../features/profile/contact/contactApi';
import { CsfAlertAction } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfCard from '../components/CsfCard';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfRule from '../components/CsfRule';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfToggle from '../components/CsfToggle';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import { successNotice } from '../components/notice';

interface Values {
  isGroupEmail?: boolean
  isGroupPush?: boolean
  isGroupText?: boolean
}
interface InfoModalValues {
  title?: string
  heading?: string
  subHeading?: string
  subHeadingTitle?: string
  data?: string[]
  showPrimaryButton?: boolean
  showSecondaryButton?: boolean
  primaryButtonText?: string
  secondaryButtonText?: string
}
interface InfoModalData {
  [key: string]: InfoModalValues
}

const fields: Values = {
  isGroupEmail: undefined,
  isGroupPush: undefined,
  isGroupText: undefined,
};

const headerKeys: Record<string, string> = {
  remoteVehicleControls: 'remoteServiceCommandsSubHeader',
  vehicleMonitoring: 'remoteVehicleAlertsSubHeader',
  tripTrackerNotification: 'driverServicesNotificationsSubHeader',
  driverServicesNotifications: 'driverServicesNotifications',
  vehicleHealthAlerts: 'vehicleHealthAlertsSubHeader',
  billing: 'billingNotificationsSubHeader',
};

const MgaNotificationPreferenceCard: React.FC<{
  preferenceName: string
}> = ({ preferenceName }) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = getCurrentVehicle();
  const {
    data: notificationData,
    isFetching,

    // isLoading,
    isSuccess,
  } = useNotificationPreferencesGen2Query({ vin: vehicle?.vin });

  const queryData: NotificationPreferenceGen2Plus | undefined =
    notificationData?.data;
  const [request] = useUpdateNotificationPreferencesGen2Mutation();

  const { data: profileData } = useCustomerProfileQuery({
    vin: vehicle?.vin || '',
    oemCustId: vehicle?.oemCustId || '',
  });

  const { data: profileResponseData }: CustomerProfileResponse =
    profileData || {};
  const customerProfile = profileResponseData?.customerProfile;
  const cellularPhone = customerProfile?.cellularPhone || '';
  const homePhone = customerProfile?.homePhone || '';
  const workPhone = customerProfile?.workPhone || '';

  const [defaultValues, setDefaultValues] = useState(fields);
  const preferences = queryData?.preferences;

  const isSendVehicleLocation: boolean =
    queryData?.sendVehicleLocationOnIgnitionOff || false;

  let data: PreferenceData[] = [];

  // Remote Services
  const remoteVehiclesControlOptions = [
    'Remote Horn and Lights',
    'Remote Door Lock',
    'Remote Door Unlock',
  ];
  const phevControlOptions = [
    'Remote Climate Control Stop',
    'Remote Climate Control Start',
  ];
  const resOrResccControlOptions = [
    'Remote Engine Start',
    'Remote Engine Stop',
    'Remote Engine Abnormal Stop',
  ];

  //Remote Vehicle Alerts
  const vehicleMonitoringOptions = [
    'Security Alarm',
    'Boundary Alerts',
    'Curfew Alerts',
    'Speed Alerts',
  ];
  const phevMonitoringOptions = [
    'Charging Completed',
    'Start Charging',
    'Charging has Stopped',
  ];
  const rsrrControlOptions = ['Rear Seat Reminder Alert'];
  const valetControlOptions = ['Valet Mode'];
  const isServicesToL2NotAllowed = [
    'Boundary Alerts',
    'Curfew Alerts',
    'Speed Alerts',
    'Valet Mode',
    'Billing',
  ];
  const isServicesToL1NotAllowed = ['Billing'];

  //Trip Tracker Notifications
  const tripTrackerNotificationOptions = ['Trip Tracker'];

  //Vehicle Diagnostics Alerts
  const vehicleHealthAlertsOptions = ['Immediate Attention', 'Cautionary'];

  //Billing
  const billingOptions = ['Billing'];

  const infoModalData: InfoModalData = {
    'MIL Cautionary': {
      title: 'requiresServiceSoon',
      primaryButtonText: 'common:ok',
      data: [
        'itemsCovered',
        'antiLockBrakeMalfunction',
        'awdMalfunction',
        'engineOilLight',
        'hybridMalfunction',
        'tirePressureMonitoringSystem',
        'vehicleDynamicControl',
        'lowWasherFluid',
        'idleStopStart',
        'reverseBrakingMalfunction',
        'blindSpotRearTrafficMalfunction',
      ],
    },
    'MIL Immediate Attention': {
      title: 'requiresImmediateAttention',
      primaryButtonText: 'common:ok',
      data: [
        'itemsCovered',
        'driverAirbag',
        'passengerAirbag',
        'brakeMalfunction',
        'checkEngineLight',
        'electricAssistedSteering',
        'oilTemperature',
        'hybridChargeLight',
        'oilPressureMalfunction',
        'parkingBreakMalfunction',
        'eyeSightMalfunction',
        'starlinkMalfunction',
      ],
    },
    sendVehicleLocationOnIgnitionOff: {
      title: 'vehicleLocation',
      primaryButtonText: 'common:ok',
      data: ['sendVehicleLocationAlertSubheader'],
    },
    'Rear Seat Reminder Alert': {
      title: 'rearSeatReminderAlert',
      primaryButtonText: 'common:ok',
      data: ['rearSeatReminderAlertSubheader'],
    },
    textToggleAlert: {
      showPrimaryButton: true,
      showSecondaryButton: true,
      primaryButtonText: 'common:ok',
      secondaryButtonText: 'common:cancel',
      title: 'remoteServiceCommunicationsGen3:smsTermsAndConditionTitle',
      subHeading: 'remoteServiceCommunicationsGen3:agreeTextNotification',
    },
    pushToggleAlert: {
      showPrimaryButton: true,
      showSecondaryButton: false,
      primaryButtonText: 'common:ok',
      title: 'remoteServiceCommunicationsGen2:pushNotifications',
      subHeading: 'remoteServiceCommunicationsGen2:pushNotificationsContent',
    },
  };

  if (preferenceName) {
    const hasLevel2AccessRestriction = vehicle?.accessLevel === 2 || false;
    const hasLevel1AccessRestriction = vehicle?.accessLevel === 1 || false;
    const vehicleFeatures = vehicle?.features || [];

    preferences?.map((res: PreferenceData) => {
      const isRemoteVehicleControls = preferenceName === 'remoteVehicleControls';
      const isVehicleMonitoring = preferenceName === 'vehicleMonitoring';
      const isVehicleHeathAlerts = preferenceName === 'vehicleHealthAlerts';
      const isTripTrackerNotification =
        preferenceName === 'tripTrackerNotification';
      const isBilling = preferenceName === 'billing';
      const isPHEV = vehicleFeatures.includes('PHEV');
      const preferenceDisplayName = res.preferenceDisplayName;

      if (isRemoteVehicleControls) {
        const isRESOrRESCC =
          vehicleFeatures.includes('RES') || vehicleFeatures.includes('RESCC');

        if (
          remoteVehiclesControlOptions.includes(preferenceDisplayName) ||
          (isPHEV && phevControlOptions.includes(preferenceDisplayName)) ||
          (isRESOrRESCC &&
            resOrResccControlOptions.includes(preferenceDisplayName))
        ) {
          data.push(res);
        }
      } else if (isVehicleMonitoring) {
        const isRRSR = vehicleFeatures.includes('RRSR');
        const isValet =
          vehicleFeatures.includes('VALET') ||
          vehicleFeatures.includes('VALET_SETTINGS');

        if (
          vehicleMonitoringOptions.includes(preferenceDisplayName) ||
          (isPHEV && phevMonitoringOptions.includes(preferenceDisplayName)) ||
          (isRRSR && rsrrControlOptions.includes(preferenceDisplayName)) ||
          (isValet && valetControlOptions.includes(preferenceDisplayName))
        ) {
          data.push(res);
        }

        if (hasLevel2AccessRestriction) {
          data = data.filter(
            item =>
              !isServicesToL2NotAllowed.includes(item.preferenceDisplayName),
          );
        }
      } else if (
        isTripTrackerNotification &&
        tripTrackerNotificationOptions.includes(preferenceDisplayName)
      ) {
        data.push(res);
      } else if (
        isVehicleHeathAlerts &&
        vehicleHealthAlertsOptions.includes(preferenceDisplayName)
      ) {
        data.push(res);
      } else if (isBilling && billingOptions.includes(preferenceDisplayName)) {
        data.push(res);

        if (hasLevel2AccessRestriction) {
          data = data.filter(
            item =>
              !isServicesToL2NotAllowed.includes(item.preferenceDisplayName),
          );
        }

        if (hasLevel1AccessRestriction) {
          data = data.filter(
            item =>
              !isServicesToL1NotAllowed.includes(item.preferenceDisplayName),
          );
        }
      }
    });
  }

  const ToggleControl = (props: {
    label: string
    checked: boolean
    editable?: boolean
    onChange: (val: boolean) => void
  }) => {
    return (
      <CsfToggle
        checked={props.checked}
        editable={props.editable ?? true}
        inline
        onChangeValue={val => props.onChange(val)}
        label={props.label}
      />
    );
  };

  const ToggleGroup = (props: {
    title: string
    message?: string
    preferenceName: string
    isGroup?: boolean
    isText: boolean
    isEmail: boolean
    isEmailEditable?: boolean
    isPush: boolean
  }) => {
    const showInfoIcon = [
      'MIL Immediate Attention',
      'MIL Cautionary',
      'sendVehicleLocationOnIgnitionOff',
      'Rear Seat Reminder Alert',
    ];
    const [values, setValues] = useState({
      isText: props.isText,
      isPush: props.isPush,
      isEmail: props.isEmail,
    });

    useEffect(() => {
      if (props.isGroup) {
        const dataLength = data.length;
        if (dataLength > 0) {
          const counts = data.reduce(
            (accumulator, currentItem) => {
              accumulator.textCount +=
                currentItem.notifyTextFlag === 'Y' ? 1 : 0;
              accumulator.emailCount +=
                currentItem.notifyEmailFlag === 'Y' ? 1 : 0;
              accumulator.pushCount +=
                currentItem.notifyPushFlag === 'Y' ? 1 : 0;
              return accumulator;
            },
            { textCount: 0, emailCount: 0, pushCount: 0 },
          );

          const isAllEmailSelected = dataLength === counts.emailCount;
          const isAllPushSelected = dataLength === counts.pushCount;
          const isAllTextSelected = dataLength === counts.textCount;

          if (
            values.isEmail !== isAllEmailSelected ||
            values.isPush !== isAllPushSelected ||
            values.isText !== isAllTextSelected
          ) {
            setValues({
              ...values,
              isText: isAllTextSelected,
              isPush: isAllPushSelected,
              isEmail: isAllEmailSelected,
            });
          }
        }
      }
    }, []);

    const textTermsAlert = async (modalData: InfoModalValues) => {
      const actions: CsfAlertAction[] = [
        {
          title: t(modalData?.primaryButtonText),
          type: 'primary',
        },
        {
          title: t(modalData?.secondaryButtonText),
          type: 'secondary',
        },
      ];
      const agree: string = t(
        'remoteServiceCommunicationsGen3:checkboxTextNotification',
      );
      const messageTitle: string = t(
        'remoteServiceCommunicationsGen3:textMessagesTitle',
      );
      const subHeading: string = t(modalData.subHeading);
      const linkUrl: string = t('urls:termsAndConditions');

      const content =
        `<div style="text-align: center;"><strong>${messageTitle}</strong></div>\n` +
        `${subHeading}\n` +
        `<a href="${linkUrl}" target="_blank">${agree}</a>`;

      const response = await promptAlert(t(modalData.title), content, actions);
      return response;
    };

    const pushInfoAlert = async (modalData: InfoModalValues) => {
      const actions: CsfAlertAction[] = [
        {
          title: t(modalData?.primaryButtonText),
          type: 'primary',
        },
      ];
      await promptAlert(t(modalData.title), t(modalData.subHeading), actions);
    };

    const onSubmit = async (prefData: {
      type: string
      val: boolean
      preferenceName: string
    }) => {
      const updatedPreferences = preferences?.filter(
        item => item.preferenceDisplayName !== 'Terms and Conditions',
      );
      const isTextFlagSelected = updatedPreferences?.some(
        item => item.notifyTextFlag === 'Y',
      );
      const isPushFlagSelected = updatedPreferences?.some(
        item => item.notifyPushFlag === 'Y',
      );
      const showTextTermsModal =
        (prefData.type === 'text' || props.preferenceName === 'All') &&
        !isTextFlagSelected;

      const showPushInfoModal =
        (prefData.type === 'push' || props.preferenceName === 'All') &&
        !isPushFlagSelected;

      if (showTextTermsModal) {
        const modalData = infoModalData.textToggleAlert;
        const response = await textTermsAlert(modalData);
        if (response !== t(modalData?.primaryButtonText)) {
          return;
        }
      }
      if (showPushInfoModal) {
        const modalData = infoModalData.pushToggleAlert;
        await pushInfoAlert(modalData);
      }
      const showDisableTextAlert =
        (prefData.type === 'text' || props.preferenceName === 'All') &&
        !cellularPhone;
      if (showDisableTextAlert) {
        const update = t('chargeReview:update');
        const actions: CsfAlertAction[] = [
          {
            title: update,
            type: 'primary',
          },
          { title: t('common:close'), type: 'secondary' },
        ];
        const action = await promptAlert(
          t('common:alert'),
          t('remoteServiceCommunicationsGen3:disableTextAlertSubheader'),
          actions,
        );
        if (action == update) {
          navigation.push('EditTelephone', {
            data: {
              cellularPhone,
              homePhone,
              workPhone,
            },
          });
        }
        return;
      }
      const notificationPreferences = ['TermsandConditions_text'];
      preferences?.forEach((res: PreferenceData) => {
        const title: string = res.preferenceName.replaceAll(' ', '');
        if (props.isGroup) {
          if (res.notifyTextFlag === 'Y') {
            notificationPreferences.push(`${title}_text`);
          }
          if (res.notifyPushFlag === 'Y') {
            notificationPreferences.push(`${title}_push`);
          }
          if (res.notifyEmailFlag == 'Y') {
            notificationPreferences.push(`${title}_email`);
          }
        } else {
          if (
            res.notifyTextFlag === 'Y' &&
            prefData.preferenceName !== res.preferenceName
          ) {
            notificationPreferences.push(`${title}_text`);
          }

          if (
            res.notifyPushFlag === 'Y' &&
            prefData.preferenceName !== res.preferenceName
          ) {
            notificationPreferences.push(`${title}_push`);
          }

          if (
            res.notifyEmailFlag === 'Y' &&
            prefData.preferenceName !== res.preferenceName
          ) {
            notificationPreferences.push(`${title}_email`);
          }
        }
      });
      const { type, val, preferenceName } = prefData;
      switch (type) {
        case 'text':
        case 'push':
        case 'email': {
          if (props.isGroup) {
            data?.forEach((res: PreferenceData) => {
              const title: string = res.preferenceName.replaceAll(' ', '');
              if (val) {
                notificationPreferences.push(`${title}_${type}`);
              } else {
                const itemIndex = notificationPreferences.indexOf(
                  `${title}_${type}`,
                );
                if (itemIndex !== -1) {
                  notificationPreferences.splice(itemIndex, 1);
                }
              }
            });
          }

          const stateKey = `isGroup${type.charAt(0).toUpperCase() + type.slice(1)
            }`;
          const valueKey = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
          props.isGroup
            ? setDefaultValues({ ...defaultValues, [stateKey]: val })
            : setValues({ ...values, [valueKey]: val });

          if (!val) {
            setDefaultValues({ ...defaultValues, [stateKey]: false });
          } else {
            data?.length === 1 &&
              setDefaultValues({ ...defaultValues, [stateKey]: true });
          }

          const name: string = preferenceName.replaceAll(' ', '');

          if (val) {
            notificationPreferences.push(`${name}_${type}`);
          }
          if (values.isEmail && type !== 'email') {
            notificationPreferences.push(`${name}_email`);
          }
          if (values.isText && type !== 'text') {
            notificationPreferences.push(`${name}_text`);
          }
          if (values.isPush && type !== 'push') {
            notificationPreferences.push(`${name}_push`);
          }
          break;
        }
        case 'sendLocation': {
          if (!isSendVehicleLocation) {
            notificationPreferences.push('sendVehicleLocationOnIgnitionOff');
          }
          break;
        }
      }
      const payload = {
        notificationPreferences,
      };
      try {
        request(payload)
          .then(response => {

            const successResponse: MSASuccess = response.data;
            if (isValetMode && successResponse?.success) {
              successNotice({
                title: t('common:success'),
                subtitle: t('remoteServiceCommunications:changesHaveBeenSaved'),
              });
            }
            if (!successResponse?.success) {
              CsfSimpleAlert(
                t('common:failed'),
                t('remoteServiceCommunications:fatalMessage'),
                { type: 'error' },
              );
            }
          })
          .catch(() =>
            CsfSimpleAlert(
              t('common:failed'),
              t('remoteServiceCommunications:fatalMessage'),
              { type: 'error' },
            ),
          );
      } catch {
        CsfSimpleAlert(
          t('common:failed'),
          t('remoteServiceCommunications:fatalMessage'),
          { type: 'error' },
        );
      }
    };
    const alertData = infoModalData[props.preferenceName];
    const alertTextData = alertData?.data?.map(item =>
      t(`remoteServiceCommunicationsGen3:${item}`),
    );

    return (
      <>
        <CsfView flex={1} gap={8}>
          <CsfView
            flex={1}
            flexDirection="row"
            align="center"
            justify="space-between">
            <CsfText variant="bold">{props.title}</CsfText>
            {!props.isGroup && showInfoIcon.includes(props.preferenceName) && (
              <CsfInfoButton
                title={t(
                  `remoteServiceCommunicationsGen3:${alertData?.title || ''}`,
                )}
                text={alertTextData?.join('\n')}
                actions={[
                  { title: t(alertData?.primaryButtonText), type: 'primary' },
                ]}
              />
            )}
          </CsfView>

          {props.message && <CsfText variant="body2">{props.message}</CsfText>}
          {props.preferenceName === 'sendVehicleLocationOnIgnitionOff' ? (
            <CsfView style={{ width: '100%' }}>
              <ToggleControl
                checked={isSendVehicleLocation}
                onChange={val =>
                  onSubmit({
                    type: 'sendLocation',
                    val,
                    preferenceName: props.preferenceName,
                  })
                }
                label={''}
              />
            </CsfView>
          ) : (
            <CsfView flexDirection="row" gap={16}>
              <ToggleControl
                checked={values.isText}
                onChange={val =>
                  onSubmit({
                    type: 'text',
                    val,
                    preferenceName: props.preferenceName,
                  })
                }
                label={t('common:sms')}
              />
              <ToggleControl
                checked={values.isPush}
                onChange={val =>
                  onSubmit({
                    type: 'push',
                    val,
                    preferenceName: props.preferenceName,
                  })
                }
                label={t('remoteServiceCommunicationsGen2:push')}
              />
              <ToggleControl
                checked={values.isEmail}
                editable={props.isEmailEditable ?? true}
                onChange={val =>
                  onSubmit({
                    type: 'email',
                    val,
                    preferenceName: props.preferenceName,
                  })
                }
                label={t('common:email')}
              />
            </CsfView>
          )}
        </CsfView>
      </>
    );
  };

  const PreferencesCard: React.FC = () => {
    const { t } = useTranslation();
    return (
      <CsfCard>
        <CsfView isLoading={isFetching && !isSuccess} gap={12}>
          {data.length > 1 && (
            <>
              <ToggleGroup
                isGroup={true}
                isEmail={false}
                isPush={false}
                isText={false}
                title={t('remoteServiceCommunicationsGen2:selectAllOptions')}
                preferenceName={'ALL'}
              />
              <CsfRule />
            </>
          )}

          <CsfView gap={12}>
            {data?.map((res: PreferenceData, index: number) => {
              const isBilling = res.preferenceDisplayName === 'Billing';
              const isEmail = res?.notifyEmailFlag === 'Y';
              const isPush = res?.notifyPushFlag === 'Y';
              const isText = res?.notifyTextFlag === 'Y';
              return (
                <ToggleGroup
                  key={index}
                  isEmail={isEmail}
                  isEmailEditable={!isBilling}
                  isPush={isPush}
                  isText={isText}
                  title={res.preferenceDisplayName}
                  message={
                    isBilling
                      ? t('billingInformation:billingNotificationsText')
                      : undefined
                  }
                  preferenceName={res.preferenceName}
                />
              );
            })}

            {preferenceName === 'driverServicesNotifications' && (
              <ToggleGroup
                key={0}
                isEmail={true}
                isPush={true}
                isText={true}
                title={t('remoteServiceCommunicationsGen2:sendVehicleLocation')}
                preferenceName={'sendVehicleLocationOnIgnitionOff'}
              />
            )}
          </CsfView>
        </CsfView>
      </CsfCard>
    );
  };
  return <PreferencesCard />;
};

export const MgaNotificationPreferences: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'NotificationPreferences'>();
  const { preferenceKey: key, label } = route.params;

  return (
    <MgaPage
      focusedEdit
      title={label ? label : t(`remoteServiceCommunicationsGen3:${key}`)}>
      <CsfView p={16} gap={24}>
        {key && (
          <CsfText variant="body2" align="center">
            {t(`remoteServiceCommunicationsGen3:${headerKeys[key]}`)}
          </CsfText>
        )}

        <MgaNotificationPreferenceCard preferenceName={key} />
        <CsfAlertBar
          flat
          subtitle={t('remoteServiceCommunicationsGen3:textMessages')}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaNotificationPreferenceCard;
