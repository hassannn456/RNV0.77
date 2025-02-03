import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  getServiceDescription,
  useMaintenanceScheduleQuery,
} from '../api/maintenanceSchedule.api';
import {
  useVehicleHealthQuery,
  useVehicleStatusQuery,
} from '../api/vehicle.api';
import { useAppNavigation } from '../Controller';
import { CsfScrollRefContext } from '../components/CsfScrollView';
import { useCsfColors } from '../components/useCsfColors';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { canAccessScreen } from '../utils/menu';
import { formatFullDateTime } from '../utils/dates';
import WindowStatus from '../../content/svg/VehicleConditionCheck/window-status.svg';
import {
  VehicleConditionCheck,
  getVehicleConditionCheck,
  hasDoorInfo,
  hasMoonroof,
} from '../utils/vehicle';
import i18n from '../i18n';
import CsfAlertBar from '../components/CsfAlertBar';
import { useAppSelector } from '../store';
import { canDemo, alertNotInDemo } from '../features/demo/demo.slice';
import { normalizeFuelPercent } from '../utils/normalizeFuel';
import { testID } from '../components/utils/testID';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import CsfInfoButton from '../components/CsfInfoButton';
import { CsfPager } from '../components/CsfPager';
import CsfRule from '../components/CsfRule';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import CsfStatusBar from '../components/CsfAlertBar';
import MgaCarView from '../components/MgaCarView';

const carStyles = StyleSheet.create({
  pageContainer: { height: 444 },
});

const CsfDoorStatusText: React.FC<{
  lock?: string | false | null | undefined
  position: string | null | undefined
  testID?: string
}> = ({ lock, position, testID: testId }) => {
  const { t } = useTranslation();
  const id = testID(testId);
  const isError =
    position == 'OPEN' || (position == 'CLOSED' && lock == 'UNLOCKED');
  return (
    <CsfView flexDirection="row" testID={testId}>
      <CsfText
        color={isError ? 'error' : 'copyPrimary'}
        testID={id('doorStatus')}>
        {(() => {
          switch (position) {
            case 'CLOSED':
              return t('vehicleDiagnostics:closed');
            case 'UNKNOWN':
              return '--';
            default:
              return t('vehicleDiagnostics:open');
          }
        })()}
      </CsfText>
      {lock && (
        <CsfText
          color={isError ? 'error' : 'copyPrimary'}
          testID={id('lockedStatusSeparator')}>
          {', '}
        </CsfText>
      )}
      {lock && (
        <CsfText
          color={isError ? 'error' : 'copyPrimary'}
          testID={id('doorLockStatus')}>
          {(() => {
            switch (lock) {
              case 'LOCKED':
                return t('vehicleDiagnostics:locked');
              case 'UNKNOWN':
                return '--';
              default:
                return t('vehicleDiagnostics:unlocked');
            }
          })()}
        </CsfText>
      )}
    </CsfView>
  );
};

const CsfWindowStatusText: React.FC<{
  status: string | null | undefined
  testID?: string
}> = ({ status, ...props }) => {
  const { t } = useTranslation();
  const id = testID(props.testID);
  switch (status) {
    case 'CLOSE':
      return (
        <CsfText testID={id('closed')}>
          {t('vehicleDiagnostics:closed')}
        </CsfText>
      );
    case 'UNKNOWN':
      return <CsfText testID={id('noStatus')}>{'--'}</CsfText>;
    default:
      return (
        <CsfText color="error" testID={id('open')}>
          {t('vehicleDiagnostics:open')}
        </CsfText>
      );
  }
};
// TODO:AG:20240426 -- confirm w/ business whether this text should be different on landing screens.
export const getTireVACText = (
  vcc: VehicleConditionCheck,
  isLandingPage = false,
): string => {
  const { t } = i18n;
  const tireKey = vcc.issues.includes('tirePSI')
    ? 'vehicleDiagnostics:tiresNotGood'
    : 'vehicleDiagnostics:tiresGood';

  if (
    vcc.issues.includes('tirePSI') &&
    vcc?.tirePressureFrontLeft == null &&
    vcc?.tirePressureFrontRight == null &&
    vcc?.tirePressureRearLeft == null &&
    vcc?.tirePressureRearRight == null
  ) {
    return isLandingPage
      ? t('vehicleDiagnostics:tirePressureLowDetected')
      : t(tireKey, {
        count: 0,
      });
  }
  return t(tireKey, {
    count: vcc.tirePressureWarningCount,
  });
};

