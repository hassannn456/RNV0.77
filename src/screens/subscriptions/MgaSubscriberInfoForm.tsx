/* eslint-disable eol-last */
/* eslint-disable curly */
/* eslint-disable eslint-comments/no-unlimited-disable */
import React, { useState } from 'react';
import {
  CsfDropdownItem,
  MgaFormProps,
} from '../../components';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useTimeZones } from '../../features/admin/admin.api';
import { validate } from '../../utils/validate';
import { testID } from '../../components/utils/testID';
import { getLanguages } from '../../features/localization/environment';
import CsfView from '../../components/CsfView';
import MgaForm from '../../components/MgaForm';
import CsfTile from '../../components/CsfTile';
import CsfText from '../../components/CsfText';
import CsfSelect from '../../components/CsfSelect';
import CsfInfoButton from '../../components/CsfInfoButton';
import CsfPassword from '../../components/CsfPassword';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import MgaButton from '../../components/MgaButton';
import CsfPhoneInput from '../../components/CsfPhoneInput';
import { CsfInputBoxHeight } from '../../components/CsfTextInput';

export type MgaSubscriberInfoFormProps = Omit<
  MgaFormProps,
  'fields' | 'trackingId'
> & {
  pinRequired?: boolean
}

const MgaSubscriberInfoForm: React.FC<MgaSubscriberInfoFormProps> = ({
  onCancel,
  onSubmit,
  pinRequired,
  ...formProps
}) => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const languages: CsfDropdownItem[] = getLanguages().map(l => ({
    label: t(`common:${l}`),
    value: l,
  }));
  const timeZones = useTimeZones();
  const customer = vehicle?.customer.sessionCustomer;
  const [subscriberInfoForm, setSubscriberInfoForm] = useState({
    firstName: customer?.firstName,
    lastName: customer?.lastName,
    email: customer?.email,
    preferredLanguage: languages[0]?.value,
    timeZone: timeZones.find(tz => tz.value == vehicle?.timeZone)?.value,
    mobilePhone: customer?.cellularPhone,
    termsAndConditions: false,
    pin: '',
    confirmPin: '',
    ...formProps.initialValues,
  });
  const errors = validate(
    subscriberInfoForm,
    {
      mobilePhone: 'phone',
      timeZone: 'required',
      preferredLanguage: 'required',
      termsAndConditions: 'required',
      pin: pinRequired ? { required: true, minlength: 4 } : undefined,
      confirmPin: pinRequired ? { equalTo: subscriberInfoForm.pin } : undefined,
    },
    (key, error) => {
      return t(
        `subscriptionEnrollment:subscriberInfoFormValidateMessages.${key}.${error as string
        }`,
        { defaultValue: t(`validation:${error as string}`) },
      );
    },
  );
  const [showErrors, setShowErrors] = useState(false);

  const formatRequiredLabel = (s: string) => {
    return s + ' *';
  };

  const id = testID('SubscriberInfoForm');
  return (
    <CsfView gap={8} pb={20}>
      <MgaForm
        {...formProps}
        fields={[]}
        onSubmit={() => { }}
        trackingId="SubscriberInfoForm">
        <CsfTile gap={4}>
          <CsfText variant="heading" testID={id('subscriberInformation')}>
            {t('subscriptionEnrollment:subscriberInformation')}
          </CsfText>
          <CsfInput
            editable={false}
            label={t('common:firstName')}
            value={subscriberInfoForm?.firstName}
            errors={showErrors && errors.firstName}
            testID={id('firstName')}
          />
          <CsfInput
            editable={false}
            label={t('common:lastName')}
            value={subscriberInfoForm?.lastName}
            errors={showErrors && errors.lastName}
            testID={id('lastName')}
          />
          <CsfInput
            editable={false}
            label={t('common:emailAddress')}
            value={subscriberInfoForm?.email}
            errors={showErrors && errors.email}
            testID={id('email')}
          />
          <CsfView gap={16} align="flex-end" flexDirection="row">
            <CsfView flex={1}>
              <CsfSelect
                label={formatRequiredLabel(
                  t('subscriptionEnrollment:preferredLanguage'),
                )}
                value={subscriberInfoForm.preferredLanguage}
                errors={showErrors && errors.preferredLanguage}
                options={languages}
                onSelect={value =>
                  setSubscriberInfoForm({
                    ...subscriberInfoForm,
                    preferredLanguage: value,
                  })
                }
                testID={id('preferredLanguage')}
              />
            </CsfView>
            <CsfView
              minHeight={CsfInputBoxHeight}
              justify="center"
              align="center">
              <CsfInfoButton
                title={t('subscriptionEnrollment:languagePreferred')}
                text={t('subscriptionEnrollment:selectPreferredLanguage')}
                testID={id('languagePreferred')}
              />
            </CsfView>
          </CsfView>
          <CsfView gap={16} align="flex-end" flexDirection="row">
            <CsfView flex={1}>
              <CsfSelect
                label={formatRequiredLabel(
                  t('subscriptionEnrollment:timeZone'),
                )}
                value={subscriberInfoForm.timeZone}
                errors={showErrors && errors.timeZone}
                options={timeZones}
                onSelect={value =>
                  setSubscriberInfoForm({
                    ...subscriberInfoForm,
                    timeZone: value,
                  })
                }
                testID={id('timeZone')}
              />
            </CsfView>
            <CsfView
              minHeight={CsfInputBoxHeight}
              justify="center"
              align="center">
              <CsfInfoButton
                title={t('subscriptionEnrollment:time')}
                text={t('subscriptionEnrollment:chooseTheTimeZone')}
                testID={id('chooseTheTimeZone')}
              />
            </CsfView>
          </CsfView>
          <CsfView gap={16} align="flex-end" flexDirection="row">
            <CsfView flex={1}>
              <CsfPhoneInput
                label={t('common:mobilePhoneNumber')}
                value={subscriberInfoForm.mobilePhone}
                errors={showErrors && errors.mobilePhone}
                onChangeText={value =>
                  setSubscriberInfoForm({
                    ...subscriberInfoForm,
                    mobilePhone: value,
                  })
                }
                testID={id('mobilePhoneNumber')}
              />
            </CsfView>
            <CsfView
              minHeight={CsfInputBoxHeight}
              justify="center"
              align="center">
              <CsfInfoButton
                title={t('common:mobilePhoneNumber')}
                text={t('subscriptionEnrollment:enterPhoneNumber')}
                testID={id('enterPhoneNumber')}
              />
            </CsfView>
          </CsfView>
          {pinRequired && (
            <CsfPassword
              autoComplete="off"
              errors={showErrors && errors.pin}
              keyboardType="number-pad"
              label={formatRequiredLabel(t('subscriptionEnrollment:pin'))}
              maxLength={4}
              onChangeText={value =>
                setSubscriberInfoForm({ ...subscriberInfoForm, pin: value })
              }
              value={subscriberInfoForm?.pin}
              testID={id('enterPin')}
            />
          )}
          {pinRequired && (
            <CsfPassword
              autoComplete="off"
              errors={showErrors && errors.confirmPin}
              keyboardType="number-pad"
              label={formatRequiredLabel(
                t('subscriptionEnrollment:confirmPin'),
              )}
              maxLength={4}
              onChangeText={value =>
                setSubscriberInfoForm({
                  ...subscriberInfoForm,
                  confirmPin: value,
                })
              }
              value={subscriberInfoForm?.confirmPin}
              testID={id('confirmPin')}
            />
          )}
          <CsfCheckBox
            label={t('subscriptionUpgrade:iAgree')}
            checked={subscriberInfoForm.termsAndConditions}
            errors={showErrors && errors.termsAndConditions}
            onChangeValue={value =>
              setSubscriberInfoForm({
                ...subscriberInfoForm,
                termsAndConditions: value,
              })
            }
            testID={id('iAgree')}
          />
        </CsfTile>
      </MgaForm>
      <CsfView flexDirection="row" gap={8}>
        <MgaButton
          trackingId="SubscriberInfoFormGoBack"
          flex={1}
          title={t('common:back')}
          variant="secondary"
          onPress={() => onCancel && onCancel()}
        />
        <MgaButton
          trackingId="SubscriberInfoFormContinue"
          flex={1}
          title={t('common:continue')}
          variant="primary"
          onPress={() => {
            setShowErrors(true);
            if (Object.keys(errors).length > 0) return;
            // eslint-disable-next-line
            onSubmit && onSubmit(subscriberInfoForm)
          }}
        />
      </CsfView>
    </CsfView>
  );
};


export default MgaSubscriberInfoForm;