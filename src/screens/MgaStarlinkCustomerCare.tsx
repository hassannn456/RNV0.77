import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MgaVehicleInformationCard,
  MgaVehicleWarrantyInfo,
} from './MgaVehicleInformation';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useVehicleInfoQuery } from '../api/vehicle.api';
import { testID } from '../components/utils/testID';
import { MgaPhoneNumber } from '../components/CsfPhoneNumber';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaStarlinkCustomerCare: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  // Vehicle info updates mileage in vehicle object
  const { isFetching } = useVehicleInfoQuery({ vin: vehicle?.vin });
  const id = testID('StarlinkCustomerCare');
  return (
    <MgaPage title={t('starlinkCustomerCare:title')} showVehicleInfoBar>
      <MgaPageContent
        isLoading={!vehicle}
        title={t('starlinkCustomerCare:title')}>
        <CsfView edgeInsets standardSpacing testID={id()}>
          <CsfText testID={id('callSupport')}>
            {t('starlinkCustomerCare:callSupport')}
          </CsfText>
          <MgaPhoneNumber
            trackingId="StarlinkCustomerSupportNumber"
            phone={t('contact:starlinkCustomerSupportNumber')}
            variant="primary"
          />
          <CsfText testID={id('alwaysAvailable')}>
            {t('starlinkCustomerCare:alwaysAvailable')}
          </CsfText>
          <CsfView isLoading={isFetching} standardSpacing>
            <MgaVehicleInformationCard
              vehicle={vehicle}
              testID={id('vehicleInfo')}
            />
            <MgaVehicleWarrantyInfo testID={id('vehicleWarrantyInfo')} />
          </CsfView>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaStarlinkCustomerCare;
