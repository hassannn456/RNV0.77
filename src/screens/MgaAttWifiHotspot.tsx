import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  MgaVehicleInformationCard,
  MgaVehicleWarrantyInfo,
} from './MgaVehicleInformation';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import { MgaPhoneNumber } from '../components/CsfPhoneNumber';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaAttWifiHotspot: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();

  const id = testID('AttWifiHotspot');
  return (
    <MgaPage title={t('attWifiHotspot:title')} showVehicleInfoBar>
      <MgaPageContent
        title={t('attWifiHotspot:title')}
        description={t('attWifiHotspot:pageDescription')}>
        <MgaPhoneNumber
          trackingId="AttWifiHotspotPhoneButton"
          phone={t('attWifiHotspot:callNumber')}
          variant="primary"
        />

        <CsfCard title={t('attWifiHotspot:hoursOfOperation')}>
          <CsfDetail
            stacked
            label={t('attWifiHotspot:mondayThursday')}
            value={t('attWifiHotspot:mondayThursdayHours')}
            testID={id('mondayThursdayHours')}
          />
          <CsfDetail
            stacked
            label={t('attWifiHotspot:saturdaySunday')}
            value={t('attWifiHotspot:saturdaySundayHours')}
            testID={id('saturdaySundayHours')}
          />
        </CsfCard>

        <MgaVehicleInformationCard
          vehicle={vehicle}
          testID={id('vehicleInfoCard')}
        />
        <MgaVehicleWarrantyInfo testID={id('vehicleWarrantyInfo')} />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAttWifiHotspot;
