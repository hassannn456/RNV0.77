import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useVehicleHealthQuery,
  useVehicleStatusQuery,
  useRecallsQuery,
  getPresentRecalls,
} from '../../api/vehicle.api';
import { useAppNavigation } from '../../Controller';

import { CsfColorPalette } from '../../components/useCsfColors';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { has, gen1Plus, subSafetyPlus } from '../../features/menu/rules';
import { formatFullDateTime } from '../../utils/dates';
import {
  getVehicleConditionCheck,
  getVehicleConditionCheckCount,
} from '../../utils/vehicle';
import { testID } from '../../components/utils/testID';
import useTracking from '../../components/useTracking';
import CsfAppIcon from '../../components/CsfAppIcon';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import CsfText from '../../components/CsfText';
import CsfListItem from '../../components/CsfListItem';

const MgaVehicleAlertBanner: React.FC = () => {
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const { trackButton } = useTracking();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const vehicleHealthMap = useVehicleHealthQuery(vParams).data?.data;
  const vehicleStatusMap = useVehicleStatusQuery(vParams).data?.data;
  const recallMap = useRecallsQuery({ vin: vehicle?.vin ?? '' }).data?.data;
  const vehicleConditionCheck = getVehicleConditionCheck(
    vehicle,
    vehicleHealthMap,
    vehicleStatusMap,
  );
  const warningCount = getVehicleConditionCheckCount(
    vehicleHealthMap,
    vehicleConditionCheck,
  );
  const recallCount = getPresentRecalls(recallMap).length;
  const text: string =
    recallCount > 0
      ? t('home:healthReport_Recall')
      : t('home:healthReport_Warning', { count: warningCount });
  const color: keyof CsfColorPalette =
    recallCount > 0 || warningCount > 0 ? 'error' : 'success';
  const showBar =
    has([gen1Plus, subSafetyPlus, 'car:Provisioned'], vehicle) ||
    recallCount > 0;
  const lastUpdatedDate =
    recallCount > 0
      ? recallMap?.lastUpdatedDate
      : vehicleHealthMap?.lastUpdatedDate;

  const id = testID('DashboardAlert');
  return (
    showBar && (
      <CsfListItem
        pv={0}
        ph={0}
        testID={id('VehicleStatusAlertBanner')}
        onPress={() => {
          trackButton({
            title: text,
            trackingId: 'VehicleStatusAlertBanner',
          });
          navigation.push('VehicleStatusLanding');
        }}
        icon={
          vehicleHealthMap ? (
            <CsfAppIcon
              icon="SendToVehicle"
              color={color}
              key="success"
              size="lg"
            />
          ) : (
            <CsfActivityIndicator color={color} />
          )
        }
        title={
          <CsfText
            variant={'button'}
            color={color}
            testID={id('VehicleStatusAlertText')}>
            {text}
          </CsfText>
        }
        subtitle={t('home:lastUpdated', {
          //TODO:UA:20240115 Update this to use relative timestamp (e.g. 5 minutes ago).
          when: formatFullDateTime(lastUpdatedDate),
        })}
        subtitleTextVariant="caption"
        action={
          <CsfAppIcon icon="BackForwardArrow" color={color} size={'sm'} />
        }
      />
    )
  );
};

export default MgaVehicleAlertBanner;