export const getWindowVACText = (vcc: VehicleConditionCheck): string => {
  const { t } = i18n;
  const windowKey = vcc.windowSunroofWarning
    ? 'vehicleDiagnostics:openWindowsAndMoonroof'
    : 'vehicleDiagnostics:openWindows';
  return t(windowKey, {
    count: vcc.windowOpenCount,
  });
};

export const getDoorVACText = (vcc: VehicleConditionCheck): string => {
  const { t } = i18n;
  return t('vehicleDiagnostics:issueNoted', {
    count: vcc.doorIssueCount,
  });
};

export type TirePressureDetailProps = {
  title: string
  error: boolean
  psi: string
  recommended?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
  testID?: string
}
export const TirePressureDetail: React.FC<TirePressureDetailProps> = ({
  title,
  psi,
  error,
  recommended,
  top,
  bottom,
  left,
  right,
  ...props
}) => {
  const id = testID(props.testID);
  return (
    <CsfView
      flex={1}
      pl={right ? 8 : 0}
      pr={left ? 8 : 0}
      pb={top ? 12 : 0}
      pt={bottom ? 12 : 0}
      mr={right ? 8 : 0}
      gap={12}
      testID={id()}>
      <CsfText variant="caption" testID={id('title')}>
        {title}
      </CsfText>
      <CsfView>
        <CsfText
          color={error ? 'error' : 'copyPrimary'}
          variant="pinButton"
          testID={id('psi')}>
          {psi}
        </CsfText>
        {recommended && (
          <CsfText
            variant="caption"
            color="copySecondary"
            testID={id('recommended')}>
            {recommended}
          </CsfText>
        )}
      </CsfView>
    </CsfView>
  );
};

