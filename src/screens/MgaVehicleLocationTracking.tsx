import React from 'react';
import { useTranslation } from 'react-i18next';
import { has } from '../features/menu/rules';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaNotificationPreferenceCard from './MgaNotificationPreferences';

/** Refer file locationCollectionPreference.js in Cordova project*/
const MgaVehicleLocationTracking: React.FC = () => {
  const { t } = useTranslation();
  const id = testID('LocationTracking');
  return (
    <MgaPage focusedEdit title={t('vehicleLocationTracking:title')}>
      <CsfView edgeInsets standardSpacing testID={id()}>
        <CsfText testID={id('textMessages1')}>
          {t('vehicleLocationTracking:textMessages1')}
        </CsfText>
        <CsfText testID={id('textMessages2')}>
          {t('vehicleLocationTracking:textMessages2')}
        </CsfText>
        <CsfText testID={id('textMessages3')}>
          {t('vehicleLocationTracking:textMessages3')}
        </CsfText>
        {has('usr:primary') && (
          <MgaNotificationPreferenceCard preferenceName="driverServicesNotifications" />
        )}
      </CsfView>
    </MgaPage>
  );
};

export default MgaVehicleLocationTracking;
