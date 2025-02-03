import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, useAppRoute } from '../Controller';
import { useVehicleInfoQuery } from '../api/vehicle.api';
import {
  MgaVehicleInformationDetails,
  MgaVehicleMileageField,
} from './MgaVehicleInformation';
import { useTimeZones } from '../features/admin/admin.api';
import { has } from '../features/menu/rules';
import { displayVehicleMileage } from '../utils/vehicle';
import { testID } from '../components/utils/testID';
import { CsfDropdownItem } from '../components';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaVehicleDetail: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'VehicleDetail'>();
  const timeZones = useTimeZones();
  const { data: vehicleInfoQueryResponse, isFetching } = useVehicleInfoQuery({
    vin: route.params?.vehicle?.vin,
  });
  const vehicle =
    vehicleInfoQueryResponse?.data?.vehicle || route.params?.vehicle;
  const selectedTimeZone = timeZones?.find(
    (item: CsfDropdownItem) => item.value === vehicle?.timeZone,
  );
  const id = testID('VehicleDetail');

  return (
    <MgaPage title={t('index:myVehicles')} bg="background" showVehicleInfoBar>
      <MgaPageContent
        isLoading={isFetching}
        title={vehicle?.nickname || t('vehicleDetail:myVehicle')}>
        <MgaVehicleInformationDetails
          vehicle={vehicleInfoQueryResponse?.data?.vehicle}
          testID={id('vehicleDetail')}
        />
        <CsfCard
          title={t('vehicleInformation:heading')}
          testID={id('vehicleInfoCard')}
          action={
            has('usr:primary') && (
              <MgaButton
                trackingId="VehicleEditButton"
                variant="inlineLink"
                title="Edit"
                onPress={() =>
                  navigate('VehicleEdit', { action: 'edit', vehicle })
                }
              />
            )
          }>
          <CsfRuleList>
            <CsfDetail
              label={t('vehicleInformation:nickname')}
              value={vehicle?.nickname || ''}
              testID={id('nickname')}
            />

            <MgaVehicleMileageField
              value={displayVehicleMileage(vehicle)}
              testID={id('mileageDetails')}
            />

            {has('flg:mga.myVehicle.licensePlate') && (
              <CsfDetail
                label={t('vehicleInformation:licensePlate')}
                value={`${vehicle?.licensePlateState || ''} ${vehicle?.licensePlate || ''
                  }`}
                testID={id('licensePlate')}
              />
            )}

            <CsfDetail
              label={t('vehicleInformation:timeZone')}
              value={selectedTimeZone?.label}
              testID={id('timeZone')}
            />
          </CsfRuleList>
        </CsfCard>

        <CsfView>
          <CsfText variant="heading" align="center" testID={id('noLongerOwn')}>
            {t('manageVehicle:noLongerOwn')}
          </CsfText>
          <CsfText variant="body2" align="center" testID={id('visitDesktop')}>
            {t('manageVehicle:visitDesktop')}
          </CsfText>
        </CsfView>
        <MgaButton
          trackingId="VisitMySubaruButton"
          variant="link"
          icon="OutboundLink"
          title={t('manageVehicle:visitMySubaru')}
          testID={id('visitMySubaru')}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaVehicleDetail;
