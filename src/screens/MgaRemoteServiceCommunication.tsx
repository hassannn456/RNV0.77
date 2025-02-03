import React from 'react';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useTranslation } from 'react-i18next';
import { gen2Plus, has } from '../features/menu/rules';
import { MgaRemoteServiceCommunicationGen1 } from './MgaRemoteServiceCommunicationGen1';
import { MgaRemoteServiceCommunicationGen2Plus } from './MgaRemoteServiceCommunicationGen2Plus';
import { useNotificationPreferencesGen2Query } from '../features/starlinkcommunications/starlinkcommunications.api';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import MgaCommunicationPreferencesC25 from './MgaCommunicationPreferencesC25';

const MgaRemoteServiceCommunication: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();

  const { data } = useNotificationPreferencesGen2Query({ vin: vehicle?.vin });

  const dangerouslyFilterOldPreferences =
    data?.data?.preferences?.filter(d =>
      d.preferenceName.toLowerCase().includes('security alarm'),
    ) || [];

  const hasOldPreferences = dangerouslyFilterOldPreferences.length > 0;

  return (
    <MgaPage title={t('communicationPreferences:communicationPreferenceTitle')}>
      <MgaPageContent
        title={t('communicationPreferences:communicationPreferenceTitle')}
        isLoading={!vehicle}>
        {has(gen2Plus, vehicle) ? (
          hasOldPreferences ? (
            <MgaRemoteServiceCommunicationGen2Plus /> // old preferences UI
          ) : (
            <MgaCommunicationPreferencesC25 /> // new preferences UI
          )
        ) : (
          <MgaRemoteServiceCommunicationGen1 />
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaRemoteServiceCommunication;
