import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useVehicleHealthQuery,
  useVehicleStatusQuery,
  vehicleApi,
} from '../api/vehicle.api';
import { alertIfVehicleStolen } from './MgaMenus';
import { useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { formatFullDateTime } from '../utils/dates';
import { MgaVehicleDiagnosticsHealthReport } from './MgaVehicleDiagnosticsHealthReport';
import { MgaVehicleDiagnosticsConditionCheck } from './MgaVehicleDiagnosticsConditionCheck';

import {
  executeRemoteCommand,
  g2VehicleStatusRefresh,
} from '../features/remoteService/remoteService.api';
import {
  getVehicleConditionCheck,
  getVehicleWarningItems,
} from '../utils/vehicle';
import { store } from '../store';
import { testID } from '../components/utils/testID';
import CsfBadge from '../components/CsfBadge';
import { CsfSegmentTabBar } from '../components/CsfSegmentTabBar';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';
import useTracking from '../components/useTracking';

const MgaVehicleDiagnostics: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const { trackButton } = useTracking();
  const vehicleParams = { vin: vehicle?.vin ?? '' };
  const vehicleHealthMap = useVehicleHealthQuery(vehicleParams).data?.data;
  const vehicleStatusMap = useVehicleStatusQuery(vehicleParams).data?.data;
  const [tab, setTab] = useState('conditionCheck');
  const showConditionCheckBadge =
    (getVehicleConditionCheck(vehicle, vehicleHealthMap, vehicleStatusMap)
      ?.issues.length ?? 0) > 0;
  const showHealthReportBadge =
    getVehicleWarningItems(vehicleHealthMap).length > 0;
  const [isRefreshing, setRefreshing] = useState(false);
  const lastRefreshDate = vehicleStatusMap?.eventDateCarUser;
  const [refreshDateAndTime, setRefreshDateTime] = useState(lastRefreshDate);
  const lastIgnitionDate = vehicleStatusMap?.eventDate;
  const showTimestamp =
    lastIgnitionDate &&
    refreshDateAndTime &&
    lastIgnitionDate >= refreshDateAndTime;

  const id = testID('VehicleDiagnostics');
  return (
    <MgaPage title={t('vehicleDiagnostics:title')} showVehicleInfoBar>
      <MgaPageContent title={t('vehicleDiagnostics:title')}>
        <CsfView
          align="center"
          justify="center"
          gap={16}
          flexDirection="row"
          testID="VehicleDiagnostics">
          {showTimestamp && (
            <CsfText
              color="copySecondary"
              variant="button"
              align="center"
              testID={id('lastUpdatedDate')}>
              {t('home:lastUpdated', {
                when: formatFullDateTime(vehicleHealthMap?.lastUpdatedDate),
              })}
            </CsfText>
          )}
          {vehicle?.features?.includes('RVCCRFSH') && (
            <MgaButton
              trackingId="RefreshVehicleStatusButton"
              variant="inlineLink"
              isLoading={isRefreshing}
              title={t('common:refresh')}
              onPress={async () => {
                if (vehicle?.stolenVehicle) {
                  navigation.navigate('Dashboard');
                  void alertIfVehicleStolen();
                } else {
                  setRefreshing(true);
                  const response = await executeRemoteCommand(
                    g2VehicleStatusRefresh,
                    { ...vehicleParams, pin: '' },
                    {
                      allowSessionRenewal: true,
                      requires: ['PIN', 'session', 'timestamp'],
                    },
                  );
                  if (response.success && response.data?.success) {
                    const updatedRefreshDatetime = Date.parse(
                      response.data?.result?.lastUpdatedTime,
                    );
                    setRefreshDateTime(updatedRefreshDatetime);
                    await store
                      .dispatch(
                        vehicleApi.endpoints.vehicleHealth.initiate(
                          vehicleParams,
                        ),
                      )
                      .unwrap();
                    // MGA-1050: Refresh cached status data
                    await store
                      .dispatch(
                        vehicleApi.endpoints.vehicleStatus.initiate(
                          vehicleParams,
                        ),
                      )
                      .unwrap();
                  }
                  setRefreshing(false);
                }
              }}
            />
          )}
        </CsfView>
      </MgaPageContent>
      <CsfView testID={id('segmentContainer')}>
        <CsfSegmentTabBar
          options={[
            {
              label: t('vehicleDiagnostics:conditionCheck'),
              value: 'conditionCheck',
              view: () => (
                <CsfView align="center" flexDirection="row" gap={4}>
                  {showConditionCheckBadge && <CsfBadge />}
                  <CsfText variant="subheading">
                    {t('vehicleDiagnostics:conditionCheck')}
                  </CsfText>
                </CsfView>
              ),
            },
            {
              label: t('vehicleDiagnostics:healthReport'),
              value: 'healthReport',
              view: () => (
                <CsfView align="center" flexDirection="row" gap={8}>
                  {showHealthReportBadge && <CsfBadge />}
                  <CsfText variant="subheading">
                    {t('vehicleDiagnostics:healthReport')}
                  </CsfText>
                </CsfView>
              ),
            },
          ]}
          value={tab}
          onSelect={v => {
            const titleKey = `vehicleDiagnostics:${v}`;
            trackButton({
              trackingId: `VehicleDiagnosticsTab-${v}`,
              title: t(titleKey),
            });
            setTab(v);
          }}
        />
      </CsfView>
      <CsfView bg="background" testID={id('content')}>
        {tab == 'conditionCheck' && <MgaVehicleDiagnosticsConditionCheck />}
        {tab == 'healthReport' && <MgaVehicleDiagnosticsHealthReport />}
        <CsfView p={16}>
          <MgaRetailerEmbed />
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

export default MgaVehicleDiagnostics;
