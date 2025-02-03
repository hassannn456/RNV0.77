import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import {
  MgaVehicleInformationCard,
  MgaVehicleWarrantyInfo,
} from './MgaVehicleInformation';
import { getVehicleGeneration } from '../utils/vehicle';
import { has } from '../features/menu/rules';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import { MgaPhoneNumber } from '../components/CsfPhoneNumber';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

const MgaSubaruCustomerCare: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = getCurrentVehicle();
  const vehicleGeneration = getVehicleGeneration(vehicle);
  const isNonSecondaryUser = !vehicle?.authorizedVehicle;
  const isNonHawaii = !has('reg:HI', vehicle);

  const id = testID('SubaruCustomerCare');
  return (
    <MgaPage
      title={t('subaruCustomerCare:subaruCustomerSupport')}
      showVehicleInfoBar>
      <CsfView gap={16} p={8} testID={id()}>
        <CsfView edgeInsets standardSpacing>
          <CsfText
            align="center"
            variant="title2"
            testID={id('subaruCustomerSupport')}>
            {t('subaruCustomerCare:subaruCustomerSupport')}
          </CsfText>
        </CsfView>
        <CsfText testID={id('needAnswers')}>
          {t('subaruCustomerCare:needAnswers')}
        </CsfText>

        <MgaPhoneNumber
          trackingId="CustomerSupportPhoneButton"
          variant="primary"
          title={t('contact:customerSupportNumber')}
          phone={t('contact:customerSupportNumber')}
        />
      </CsfView>
      <CsfView p={8} gap={16}>
        <CsfCard
          title={t('subaruCustomerCare:hoursOfOperation')}
          testID={id('hoursOfOperation')}>
          <CsfRuleList testID={id('list')}>
            <CsfDetail
              label={t('subaruCustomerCare:mondayThursday')}
              value={t('subaruCustomerCare:mondayThursdayTimings')}
              testID={id('mondayThursdayTimings')}
            />
            <CsfDetail
              label={t('subaruCustomerCare:friday')}
              value={t('subaruCustomerCare:fridayTimings')}
              testID={id('fridayTimings')}
            />
            <CsfDetail
              label={t('subaruCustomerCare:saturday')}
              value={t('subaruCustomerCare:saturdayTimings')}
              testID={id('saturday')}
            />
          </CsfRuleList>
        </CsfCard>
        <MgaVehicleInformationCard
          vehicle={vehicle}
          testID={id('vehicleInformation')}
        />
        {vehicleGeneration === 0 && (isNonSecondaryUser || isNonHawaii) && (
          <MgaVehicleWarrantyInfo testID={id('vehicleWarrantyInfo')} />
        )}
      </CsfView>
    </MgaPage>
  );
};

export default MgaSubaruCustomerCare;