const MgaVehicleDiagnosticsConditionCheck: React.FC = () => {
  // Hooks
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const isDemo = useAppSelector(s => s.demo);
  const maintenanceSchedule = useMaintenanceScheduleQuery({
    vin: vehicle?.vin ?? '',
  });
  const { data: vhData, isLoading: vhLoading } = useVehicleHealthQuery({
    vin: vehicle?.vin ?? '',
  });
  const { data: vsData, isLoading: vsLoading } = useVehicleStatusQuery({
    vin: vehicle?.vin ?? '',
  });
  const scrollRef = useContext(CsfScrollRefContext);
  // Derived data
  const vehicleConditionCheck: VehicleConditionCheck | undefined =
    getVehicleConditionCheck(vehicle, vhData?.data, vsData?.data);
  const [tireTilePosition, setTireTilePosition] = useState(0);
  const [windowTilePosition, setWindowTilePosition] = useState(0);
  const [doorTilePosition, setDoorTilePosition] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);
  const serviceDescription = getServiceDescription(maintenanceSchedule.data);
  const units: string = t('units:distance');
  const vehicleHasMoonroof = hasMoonroof(vehicle);
  const vehicleHasDoorInfo = hasDoorInfo(vehicle);
  const vehicleHasWindowInfo =
    vehicle?.features?.includes('WDWSTAT') ||
    vehicle?.features?.includes('MOONSTAT');
  const vhWhen = formatFullDateTime(vhData?.data?.lastUpdatedDate);
  const vsWhen = formatFullDateTime(vehicleConditionCheck?.eventDateCarUser);

  const getPanel = (key: string | null) => {
    if (!vehicleConditionCheck || !key) {
      return <CsfView key={key} />;
    }
    switch (key) {
      case 'tire':
        return (
          <CsfView key={key} ph={16}>
            <CsfStatusBar
              onPress={() => {
                if (scrollRef && tireTilePosition) {
                  scrollRef.scrollTo({ y: tireTilePosition + pagerHeight });
                }
              }}
              title={getTireVACText(vehicleConditionCheck)}
              titleTextVariant="body2"
              subtitleTextVariant="body2"
              icon={
                <CsfAppIcon
                  color={
                    vehicleConditionCheck.issues.includes('tirePSI')
                      ? 'error'
                      : 'success'
                  }
                  icon="TirePressure"
                />
              }
              action={
                <CsfText variant="button" color="button">
                  {t('common:view')}
                </CsfText>
              }
            />

            <MgaCarView
              {...{
                tirePressureFrontLeftWarning:
                  vehicleConditionCheck.tirePressureFrontLeftWarning,
                tirePressureFrontRightWarning:
                  vehicleConditionCheck.tirePressureFrontRightWarning,
                tirePressureRearLeftWarning:
                  vehicleConditionCheck.tirePressureRearLeftWarning,
                tirePressureRearRightWarning:
                  vehicleConditionCheck.tirePressureRearRightWarning,
              }}
            />
          </CsfView>
        );
      case 'window':
        return (
          <CsfView key={key} ph={16}>
            <CsfStatusBar
              onPress={() => {
                if (scrollRef && windowTilePosition) {
                  scrollRef.scrollTo({ y: windowTilePosition + pagerHeight });
                }
              }}
              title={getWindowVACText(vehicleConditionCheck)}
              icon={
                <WindowStatus
                  fill={
                    vehicleConditionCheck.issues.includes('windowOpen')
                      ? colors.error
                      : colors.success
                  }
                  stroke={
                    vehicleConditionCheck.issues.includes('windowOpen')
                      ? colors.error
                      : colors.success
                  }
                  width={24}
                  height={24}
                />
              }
              action={
                <CsfText variant="button" color="button">
                  {t('common:view')}
                </CsfText>
              }
            />

            <MgaCarView
              {...{
                windowFrontLeft: vehicleConditionCheck.windowFrontLeftWarning,
                windowFrontRight: vehicleConditionCheck.windowFrontRightWarning,
                windowRearLeft: vehicleConditionCheck.windowRearLeftWarning,
                windowRearRight: vehicleConditionCheck.windowRearRightWarning,
                windowSunroof: vehicleConditionCheck.windowSunroofWarning,
              }}
            />
          </CsfView>
        );
      case 'door':
        return (
          <CsfView key={key} ph={16}>
            <CsfView>
              <CsfStatusBar
                onPress={() => {
                  if (scrollRef && doorTilePosition) {
                    scrollRef.scrollTo({ y: doorTilePosition + pagerHeight });
                  }
                }}
                title={getDoorVACText(vehicleConditionCheck)}
                icon={
                  <CsfAppIcon
                    color={
                      vehicleConditionCheck.issues.includes('doorOpen') ||
                        vehicleConditionCheck.issues.includes('doorUnlocked')
                        ? 'error'
                        : 'success'
                    }
                    icon="Doors"
                  />
                }
                action={
                  <CsfText variant="button" color="button">
                    {t('common:view')}
                  </CsfText>
                }
              />

              <MgaCarView
                {...{
                  doorFrontLeftOpen: vehicleConditionCheck.doorFrontLeftWarning,
                  doorFrontRightOpen:
                    vehicleConditionCheck.doorFrontRightWarning,
                  doorRearLeftOpen: vehicleConditionCheck.doorRearLeftWarning,
                  doorRearRightOpen: vehicleConditionCheck.doorRearRightWarning,
                  doorBootOpen: vehicleConditionCheck.doorBootWarning,
                  doorEngineHoodOpen:
                    vehicleConditionCheck.doorEngineHoodWarning,
                }}
              />
            </CsfView>
          </CsfView>
        );
      default:
        return <CsfView key={key} ph={4} />;
    }
  };
  // Declaring panels in a variable to strip nulls
  // PanelView crashes on null components
  const panelKeys = [
    'tire',
    vehicleHasWindowInfo ? 'window' : null,
    vehicleHasDoorInfo ? 'door' : null,
  ].filter(x => x);
  const panels = panelKeys.map(getPanel);
  const initialPageKey = (() => {
    if (!vehicleConditionCheck) { return ''; }
    if (vehicleConditionCheck.issues.includes('tirePSI')) { return 'tire'; }
    if (vehicleConditionCheck.issues.includes('windowOpen')) { return 'window'; }
    if (vehicleConditionCheck.issues.includes('doorOpen')) { return 'door'; }
    if (vehicleConditionCheck.issues.includes('doorUnlocked')) { return 'door'; }
    return '';
  })();
  const initialPage = Math.max(panelKeys.indexOf(initialPageKey), 0);
  const isLoading = vhLoading || vsLoading;

  const id = testID('VehicleDiagnosticsCondition');
  return !isLoading ? (
    <CsfView gap={16} pv={16} bg="background" testID={id()}>
      <CsfView
        testID={id('referVehicle')}
        onLayout={event => setPagerHeight(event.nativeEvent.layout.height)}>
        <CsfPager initialPage={initialPage} style={carStyles.pageContainer}>
          {panels}
        </CsfPager>
        <CsfText
          align="center"
          color="copySecondary"
          variant="caption"
          testID={id('referVehicleMessage')}>
          {t('vehicleDiagnostics:referVehicleMessage')}
        </CsfText>
      </CsfView>

      <CsfView ph={16} gap={16} testID={id('container')}>
        {/* Odometer / Maintenance */}
        <CsfCard
          testID={id('Odometer')}
          title={t('vehicleConditionCheck:odometer')}
          subtitle={t('home:lastUpdated', { when: vhWhen })}
          gap={16}>
          <CsfText variant="pinButton" testID={id('vehicleMileage')}>
            {vehicle?.vehicleMileage === 0
              ? '--'
              : t('vehicleConditionCheck:distance', {
                distance:
                  units == 'mi'
                    ? vsData?.data?.odometerValue?.toLocaleString()
                    : vsData?.data?.odometerValueKilometers?.toLocaleString(),
              })}
          </CsfText>
          <CsfAlertBar
            type={
              maintenanceSchedule.data?.data?.isServiceDue
                ? 'warning'
                : 'information'
            }
            title={
              maintenanceSchedule.data?.data?.isServiceDue
                ? t('serviceReminder:maintenanceNeeded')
                : t('maintenanceSchedule:nextService')
            }
            testID={id('isServiceDue')}
            subtitle={serviceDescription || undefined}
            flat
            borderWidth={maintenanceSchedule.data?.data?.isServiceDue ? 1 : 0}
            action={
              maintenanceSchedule.isFetching ||
                !maintenanceSchedule.data?.data ? (
                <CsfActivityIndicator />
              ) : (
                <MgaButton
                  trackingId="ViewMaintenanceSchedule"
                  title={t('common:view')}
                  variant="inlineLink"
                  onPress={() => navigation.navigate('MaintenanceSchedule')}
                />
              )
            }
          />

          <MgaButton
            trackingId="MaintenanceSchedule"
            title={t('vehicleDiagnostics:viewMaintenanceSchedule')}
            onPress={() => navigation.navigate('MaintenanceSchedule')}
          />
        </CsfCard>

        {/* Tire Pressure */}
        <CsfCard
          testID={id('tirePressurePSI')}
          title={t('vehicleDiagnostics:tirePressurePSI')}
          subtitle={t('home:lastUpdated', { when: vhWhen })}
          action={
            <CsfInfoButton
              title={t('vehicleDiagnostics:tirePressurePSI')}
              text={t('vehicleDiagnostics:tirePressureInfo', { when: vhWhen })}
            />
          }
          onLayout={event => setTireTilePosition(event.nativeEvent.layout.y)}>
          <CsfView gap={24}>
            <CsfView>
              <CsfView flexDirection="row" testID={id('tirePressure')}>
                <TirePressureDetail
                  testID={id('driverSideFront')}
                  title={t('vehicleDiagnostics:driverSideFront')}
                  error={!!vehicleConditionCheck?.tirePressureFrontLeftWarning}
                  psi={vehicleConditionCheck?.tirePressureFrontLeftPsi || ''}
                  recommended={
                    vehicleConditionCheck?.tireRecommendedFront &&
                    t('vehicleDiagnostics:recommended', {
                      value: vehicleConditionCheck.tireRecommendedFront,
                    })
                  }
                  top
                  left
                />
                <CsfRule orientation="vertical" />

                <TirePressureDetail
                  testID={id('passengerSideFront')}
                  title={t('vehicleDiagnostics:passengerSideFront')}
                  error={!!vehicleConditionCheck?.tirePressureFrontRightWarning}
                  psi={vehicleConditionCheck?.tirePressureFrontRightPsi || ''}
                  recommended={
                    vehicleConditionCheck?.tireRecommendedFront &&
                    t('vehicleDiagnostics:recommended', {
                      value: vehicleConditionCheck.tireRecommendedFront,
                    })
                  }
                  top
                  right
                />
              </CsfView>
              <CsfRule />
              <CsfView flexDirection="row">
                <TirePressureDetail
                  testID={id('driverSideRear')}
                  title={t('vehicleDiagnostics:driverSideRear')}
                  error={!!vehicleConditionCheck?.tirePressureRearLeftWarning}
                  psi={vehicleConditionCheck?.tirePressureRearLeftPsi || ''}
                  recommended={
                    vehicleConditionCheck?.tireRecommendedRear &&
                    t('vehicleDiagnostics:recommended', {
                      value: vehicleConditionCheck.tireRecommendedRear,
                    })
                  }
                  bottom
                  left
                />

                <CsfRule orientation="vertical" />

                <TirePressureDetail
                  testID={id('passengerSideRear')}
                  title={t('vehicleDiagnostics:passengerSideRear')}
                  error={!!vehicleConditionCheck?.tirePressureRearRightWarning}
                  psi={vehicleConditionCheck?.tirePressureRearRightPsi || ''}
                  recommended={
                    vehicleConditionCheck?.tireRecommendedRear &&
                    t('vehicleDiagnostics:recommended', {
                      value: vehicleConditionCheck.tireRecommendedRear,
                    })
                  }
                  bottom
                  right
                />
              </CsfView>
            </CsfView>

            {canAccessScreen('Coupons') && (
              <MgaButton
                trackingId="ViewTirePromotions"
                onPress={() =>
                  !isDemo || canDemo('Coupons')
                    ? navigation.push('Coupons')
                    : alertNotInDemo()
                }
                title={t('vehicleDiagnostics:viewTirePromotions')}
              />
            )}
          </CsfView>
        </CsfCard>
        {/* Windows */}
        {vehicleHasWindowInfo && (
          <CsfCard
            testID={id('windows')}
            onLayout={event =>
              setWindowTilePosition(event.nativeEvent.layout.y)
            }
            title={t('vehicleDiagnostics:windows')}
            subtitle={t('home:lastUpdated', { when: vsWhen })}
            action={
              <CsfInfoButton
                testID={id('windowsInfo')}
                title={t('vehicleDiagnostics:windows')}
                text={t('vehicleDiagnostics:windowsInfo', { when: vhWhen })}
              />
            }>
            <CsfRuleList testID={id('list')}>
              <CsfDetail
                testID={id('driverSideFront')}
                label={t('vehicleDiagnostics:driverSideFront')}
                value={
                  <CsfWindowStatusText
                    testID={id('windowFrontLeftStatus')}
                    status={vehicleConditionCheck?.windowFrontLeftStatus}
                  />
                }
              />

              <CsfDetail
                label={t('vehicleDiagnostics:passengerSideFront')}
                testID={id('passengerSideFront')}
                value={
                  <CsfWindowStatusText
                    testID={id('windowFrontRightStatus')}
                    status={vehicleConditionCheck?.windowFrontRightStatus}
                  />
                }
              />

              {vehicleConditionCheck?.windowRearLeftStatus && (
                <CsfDetail
                  label={t('vehicleDiagnostics:driverSideRear')}
                  testID={id('driverSideRear')}
                  value={
                    <CsfWindowStatusText
                      testID={id('windowRearLeftStatus')}
                      status={vehicleConditionCheck?.windowRearLeftStatus}
                    />
                  }
                />
              )}
              {vehicleConditionCheck?.windowRearRightStatus && (
                <CsfDetail
                  label={t('vehicleDiagnostics:passengerSideRear')}
                  testID={id('passengerSideRear')}
                  value={
                    <CsfWindowStatusText
                      testID={id('windowRearRightStatus')}
                      status={vehicleConditionCheck?.windowRearRightStatus}
                    />
                  }
                />
              )}

              {vehicleHasMoonroof && (
                <CsfDetail
                  label={t('vehicleDiagnostics:moonroof')}
                  testID={id('moonroof')}
                  value={
                    <CsfWindowStatusText
                      testID={id('windowSunroofStatus')}
                      status={vehicleConditionCheck?.windowSunroofStatus}
                    />
                  }
                />
              )}
            </CsfRuleList>
          </CsfCard>
        )}
        {/* Doors */}
        {vehicleHasDoorInfo && (
          <CsfCard
            title={t('vehicleDiagnostics:doorsAndHood')}
            subtitle={t('home:lastUpdated', { when: vsWhen })}
            testID={id('doorsAndHood')}
            action={
              <CsfInfoButton
                title={t('vehicleDiagnostics:doorsAndHood')}
                testID={id('doorAndTailgateInfo')}
                text={t('vehicleDiagnostics:doorAndTailgateInfo', {
                  when: vhWhen,
                })}
              />
            }
            onLayout={event => {
              setDoorTilePosition(event.nativeEvent.layout.y);
            }}>
            <CsfRuleList testID={id('doorList')}>
              {vehicleConditionCheck?.doorFrontLeftPosition && (
                <CsfDetail
                  label={t('vehicleDiagnostics:driverSideFront')}
                  testID={id('driverSideFront')}
                  value={
                    <CsfDoorStatusText
                      testID={id('doorFrontLeftPosition')}
                      lock={vehicleConditionCheck?.doorFrontLeftLockStatus}
                      position={vehicleConditionCheck.doorFrontLeftPosition}
                    />
                  }
                />
              )}

              {vehicleConditionCheck?.doorFrontRightPosition && (
                <CsfDetail
                  testID={id('passengerSideFront')}
                  label={t('vehicleDiagnostics:passengerSideFront')}
                  value={
                    <CsfDoorStatusText
                      testID={id('doorFrontRightPosition')}
                      lock={vehicleConditionCheck?.doorFrontRightLockStatus}
                      position={vehicleConditionCheck.doorFrontRightPosition}
                    />
                  }
                />
              )}

              {vehicleConditionCheck?.doorRearLeftPosition && (
                <CsfDetail
                  label={t('vehicleDiagnostics:driverSideRear')}
                  testID={id('driverSideRear')}
                  value={
                    <CsfDoorStatusText
                      testID={id('doorRearLeftPosition')}
                      lock={vehicleConditionCheck?.doorRearLeftLockStatus}
                      position={vehicleConditionCheck.doorRearLeftPosition}
                    />
                  }
                />
              )}

              {vehicleConditionCheck?.doorRearRightPosition && (
                <CsfDetail
                  label={t('vehicleDiagnostics:passengerSideRear')}
                  testID={id('passengerSideRear')}
                  value={
                    <CsfDoorStatusText
                      testID={id('doorRearRightPosition')}
                      lock={vehicleConditionCheck?.doorRearRightLockStatus}
                      position={vehicleConditionCheck.doorRearRightPosition}
                    />
                  }
                />
              )}

              {vehicleConditionCheck?.doorBootPosition && (
                <CsfDetail
                  label={t('vehicleDiagnostics:doorBoot')}
                  testID={id('doorBoot')}
                  value={
                    <CsfDoorStatusText
                      testID={id('doorBootPosition')}
                      lock={vehicleConditionCheck?.doorBootLockStatus}
                      position={vehicleConditionCheck.doorBootPosition}
                    />
                  }
                />
              )}

              {vehicleConditionCheck?.doorEngineHoodPosition && (
                <CsfDetail
                  label={t('vehicleDiagnostics:engine')}
                  testID={id('engine')}
                  value={
                    <CsfDoorStatusText
                      position={vehicleConditionCheck.doorEngineHoodPosition}
                      testID={id('doorEngineHoodPosition')}
                    />
                  }
                />
              )}
            </CsfRuleList>
          </CsfCard>
        )}
        {/* Fuel */}
        <CsfCard
          title={t('vehicleDiagnostics:fuel')}
          testID={id('fuel')}
          subtitle={t('home:lastUpdated', { when: vhWhen })}
          action={
            <CsfInfoButton
              title={t('vehicleDiagnostics:fuel')}
              testID={id('fuel')}
              text={t('vehicleDiagnostics:fuelInfo', {
                when: vhWhen,
              })}
            />
          }>
          <CsfView pv={12}>
            {vehicleConditionCheck.remainingFuelPercent ? (
              <CsfView gap={8} testID={id('remainingFuelPercent')}>
                {/* Fuel gauge */}
                <CsfView align="center" flexDirection="row" gap={8}>
                  <CsfText variant="subheading" testID={id('empty')}>
                    {t('vehicleDiagnostics:empty')}
                  </CsfText>
                  <CsfView
                    flex={1}
                    height={12}
                    borderRadius={8}
                    style={{ overflow: 'hidden' }}>
                    <CsfView
                      flexDirection="column"
                      style={{ justifyContent: 'flex-end' }}>
                      <CsfView>
                        <CsfView
                          bg="rule"
                          width={'100%'}
                          height={12}
                          style={{ position: 'absolute' }}
                        />
                        <CsfView
                          bg={
                            vehicleConditionCheck.issues.includes('fuelLow')
                              ? 'error'
                              : 'success'
                          }
                          width={`${normalizeFuelPercent(
                            vehicleConditionCheck.remainingFuelPercent,
                          )}%`}
                          height={12}
                          style={{ position: 'absolute' }}
                          testID={id('issues')}
                        />

                        <CsfView
                          style={{ position: 'absolute' }}
                          align="flex-end"
                          flexDirection="row"
                          justify="space-between"
                          width="100%">
                          <CsfView bg="clear" width={2} height={8} />
                          <CsfView
                            bg="backgroundSecondary"
                            width={2}
                            height={12}
                          />
                          <CsfView
                            bg="backgroundSecondary"
                            width={2}
                            height={12}
                          />
                          <CsfView
                            bg="backgroundSecondary"
                            width={2}
                            height={12}
                          />
                          <CsfView bg="clear" width={2} height={8} />
                        </CsfView>
                      </CsfView>
                    </CsfView>
                  </CsfView>
                  <CsfText variant="subheading" testID={id('full')}>
                    {t('vehicleDiagnostics:full')}
                  </CsfText>
                </CsfView>
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText variant="caption" testID={id('distanceToEmpty')}>
                    {t('vehicleDiagnostics:untilEmpty')}
                    {': '}
                    {units == 'mi'
                      ? vehicleConditionCheck.distanceToEmptyFuelMiles10s ??
                      '--'
                      : vehicleConditionCheck.distanceToEmptyFuelKilometers10s ??
                      '--'}{' '}
                    {units}
                  </CsfText>
                  <CsfText variant="caption" testID={id('average')}>
                    {units == 'mi'
                      ? vehicleConditionCheck.avgFuelConsumptionMpg ?? '--'
                      : vehicleConditionCheck.avgFuelConsumptionLitersPer100Kilometers ??
                      '--'}{' '}
                    {units == 'mi'
                      ? t('vehicleDiagnostics:averageMPG')
                      : t('vehicleDiagnostics:averageLP100Km')}
                  </CsfText>
                </CsfView>
              </CsfView>
            ) : (
              <CsfView>
                <CsfView
                  align="center"
                  flexDirection="row"
                  justify="space-between"
                  minHeight={32}>
                  <CsfText testID={id('untilEmpty')}>
                    {t('vehicleDiagnostics:untilEmpty')}
                  </CsfText>
                  <CsfText testID={id('distanceToEmpty')}>
                    {units == 'mi'
                      ? vehicleConditionCheck.distanceToEmptyFuelMiles ?? '--'
                      : vehicleConditionCheck.distanceToEmptyFuelKilometers ??
                      '--'}{' '}
                    {units}
                  </CsfText>
                </CsfView>
                <CsfRule />
                <CsfView
                  align="center"
                  flexDirection="row"
                  justify="space-between"
                  minHeight={32}>
                  <CsfText testID={id('average')}>
                    {units == 'mi'
                      ? t('vehicleDiagnostics:averageMPG')
                      : t('vehicleDiagnostics:averageLP100Km')}
                  </CsfText>
                  <CsfText testID={id('avgFuelConsumption')}>
                    {units == 'mi'
                      ? vehicleConditionCheck.avgFuelConsumptionMpg ?? '--'
                      : vehicleConditionCheck.avgFuelConsumptionLitersPer100Kilometers ??
                      '--'}
                  </CsfText>
                </CsfView>
              </CsfView>
            )}
          </CsfView>
        </CsfCard>
      </CsfView>
    </CsfView>
  ) : (
    <CsfView>
      <CsfActivityIndicator />
    </CsfView>
  );
};


export default MgaVehicleDiagnosticsConditionCheck;
