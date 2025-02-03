import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatFullDateTime } from '../utils/dates';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppNavigation } from '../Controller';
import {
  getServiceDescription,
  useMaintenanceScheduleQuery,
} from '../api/maintenanceSchedule.api';
import {
  getPresentRecalls,
  useRecallsQuery,
  useVehicleHealthQuery,
  useVehicleStatusQuery,
} from '../api/vehicle.api';
import {
  getVehicleConditionCheck,
  getVehicleConditionCheckCount,
} from '../utils/vehicle';
import {
  getTireVACText,
  getWindowVACText,
} from './MgaVehicleDiagnosticsConditionCheck';
import { gen1Plus, gen2Plus, has, subSafetyPlus } from '../features/menu/rules';
import { canAccessScreen } from '../utils/menu';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfCard from '../components/CsfCard';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import { CsfTileDefaultProps } from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

const rvccStyles = StyleSheet.create({
  rvccDotPadding: {
    // Center dot under heart
    paddingLeft: 16,
    // Align "Health Report" under "Vehicle Diagnostics"
    paddingRight: 16,
    // Align dot to text
    paddingVertical: 6,
  },
  rvccNoDotPadding: {
    // Align text
    paddingLeft: 32,
  },
});

/** Landing page for RVCC from dashboard. */
const MgaVehicleStatusLanding: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const vehicleHealthMap = useVehicleHealthQuery(vParams)?.data?.data;
  const vehicleStatusMap = useVehicleStatusQuery(vParams)?.data?.data;
  const recallMap = useRecallsQuery(vParams)?.data?.data;
  const { data: maintenanceSchedule } = useMaintenanceScheduleQuery(vParams);
  const healthReport = (vehicleHealthMap?.vehicleHealthItems ?? []).filter(
    v => v.isTrouble,
  );
  const conditionCheck = getVehicleConditionCheck(
    vehicle,
    vehicleHealthMap,
    vehicleStatusMap,
  );
  const conditionCheckIssues: string[] =
    conditionCheck?.issues.map(key => {
      switch (key) {
        case 'doorOpen':
          return t(
            conditionCheck.doorEngineHoodWarning && conditionCheck.doorBootOpen
              ? 'vehicleDiagnostics:openDoorsTailgateAndHood'
              : conditionCheck.doorEngineHoodWarning
                ? 'vehicleDiagnostics:openDoorsAndHood'
                : conditionCheck.doorBootOpen
                  ? 'vehicleDiagnostics:openDoorsAndTailgate'
                  : 'vehicleDiagnostics:openDoors',
            {
              count: conditionCheck.doorOpenCount,
            },
          );
        case 'doorUnlocked':
          return t(
            conditionCheck.doorBootUnlocked
              ? 'vehicleDiagnostics:unlockedDoorsAndTailgate'
              : 'vehicleDiagnostics:unlockedDoors',
            {
              count:
                conditionCheck.doorOpenCount + conditionCheck.doorUnlockedCount,
            },
          );
        case 'fuelLow':
          return t('vehicleDiagnostics:fuelIssue');
        case 'windowOpen':
          return getWindowVACText(conditionCheck);
        case 'tirePSI':
          return getTireVACText(conditionCheck, true);
      }
      return '';
    }) ?? [];

  const warningCount = getVehicleConditionCheckCount(
    vehicleHealthMap,
    conditionCheck,
  );
  const recalls = getPresentRecalls(recallMap);
  const serviceDescription = getServiceDescription(maintenanceSchedule);
  const isServiceDue = maintenanceSchedule?.data?.isServiceDue;
  const vhrLabel: string = canAccessScreen('VehicleDiagnostics')
    ? t('vehicleDiagnostics:title')
    : t('vehicleHealth:title');
  const vhrAction = () => {
    if (canAccessScreen('VehicleDiagnostics')) {
      navigation.push('VehicleDiagnostics');
    } else if (canAccessScreen('VehicleHealthReport')) {
      navigation.push('VehicleHealthReport');
    } else {
      CsfSimpleAlert(t('common:alert'), t('home:vehicleHealthCannotUpdated'), {
        type: 'warning',
      });
    }
  };
  return (
    <MgaPage
      bg="background"
      title={t('vehicleStatusLanding:vehicleStatus')}
      showVehicleInfoBar>
      <MgaPageContent title={t('vehicleStatusLanding:vehicleStatus')}>
        {/* MGA-1560: Remove Provisioned check */}
        {/* TODO:UA: replace subSafetyPlus with appropriate post-c25 access rule  */}
        {has([gen1Plus, subSafetyPlus], vehicle) && (
          <CsfView gap={4}>
            <CsfText italic align="center">
              {t('home:lastUpdated', {
                //TODO:UA:20240115 Update this to use relative timestamp (e.g. 5 minutes ago).
                when: formatFullDateTime(vehicleHealthMap?.lastUpdatedDate),
              })}
            </CsfText>
            <MgaButton
              trackingId="VehicleStatusImportantInfoButton"
              variant="inlineLink"
              title={t('vehicleHealth:importantInfoLink')}
              onPress={() =>
                CsfSimpleAlert(
                  t('vehicleHealth:importantInfoLink'),
                  t('vehicleHealth:importantInfoMessage'),
                )
              }
            />
          </CsfView>
        )}

        <CsfView gap={16}>
          {has([gen1Plus, subSafetyPlus], vehicle) && (
            <CsfCard
              bg="backgroundSecondary"
              borderColor={warningCount == 0 ? undefined : 'error'}

              title={vhrLabel}
              subtitle={
                warningCount == 0
                  ? t('home:reportedSystemsNormal')
                  : t('home:issueNoted', {
                    count: warningCount,
                  })
              }
              icon={
                <CsfAppIcon
                  icon="SubaruMysVehicleStatusIcon"
                  color={warningCount == 0 ? 'success' : 'error'}
                />
              }
              action={
                <MgaButton
                  trackingId="VehicleStatusViewButton"
                  onPress={vhrAction}
                  variant="inlineLink"
                  title={t('common:view')}
                />
              }>
              {warningCount > 0 && (
                <CsfView flexDirection="row" align="flex-start">
                  <CsfView style={rvccStyles.rvccDotPadding} />
                  <CsfView gap={8}>
                    <CsfText variant="subheading">
                      {t('vehicleDiagnostics:healthReport')}
                    </CsfText>
                    {healthReport.length > 0 ? (
                      <CsfBulletedList>
                        {healthReport?.map((issue, index) => (
                          <CsfText key={index}>
                            {t(`vehicleDiagnostics:${issue.b2cCode}.header`)}
                          </CsfText>
                        ))}
                      </CsfBulletedList>
                    ) : (
                      <CsfView>
                        <CsfText>
                          {t('vehicleDiagnostics:systemsFunctioningNormally')}
                        </CsfText>
                      </CsfView>
                    )}
                  </CsfView>
                </CsfView>
              )}
              {has(gen2Plus, vehicle) && warningCount > 0 && (
                <CsfView flexDirection="row" pt={CsfTileDefaultProps.gap}>
                  <CsfView style={rvccStyles.rvccDotPadding} />
                  <CsfView gap={8}>
                    <CsfText variant="subheading">
                      {t('vehicleDiagnostics:conditionCheck')}
                    </CsfText>
                    {conditionCheckIssues.length == 0 ? (
                      <CsfView>
                        <CsfText>
                          {t('vehicleDiagnostics:systemsFunctioningNormally')}
                        </CsfText>
                      </CsfView>
                    ) : (
                      <CsfBulletedList>
                        {conditionCheckIssues.map((cc, index) => (
                          <CsfText key={index}>{cc}</CsfText>
                        ))}
                      </CsfBulletedList>
                    )}
                  </CsfView>
                </CsfView>
              )}
            </CsfCard>
          )}

          <CsfCard
            bg="backgroundSecondary"
            borderColor={recalls.length > 0 ? 'error' : undefined}
            gap={8}
            icon={
              <CsfAppIcon
                icon="SubaruMysRecallsIcon"
                color={recalls.length == 0 ? 'success' : 'error'}
              />
            }
            title={t('recalls:title')}
            subtitle={t('vehicleHealth:recalls', { count: recalls.length })}
            action={
              <MgaButton
                trackingId="VehicleStatusRecallsButton"
                onPress={() => navigation.push('Recalls')}
                variant="inlineLink"
                title={t('common:view')}
              />
            }>
            {recalls.length > 0 && (
              <CsfView style={rvccStyles.rvccNoDotPadding}>
                {recalls.map((recall, index) => (
                  <CsfView key={index} flexDirection="row" maxWidth={'100%'}>
                    <CsfText width={20}>{index + 1}.</CsfText>
                    <CsfText>{recall.shortDescription}</CsfText>
                  </CsfView>
                ))}
              </CsfView>
            )}
          </CsfCard>
          <CsfCard
            bg="backgroundSecondary"
            borderColor={isServiceDue ? 'error' : undefined}
            icon={
              <CsfAppIcon
                icon="SubaruMysMaintenanceIntervalIcon"
                color={isServiceDue ? 'error' : 'success'}
              />
            }
            title={
              maintenanceSchedule?.data?.isServiceDue
                ? t('serviceReminder:maintenanceNeeded')
                : t('maintenanceSchedule:nextService')
            }
            subtitle={serviceDescription}
            gap={8}
            action={
              <MgaButton
                trackingId="VehicleStatusServiceReminderButton"
                onPress={() => navigation.push('ServiceReminder')}
                variant="inlineLink"
                title={t('common:view')}
              />
            }
          />
        </CsfView>
        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaVehicleStatusLanding;
