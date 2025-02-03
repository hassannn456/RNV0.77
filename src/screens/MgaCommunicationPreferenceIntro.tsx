/* eslint-disable no-void */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import {
  selectVehicleAccountAttribute,
  updateVehicleAccountAttribute,
} from '../api/userAttributes.api';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaHeroPage from '../components/MgaHeroPage';

const MgaCommunicationPreferencesIntro: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const id = testID('CommunicationPreferencesInto');

  useEffect(() => {
    const firstTimeCompleted = selectVehicleAccountAttribute(
      'communicationPreferences.firstTime',
    );
    if (!firstTimeCompleted) {
      void updateVehicleAccountAttribute(
        'communicationPreferences.firstTime',
        new Date().toISOString(),
      );
    }
  }, []);

  return (
    <MgaHeroPage
      heroSource={require('../../content/png/communication-preferences-bg.png')}
      showVehicleInfoBar
      title={t('communicationPreferences:introTitle')}>
      <CsfView standardSpacing edgeInsets testID={id()}>
        <CsfText align="center" variant="title3" testID={id('introTitle')}>
          {t('communicationPreferences:introTitle')}
        </CsfText>
        <CsfText align="center" testID={id('introContent')}>
          {t('communicationPreferences:introContent')}
        </CsfText>
        <MgaButton
          trackingId="CommunicationPreferencesIntro"
          title={t('communicationPreferences:introButton')}
          onPress={() => {
            navigation.navigate('CommunicationPreferences', {
              skipSetup: true,
            });
          }}
        />
        <CsfView pt={8} />
        <MgaButton
          trackingId="CommunicationPreferencesSkip"
          title={t('communicationPreferences:skip')}
          variant="inlineLink"
          onPress={() => {
            navigation.navigate('Dashboard');
          }}
        />
      </CsfView>
    </MgaHeroPage>
  );
};

export default MgaCommunicationPreferencesIntro;
