/* eslint-disable react/no-unstable-nested-components */
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';

import {
  CustomerProfileResponse,
  useCustomerProfileQuery,
} from '../features/profile/contact/contactApi';
import { formatPhone } from '../utils/phone';
import { store } from '../store';
import {
  currentVehicleReducer,
  useCurrentVehicle,
} from '../features/auth/sessionSlice';
import { testID } from '../components/utils/testID';
import { featureFlagEnabled } from '../features/menu/rules';
import CsfCard from '../components/CsfCard';
import promptAlert from '../components/CsfAlert';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaAddress from '../components/MgaAddress';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaMyProfileView: React.FC = () => {
  const { t } = useTranslation();
  const currentVehicle = currentVehicleReducer(store.getState());
  const { data = { success: true }, isLoading } = useCustomerProfileQuery({
    vin: currentVehicle?.vin || '',
    oemCustId: currentVehicle?.oemCustId || '',
  });
  const { data: responseData }: CustomerProfileResponse = data;
  const vehicle = useCurrentVehicle();
  const customerProfile =
    responseData?.customerProfile || vehicle?.customer?.sessionCustomer;
  const cellularPhone = customerProfile?.cellularPhone || '';
  const homePhone = customerProfile?.homePhone || '';
  const workPhone = customerProfile?.workPhone || '';
  const navigation = useAppNavigation();

  interface SharedControlProps {
    heading: string
    children: ReactNode
    onChange?: () => void
    testID?: string
  }

  const SharedControl = (props: SharedControlProps) => {
    const id = testID(props.testID);
    return (
      <CsfCard
        title={props.heading}
        testID={id()}
        action={
          props.onChange && (
            <MgaButton
              trackingId="EditProfileButton"
              title={t('common:edit')}
              variant="inlineLink"
              testID={id('editButton')}
              onPress={props.onChange}
            />
          )
        }>
        {props.children}
      </CsfCard>
    );
  };

  const onEmailEdit = async () => {
    const message = t(
      featureFlagEnabled('mga.profile.fleetDisclaimer')
        ? 'myProfile:changeUsernameAlertFleet'
        : 'myProfile:changeUsernameAlert',
      { defaultValue: '' },
    );
    if (message) {
      const yes: string = t('common:continue');
      const no: string = t('common:cancel');
      const response: string = await promptAlert(
        t('common:notification'),
        message,
        [
          { title: yes, type: 'primary' },
          { title: no, type: 'link' },
        ],
      );
      if (response != yes) {
        return;
      }
    }
    navigation.push('EditEmailAddress', {
      email: customerProfile?.email,
    });
  };

  const onTelephoneEdit = async () => {
    const message = t(
      featureFlagEnabled('mga.profile.fleetDisclaimer')
        ? 'myProfile:changeTelephoneAlertFleet'
        : 'myProfile:changeTelephoneAlert',
      { defaultValue: '' },
    );
    if (message) {
      const yes: string = t('common:continue');
      const no: string = t('common:cancel');
      const response: string = await promptAlert(
        t('common:notification'),
        message,
        [
          { title: yes, type: 'primary' },
          { title: no, type: 'link' },
        ],
      );
      if (response != yes) {
        return;
      }
    }
    const telephoneData = {
      cellularPhone,
      homePhone,
      workPhone,
    };
    navigation.push('EditTelephone', { data: telephoneData });
  };

  const onLocationEdit = async () => {
    const message = t(
      featureFlagEnabled('mga.profile.fleetDisclaimer')
        ? 'myProfile:changeLocationAlertFleet'
        : 'myProfile:changeLocationAlert',
      { defaultValue: '' },
    );
    if (message) {
      const yes: string = t('common:continue');
      const no: string = t('common:cancel');
      const response: string = await promptAlert(
        t('common:notification'),
        message,
        [
          { title: yes, type: 'primary' },
          { title: no, type: 'link' },
        ],
      );
      if (response != yes) {
        return;
      }
    }
    const address = {
      address: customerProfile?.address || '',
      address2: customerProfile?.address2 || '',
      city: customerProfile?.city || '',
      state: customerProfile?.state || '',
      zip5Digits: customerProfile?.zip || '',
      countryCode: customerProfile?.countryCode || '',
    };
    navigation.push('EditAddress', { address });
  };

  const id = testID('MyProfile');
  return (
    <MgaPage title={t('common:contactInformation')}>
      <MgaPageContent title={t('common:contactInformation')}>
        <CsfView testID={id('headingContainer')}>
          <CsfText align="center" variant="title3" testID={id('userName')}>
            {customerProfile?.firstName} {customerProfile?.lastName}
          </CsfText>
          <CsfText align="center" testID={id('cannotAlterMessage')}>
            {t('myProfile:cannotAlteredMessage')}
          </CsfText>
        </CsfView>
        <CsfView
          style={{ flex: 1 }}
          isLoading={isLoading}
          gap={16}
          testID={id('userDetails')}>
          {/* MGAS-16: Gender */}
          {featureFlagEnabled('mga.profile.gender') && (
            <SharedControl
              heading={t('common:gender')}
              testID={id('genderControl')}>
              <CsfRuleList testID={id('genderDetails')}>
                <CsfDetail
                  testID={id('common:gender')}
                  label={t('common:gender')}
                  value={customerProfile?.gender}
                />
              </CsfRuleList>
              <CsfView pt={8}>
                <CsfText testID={id('genderWarning')}>
                  {t('myProfile:genderInfoDescription')}
                </CsfText>
              </CsfView>
            </SharedControl>
          )}
          {/* Email */}
          <SharedControl
            heading={t('myProfile:emailUsername')}
            onChange={onEmailEdit}
            testID={id('emailAddressControl')}>
            <CsfRuleList testID={id('emailDetails')}>
              <CsfDetail
                testID={id('emailAddress')}
                label={t('myProfile:emailAddress')}
                value={customerProfile?.email}
              />
            </CsfRuleList>
          </SharedControl>
          {/* Telephone */}
          {(cellularPhone || homePhone || workPhone) && (
            <SharedControl
              heading={t('myProfile:telephone')}
              onChange={onTelephoneEdit}
              testID={id('telephoneControl')}>
              <CsfRuleList testID={id('telephoneDetails')}>
                {cellularPhone && (
                  <CsfDetail
                    testID={id('mobilePhone')}
                    label={t('common:mobilePhone')}
                    value={formatPhone(cellularPhone)}
                  />
                )}
                {homePhone && (
                  <CsfDetail
                    testID={id('homePhone')}
                    label={t('myProfile:homePhone')}
                    value={formatPhone(homePhone)}
                  />
                )}
                {workPhone && (
                  <CsfDetail
                    testID={id('workPhone')}
                    label={t('myProfile:workPhone')}
                    value={formatPhone(workPhone)}
                  />
                )}
              </CsfRuleList>
            </SharedControl>
          )}
          {/* Mailing Address */}
          {(customerProfile?.address ||
            customerProfile?.city ||
            customerProfile?.state ||
            customerProfile?.zip) && (
              <SharedControl
                heading={t('myProfile:mailingAddress')}
                onChange={onLocationEdit}
                testID={id('mailingListControl')}>
                <CsfRuleList testID={id('mailingListDetails')}>
                  <MgaAddress
                    testID={id('addressDetails')}
                    textVariant="body2"
                    address={customerProfile?.address}
                    address2={customerProfile?.address2}
                    city={customerProfile?.city}
                    state={customerProfile?.state}
                    zip={customerProfile?.zip}
                  />
                </CsfRuleList>
              </SharedControl>
            )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaMyProfileView;
