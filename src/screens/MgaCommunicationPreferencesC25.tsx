/* eslint-disable react/no-unstable-nested-components */
// TODO:UA:20240823 needs attention/refactoring
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessRule, has } from '../features/menu/rules';
import {
  PreferenceData,
  useNotificationPreferencesGen2Query,
  useUpdateNotificationPreferencesGen2Mutation,
} from '../features/starlinkcommunications/starlinkcommunications.api';
import { MSASuccess } from '../api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import { CsfAlertAction } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfInfoButton from '../components/CsfInfoButton';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfToggle from '../components/CsfToggle';
import CsfView from '../components/CsfView';
import { successNotice } from '../components/notice';
interface preferenceDetails {
  displayPreferenceName?: string
  preferenceName: string
  communicationTypes: string[]
  userPreferenceData: PreferenceData
}
interface PreferenceList {
  groupDisplayName: string
  preferenceDetails: preferenceDetails[]
  accessRule?: AccessRule | undefined
  infoButtonContent?: string
}

export const communicationTypes = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
};

const MgaCommunicationPreferencesC25: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const { data } = useNotificationPreferencesGen2Query({ vin: vehicle?.vin });
  const [request] = useUpdateNotificationPreferencesGen2Mutation();

  const userPreferences = data?.data?.preferences;

  const preferencesList: PreferenceList[] = t(
    'communicationPreferencesSettings:preferencesList',
    {
      returnObjects: true,
    },
  );

  const visiblePreferences = Array.isArray(preferencesList)
    ? preferencesList?.filter(
      pref => !pref.accessRule || has(pref.accessRule, vehicle),
    )
    : [];

  // TODO:UA:20240821 handle preferencesList not being an array
  // Returns preference list with userPreference data.
  // MUTATES, DOES NOT RETURN, inappropriate use of map
  preferencesList.map &&
    preferencesList.map((item: PreferenceList) => {
      userPreferences?.map((pref: PreferenceData) => {
        item.preferenceDetails.map(prefData => {
          if (prefData.preferenceName == pref.preferenceName) {
            prefData.userPreferenceData = pref;
          }
        });
      });
    });

  const id = testID('CommunicationPreferences');

  const RenderPrefGroup = ({
    item,
    index,
    ...props
  }: {
    item: PreferenceList
    index: number
    testID?: string
  }) => {
    const itemTestId = testID(id(props.testID));
    return (
      <CsfView>
        <CsfView ph={0} key={index}>
          <CsfView flexDirection="row" align="center" justify="space-between">
            <CsfText
              variant="subheading"
              testID={itemTestId('groupDisplayName')}>
              {item?.groupDisplayName}
            </CsfText>
            <CsfInfoButton
              testID={itemTestId('infoButton')}
              title={item?.groupDisplayName}
              text={item?.infoButtonContent}
            />
          </CsfView>
        </CsfView>
      </CsfView>
    );
  };

  const ToggleControl = (props: {
    label: string
    checked: boolean
    editable?: boolean
    onChange: (val: boolean) => void
    testID?: string
  }) => {
    return (
      <CsfToggle
        testID={props.testID}
        checked={props.checked}
        editable={props.editable ?? true}
        inline
        onChangeValue={val => props.onChange(val)}
        label={props.label}
      />
    );
  };

  const ToggleGroup = (props: { data: preferenceDetails; testID: string }) => {
    const [values, setValues] = useState({
      hasText: props.data.userPreferenceData?.notifyTextFlag === 'Y',
      hasPush: props.data.userPreferenceData?.notifyPushFlag === 'Y',
      hasEmail: props.data.userPreferenceData?.notifyEmailFlag === 'Y',
    });
    const preferenceName = props.data.userPreferenceData?.preferenceName;

    const textTermsAlert = async () => {
      const actions: CsfAlertAction[] = [
        {
          title: t('common:ok'),
          type: 'primary',
        },
        {
          title: t('common:cancel'),
          type: 'secondary',
        },
      ];
      const modalTitle: string = t('communicationPreferences:smsModalTitle');
      const content: string = t('communicationPreferences:smsModalCopy');
      const response = await promptAlert(modalTitle, content, actions);
      return response;
    };

    const onSubmit = async (prefData: {
      type: string
      val: boolean
      preferenceName: string
    }) => {
      const updatedPreferences = preferencesList.filter(pref =>
        pref.preferenceDetails.some(
          item =>
            item.userPreferenceData?.preferenceDisplayName !==
            'Terms and Conditions' &&
            item.userPreferenceData?.notifyTextFlag === 'Y',
        ),
      );
      const showTextTermsModal = updatedPreferences.length < 1;

      if (showTextTermsModal && prefData.type == 'text') {
        const response = await textTermsAlert();
        if (response !== t('common:ok')) {
          return;
        }
      }
      const notificationPreferences = ['TermsAndConditions_text'];
      userPreferences?.forEach((data: PreferenceData) => {
        const title: string = data.preferenceName.replaceAll(' ', '');

        if (
          data.notifyTextFlag === 'Y' &&
          prefData.preferenceName !== data.preferenceName
        ) {
          notificationPreferences.push(`${title}_text`);
        }

        if (
          data.notifyPushFlag === 'Y' &&
          prefData.preferenceName !== data.preferenceName
        ) {
          notificationPreferences.push(`${title}_push`);
        }

        if (
          data.notifyEmailFlag === 'Y' &&
          prefData.preferenceName !== data.preferenceName
        ) {
          notificationPreferences.push(`${title}_email`);
        }
      });
      const { type, val, preferenceName } = prefData;
      switch (type) {
        case 'text':
        case 'push':
        case 'email': {
          const valueKey = `has${type.charAt(0).toUpperCase() + type.slice(1)}`;
          setValues({ ...values, [valueKey]: val });

          const name: string = preferenceName.replaceAll(' ', '');

          if (val) {
            notificationPreferences.push(`${name}_${type}`);
          }
          if (values.hasText && type !== 'text') {
            notificationPreferences.push(`${name}_text`);
          }
          if (values.hasPush && type !== 'push') {
            notificationPreferences.push(`${name}_push`);
          }
          if (values.hasEmail && type !== 'email') {
            notificationPreferences.push(`${name}_email`);
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
            if (successResponse?.success) {
              successNotice({
                noticeKey: 'IDSuccess',
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

    const groupTestID = testID(props.testID);
    return (
      <CsfView flex={1} gap={8}>
        <CsfView justify="flex-start">
          <CsfView flexDirection="row" gap={16} pl={4}>
            {props.data.communicationTypes.includes('SMS') && (
              <ToggleControl
                checked={values.hasText}
                testID={groupTestID('sms')}
                onChange={val =>
                  onSubmit({
                    type: 'text',
                    val,
                    preferenceName: preferenceName,
                  })
                }
                label={t('common:sms')}
              />
            )}
            {props.data.communicationTypes.includes('PUSH') && (
              <ToggleControl
                checked={values.hasPush}
                testID={groupTestID('push')}
                onChange={val =>
                  onSubmit({
                    type: 'push',
                    val,
                    preferenceName: preferenceName,
                  })
                }
                label={t('remoteServiceCommunicationsGen2:push')}
              />
            )}
            {props.data.communicationTypes.includes('EMAIL') &&
              (t(props.data?.userPreferenceData?.preferenceName) !==
                'Billing' ? (
                <CsfToggle
                  testID={groupTestID('email')}
                  label={t('common:email')}
                  inline
                  checked={values.hasEmail}
                  onChangeValue={val => {
                    onSubmit({
                      type: 'email',
                      val,
                      preferenceName: preferenceName,
                    })
                      .then()
                      .catch(console.error);
                  }}
                />
              ) : (
                <CsfView
                  flexDirection="row"
                  gap={8}
                  justify="center"
                  mt={4}
                  align="center">
                  <CsfAppIcon icon={'DoorLock'} size={'lg'} />
                  <CsfText align="center" testID={groupTestID('email')}>
                    {t('common:email')}
                  </CsfText>
                </CsfView>
              ))}
          </CsfView>
        </CsfView>
      </CsfView>
    );
  };

  return (
    <CsfView gap={16}>
      <CsfView gap={24}>
        <CsfText
          variant="subheading"
          align="center"
          testID={id('communicationPreferenceSubHeader')}>
          {t('communicationPreferences:communicationPreferenceSubHeader')}
        </CsfText>
      </CsfView>
      <CsfCard pv={0}>
        <CsfRuleList>
          {visiblePreferences.map((pref, index) => {
            return (
              <CsfView pv={16} key={pref.groupDisplayName}>
                <RenderPrefGroup
                  item={pref}
                  testID={`visiblePref-${index}`}
                  index={index}
                />
                {pref.preferenceDetails.map((item, i) => {
                  const itemTestId = testID(id(`preferenceDetail-${i}`));
                  return (
                    <CsfView key={i}>
                      {pref.preferenceDetails.length > 1 && (
                        <CsfView mt={8} pl={4}>
                          <CsfText
                            testID={itemTestId('displayPreferenceName')}
                            align="left"
                            color="copySecondary"
                            variant="subheading">
                            {item.displayPreferenceName}
                          </CsfText>
                        </CsfView>
                      )}
                      <ToggleGroup key={i} data={item} testID={itemTestId()} />
                    </CsfView>
                  );
                })}
              </CsfView>
            );
          })}
          <CsfView pv={16}>
            <CsfText variant="subheading">
              {t('communicationPreferencesSettings:billing')}
            </CsfText>
            <CsfView mt={12}>
              <CsfText color="copySecondary">
                {t('communicationPreferencesSettings:billingStatement')}
              </CsfText>
            </CsfView>
          </CsfView>
        </CsfRuleList>
      </CsfCard>
    </CsfView>
  );
};

export default MgaCommunicationPreferencesC25;
