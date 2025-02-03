import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppNavigation } from '../Controller';
import { useSasInfoQuery, useVehicleInfoQuery } from '../api/vehicle.api';
import { ClientSessionVehicle } from '../../@types';
import { formatCurrencyForBilling } from '../utils/subscriptions';
import { has, gen2Plus } from '../features/menu/rules';
import { displayVehicleMileage } from '../utils/vehicle';
import { useTimeZones } from '../features/admin/admin.api';
import { testID } from '../components/utils/testID';
import { CsfViewProps, CsfDropdownItem } from '../components';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import CsfInfoButton from '../components/CsfInfoButton';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import MgaStarlinkPlans from '../components/MgaStarlinkPlans';

export const MgaVehicleMileageField: React.FC<{
  value?: string | number | null
  testID?: string
}> = props => {
  const id = testID(props.testID);
  const { t } = useTranslation();
  return (
    <CsfDetail
      label={
        has({ or: ['sub:NONE', 'cap:g0'] })
          ? t('vehicleInformation:estimatedMileage')
          : has(['cap:g1', { not: 'sub:NONE' }])
            ? t('vehicleInformation:lastRecordedMileageLabel')
            : has([gen2Plus, { not: 'sub:NONE' }])
              ? t('vehicleInformation:currentMileage')
              : null
      }
      testID={id()}
      value={
        <CsfView
          gap={4}
          flexDirection="row"
          align={'center'}
          testID={id('mileageContainer')}>
          <CsfText testID={id('mileageValue')}>{props.value}</CsfText>
          {has({ or: ['sub:NONE', 'cap:g0'] }) && (
            <CsfInfoButton
              title={t('vehicleInformation:estimatedMileage')}
              text={t('vehicleInformation:mileageDescription5')}
              testID={id('estimatedMileageInfo')}
            />
          )}
          {has(['cap:g1', { not: 'sub:NONE' }]) && (
            <CsfInfoButton
              title={t('vehicleInformation:lastRecordedMileageLabel')}
              text={t('vehicleInformation:mileageUpdate')}
              testID={id('lastRecordedMileageLabelInfo')}
            />
          )}
          {has([gen2Plus, { not: 'sub:NONE' }]) && (
            <CsfInfoButton
              title={t('vehicleInformation:currentMileage')}
              text={t('vehicleInformation:mileageDescription2')}
              testID={id('currentMileageInfo')}
            />
          )}
        </CsfView>
      }
    />
  );
};

export const MgaVehicleWarrantyInfo: React.FC<CsfViewProps> = props => {
  const { t } = useTranslation();
  const sasInfo = useSasInfoQuery({});
  const id = testID(props.testID);
  return (
    sasInfo.data &&
    sasInfo.data.success &&
    sasInfo.data.data && (
      <CsfCard
        title={t('vehicleInformation:addedSecurityInformation')}
        testID={id('addedSecurityInformation')}>
        <CsfRuleList testID={id('list')}>
          <CsfDetail
            label={t('vehicleInformation:agreementDescription')}
            value={sasInfo.data.data.planDescription ?? '-'}
            testID={id('agreementDescription')}
            stacked
          />
          <CsfDetail
            label={t('vehicleInformation:agreementExpirationDate')}
            value={sasInfo.data.data.contractExpirationDate ?? '-'}
            testID={id('agreementExpirationDate')}
          />
        </CsfRuleList>
      </CsfCard>
    )
  );
};

export const MgaVehicleInformationCard: React.FC<{
  vehicle?: ClientSessionVehicle | null | undefined
  testID?: string
}> = ({ vehicle, ...props }) => {
  const { t } = useTranslation();
  const id = testID(props.testID);
  return (
    <CsfCard title={t('vehicleInformation:title')} testID={id('title')}>
      <CsfRuleList testID={id('list')}>
        <CsfDetail
          label={t('common:vin')}
          value={vehicle?.vin}
          testID={id('vin')}
        />
        <MgaVehicleMileageField
          value={displayVehicleMileage(vehicle)}
          testID={id('mileageField')}
        />
        {has('flg:mga.myVehicle.licensePlate') && (
          <CsfDetail
            label={t('vehicleInformation:licensePlateNumber')}
            testID={id('licensePlateNumber')}
            value={`${vehicle?.licensePlateState ?? ''} ${vehicle?.licensePlate ?? ''
              }`}
          />
        )}
      </CsfRuleList>
    </CsfCard>
  );
};

