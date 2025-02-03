import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import {
  useVehicleHealthQuery,
  useVehicleStatusQuery,
  useRecallsQuery,
  getPresentRecalls,
} from '../../api/vehicle.api';
import { useAppNavigation, ScreenList } from '../../Controller';
import { useAppSelector } from '../../store';
import { useCsfColors } from '../../components/useCsfColors';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { canDemo, alertNotInDemo } from '../../features/demo/demo.slice';
import { has, gen1PlusSafetyOnly } from '../../features/menu/rules';
import { canAccessScreen } from '../../utils/menu';
import {
  getVehicleGeneration,
  getVehicleConditionCheck,
  getVehicleWarningItems,
} from '../../utils/vehicle';
import { testID } from '../../components/utils/testID';
import CsfPressable from '../../components/CsfPressable';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import useTracking from '../../components/useTracking';
import CsfBadge from '../../components/CsfBadge';

/** Dashboard footer */
const MgaDashboardFooter: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const isDemo = useAppSelector(s => s.demo);
  const { colors } = useCsfColors();
  const vehicle = useCurrentVehicle();
  const { trackButton } = useTracking();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const vehicleHealthMap = useVehicleHealthQuery(vParams).data?.data;
  const vehicleStatusMap = useVehicleStatusQuery(vParams).data?.data;
  const recallMap = useRecallsQuery(vParams).data?.data;

  /**
   * MGA-2039 - remove maintenance schedule query + alert bar from homepage
   * const maintenanceScheduleMap = null
   * useMaintenanceScheduleQuery(vParams)?.data?.data
   */

  const gen = getVehicleGeneration(vehicle);
  const schedulerOnMainPanel =
    has({ or: ['cap:g0', gen1PlusSafetyOnly] }, vehicle) ||
    (gen == 0 && vehicle && !vehicle.sunsetUpgraded);
  const isHawaiiSecurityUser = has(['reg:HI', 'res:*'], vehicle);
  const allTabs: (keyof ScreenList)[] =
    schedulerOnMainPanel || isHawaiiSecurityUser
      ? ['VehicleStatusLanding', 'MessageCenterLanding', 'DriverAlerts']
      : [
        'VehicleStatusLanding',
        'MessageCenterLanding',
        'DriverAlerts',
        'Scheduler',
      ];
  // Check access
  const allowedTabs = allTabs.filter(tab => canAccessScreen(tab, vehicle));
  // Cut service for now, pending discussion
  // https://subaru4.sharepoint.com/:w:/r/sites/MGACICD/Shared%20Documents/General/App%20Change%20Proposals.docx?d=wa357fd457b144f5cb2afe0f7b00d0a38&csf=1&web=1&e=SnY81K
  const visibleTabs =
    allowedTabs.length <= 3 ? allowedTabs : allowedTabs.slice(0, 3);

  const id = testID('DashboardFooter');
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.dark }}>
      <CsfView
        theme="dark"
        bg="backgroundSecondary"
        style={{
          flexDirection: 'row',
          minHeight: 64,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {visibleTabs.map(tab => {
          switch (tab) {
            case 'VehicleStatusLanding': {
              const warningCount =
                getVehicleWarningItems(vehicleHealthMap).length +
                (getVehicleConditionCheck(
                  vehicle,
                  vehicleHealthMap,
                  vehicleStatusMap,
                )?.issues.length ?? 0);
              const recallCount = getPresentRecalls(recallMap).length;
              /**
               * MGA-2039 - remove maintenance schedule query + alert bar from homepage
               * const isServiceDue = maintenanceScheduleMap?.isServiceDue
               * const showBadge = warningCount > 0 || recallCount > 0 || isServiceDue
               */
              const showBadge = warningCount > 0 || recallCount > 0;
              return (
                <CsfPressable
                  accessibilityLabel={t('vehicleStatusLanding:vehicleStatus')}
                  key={tab}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignContent: 'center',
                  }}
                  onPress={() => {
                    trackButton({
                      title: t('vehicleStatusLanding:vehicleStatus'),
                      trackingId: 'FooterVehicleStatusLandingButton',
                    });
                    navigation.push('VehicleStatusLanding');
                  }}>
                  <CsfView justify="center">
                    <CsfText
                      color="light"
                      variant="button2"
                      testID={id('vehicleStatus')}>
                      {t('vehicleStatusLanding:vehicleStatus')}
                    </CsfText>
                  </CsfView>
                  {showBadge && <CsfBadge />}
                </CsfPressable>
              );
            }
            case 'MessageCenterLanding':
              return (
                <CsfPressable
                  accessibilityLabel={t('home:offersEvents')}
                  key={tab}
                  style={{ flex: 1 }}
                  onPress={() => {
                    trackButton({
                      title: t('home:offersEvents'),
                      trackingId: 'FooterOffersEventsLandingButton',
                    });
                    !isDemo || canDemo('MessageCenterLanding')
                      ? navigation.push('MessageCenterLanding')
                      : void alertNotInDemo();
                  }}>
                  <CsfText
                    align="center"
                    color="light"
                    variant="button2"
                    testID={id('offersEvents')}>
                    {t('home:offersEvents')}
                  </CsfText>
                </CsfPressable>
              );
            case 'DriverAlerts':
              return (
                <CsfPressable
                  accessibilityLabel={t('home:setDriverAlerts')}
                  key={tab}
                  style={{ flex: 1 }}
                  onPress={() => {
                    trackButton({
                      title: t('home:setDriverAlerts'),
                      trackingId: 'FooterSetDriverAlertsButton',
                    });
                    navigation.push('DriverAlerts');
                  }}>
                  <CsfText
                    testID={id('driverAlerts')}
                    align="center"
                    variant={'button2'}
                    color={vehicle?.provisioned ? 'light' : 'disabled'}>
                    {t('home:setDriverAlerts')}
                  </CsfText>
                </CsfPressable>
              );
            case 'Scheduler':
              return (
                <CsfPressable
                  key={tab}
                  accessibilityLabel={t('home:service')}
                  style={{ flex: 1 }}
                  onPress={() => {
                    trackButton({
                      trackingId: 'FooterScheduleServiceButton',
                      title: t('home:service'),
                    });
                    navigation.push('Scheduler');
                  }}>
                  <CsfText
                    align="center"
                    color="light"
                    variant={'button2'}
                    testID={id('service')}>
                    {t('home:service')}
                  </CsfText>
                </CsfPressable>
              );
            default:
              return null;
          }
        })}
      </CsfView>
    </SafeAreaView>
  );
};

export default MgaDashboardFooter;
