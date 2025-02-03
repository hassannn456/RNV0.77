/* eslint-disable eqeqeq */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { navigate, useAppNavigation, useAppRoute } from '../../Controller';
import { testID } from '../../components/utils/testID';
import { CsfAlertStyles } from '../../components/CsfAlert';
import CsfView from '../../components/CsfView';
import CsfTile from '../../components/CsfTile';
import CsfText from '../../components/CsfText';
import MgaButton from '../../components/MgaButton';

let nid = 0;
let receivers: { id: number; resolver: (value: boolean) => void }[] = [];

const send = (id: number | undefined, value: boolean) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

/** Show alert outside components and capture selected response. */
export const promptConfirmLeaseCancel = async (): Promise<boolean> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('SubscriptionCancelLease', { id: nid });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

/**
 * Custom Alert for cancelling a leased subscription.
 *
 * Should not be called directly. Use `promptConfirmLeaseCancel()`
 **/
const MgaSubscriptionCancelLease: React.FC = () => {
  const navigation = useAppNavigation();
  const id = useAppRoute<'SubscriptionCancelLease'>().params.id;
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  const testId = testID('SubscriptionCancelLease');
  return (
    <SafeAreaView style={CsfAlertStyles.translucentCover}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={CsfAlertStyles.translucentCover.backgroundColor}
      />
      <CsfView style={CsfAlertStyles.modalOuterStyle}>
        <CsfTile>
          <CsfView gap={8}>
            <CsfText testID={testId('confirmInformation')}>
              {t('subscriptionCancel:confirmInformation')}
            </CsfText>
            <CsfView>
              <CsfText testID={testId('confirmYourBankIsStillTheSame')}>
                {'• '}
                {t('subscriptionCancel:confirmYourBankIsStillTheSame')}
              </CsfText>
              <CsfText testID={testId('confirmThatYouPaidOffTheLoan')}>
                {'• '}
                {t('subscriptionCancel:confirmThatYouPaidOffTheLoan')}
              </CsfText>
              <CsfText testID={testId('supplySupportingDocumentation')}>
                {'• '}
                {t('subscriptionCancel:supplySupportingDocumentation')}
              </CsfText>
            </CsfView>
            <CsfText testID={testId('willReceiveAnEmail')}>
              {t('subscriptionCancel:willReceiveAnEmail')}
            </CsfText>
          </CsfView>
          <MgaButton
            trackingId="SubscriptionCancelLeaseConfirm"
            title={t('common:confirm')}
            variant="primary"
            onPress={() => {
              if (id) {
                send(id, true);
              }
              navigation.goBack();
            }}
          />
          <MgaButton
            trackingId="SubscriptionCancelLeaseClose"
            title={t('common:close')}
            variant="secondary"
            onPress={() => {
              if (id) {
                send(id, false);
              }
              navigation.goBack();
            }}
          />
        </CsfTile>
      </CsfView>
    </SafeAreaView>
  );
};

export default MgaSubscriptionCancelLease;