export const MgaVehicleInformationDetails: React.FC<{
  vehicle?: ClientSessionVehicle
  title?: string
  testID?: string
}> = ({ vehicle, title, ...props }) => {
  const { t } = useTranslation();
  const id = testID(props.testID);
  const body = (
    <CsfCard
      title={title || t('vehicleInformation:title')}
      testID={id('vehicleInfo')}>
      <CsfRuleList testID={id('ruleList')}>
        <CsfDetail
          label={t('common:vin')}
          value={vehicle?.vin}
          testID={id('vin')}
        />

        <CsfDetail
          label={t('vehicleInformation:model')}
          value={vehicle?.modelName}
          testID={id('model')}
        />
        <CsfDetail
          label={t('vehicleInformation:year')}
          value={vehicle?.modelYear}
          testID={id('modelYear')}
        />

        <CsfDetail
          label={t('vehicleInformation:engine')}
          value={vehicle?.engineSize ? String(vehicle.engineSize) : ' '}
          testID={id('engine')}
        />
        <CsfDetail
          label={t('vehicleInformation:transmission')}
          value={vehicle?.transCode}
          testID={id('transmission')}
        />
        <CsfDetail
          label={t('vehicleInformation:exteriorColor')}
          value={vehicle?.extDescrip}
          testID={id('exteriorColor')}
        />
        <CsfDetail
          label={t('vehicleInformation:interiorColor')}
          value={vehicle?.intDescrip}
          testID={id('interiorColor')}
        />
      </CsfRuleList>
    </CsfCard>
  );

  return body;
};

export const MgaVehicleInformation: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const timeZones = useTimeZones();
  const selectedTimeZone = timeZones?.find(
    (item: CsfDropdownItem) => item.value === vehicle?.timeZone,
  );
  const vehicleInfo = useVehicleInfoQuery({ vin: vehicle?.vin });

  // NOTE: Android crashes if maximumFractionDigits is set without setting minimumFractionDigits
  const tradeInValue: number | string = vehicleInfo.data?.data?.tradeInValue
    ? formatCurrencyForBilling(parseInt(vehicleInfo.data.data.tradeInValue), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    : t('vehicleInformation:gtpNotEligible');
  if (!vehicle) {
    return null;
  }
  return (
    <MgaPage title={t('vehicleInformation:title')}>
      <MgaPageContent
        title={vehicle?.nickname || t('vehicleInformation:title')}>
        <CsfView gap={16}>
          <MgaVehicleInformationDetails vehicle={vehicle} />

          <CsfCard
            title={t('vehicleInformation:heading')}
            action={
              has('usr:primary') && (
                <MgaButton
                  aria-label={t('manageVehicle:title')}
                  trackingId="VehicleEditButton"
                  title={t('common:edit')}
                  variant="inlineLink"
                  onPress={() =>
                    navigation.navigate('VehicleEdit', {
                      action: 'edit',
                      vehicle,
                    })
                  }
                />
              )
            }>
            <CsfRuleList>
              <CsfDetail
                label={t('vehicleInformation:vehicleNickname')}
                value={vehicle.nickname}
              />
              <MgaVehicleMileageField value={displayVehicleMileage(vehicle)} />
              {has('flg:mga.myVehicle.licensePlate') && (
                <CsfDetail
                  label={t('vehicleInformation:licensePlate')}
                  value={`${vehicle?.licensePlateState || ''} ${vehicle?.licensePlate || ''
                    }`}
                />
              )}

              {has({ not: 'cap:g1' }) && (
                <CsfDetail
                  label={t('vehicleInformation:timeZone')}
                  value={selectedTimeZone?.label}
                />
              )}
            </CsfRuleList>
          </CsfCard>

          {has(
            [
              { not: 'reg:HI' },
              'usr:primary',
              'flg:mga.myVehicle.guaranteedTradeProgram',
            ],
            vehicle,
          ) && (
              <CsfCard title={t('vehicleInformation:gtpLabel')} gap={16}>
                <CsfAlertBar title={tradeInValue} flat />
                <CsfText color="copySecondary">
                  {t('vehicleInformation:disclaimerInfo')}
                </CsfText>
              </CsfCard>
            )}
          {has(['usr:primary', 'flg:mga.myVehicle.warrantyInfo']) && (
            <MgaVehicleWarrantyInfo />
          )}
          <MgaStarlinkPlans />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};
