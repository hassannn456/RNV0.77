/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { pushIfNotTop, useAppNavigation } from '../../Controller';

import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import {
  capabilityRESCC,
  gen1Plus,
  gen1PlusSafetyOnly,
  gen2Plus,
  has,
} from '../../features/menu/rules';

import { Dimensions } from 'react-native';
import { lockDoors } from '../../features/remoteService/lockDoors.car';
import { unlockDoors } from '../../features/remoteService/unlockDoors.car';
import { locateVehicle } from '../../features/remoteService/locateVehicle.car';
import { hornLights } from '../../features/remoteService/hornLights.car';
import {
  engineStart,
  engineStop,
} from '../../features/remoteService/engine.car';
import { useEngineRunning } from '../../features/remoteService/remoteStatus.slice';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  MgaBatteryButton,
  MgaDashboardButton,
} from '../../components/MgaDashboardButton';
import { useRemoteEngineQuickStartSettingsFetchQuery } from '../../features/remoteService/climate.api';
import { useVehicleInfoQuery } from '../../api/vehicle.api';
import { canAccessScreen } from '../../utils/menu';
import { usePreferredDealerQuery } from '../../api/account.api';
import { tradeUpAdvantageProgram } from '../../utils/tradeUpAdvantage';
import { MgaDashboardFooterNotificationBar } from './NotificationBar';
import { longPollIntervalMs, shortPollIntervalMs } from '../../utils/valetMode';
import { useVersionCheck } from './useVersionCheck';
import MgaButton from '../../components/MgaButton';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import mgaOpenURL from '../../components/utils/linking';
import { CsfAlertBar } from '../../components/CsfAlertBar';
import { MgaAnalyticsContext } from '../../components/MgaAnalyticsContext';
import MgaPage from '../../components/MgaPage';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import MgaRemoteServicesButton from '../../components/MgaRemoteServicesButton';
import DashboardLayout from './Layout';
import NoResContent from './NoResContent';
import MgaDashboardFooter from './Footer';
import MgaVehicleAlertBanner from './AlertBar';
import MgaValetStatusPoller from '../../components/MgaValetStatusPoller';
// import { surveyStart } from '../../vendor/verint/MgaVerintSurvey'

const heightThreshold = 700;

/** Main body of dashboard.
 *
 * Implemented as separate function to ensure exactly one panel is returned.  */
const MgaDashboardContent: React.FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const vehicle = useCurrentVehicle();

  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const quickStartSettings =
    useRemoteEngineQuickStartSettingsFetchQuery(undefined)?.data?.data;
  // Not accessed directly but loads vehicle data
  const _preferredDealer = usePreferredDealerQuery(vParams);
  const _vehicleInfo = useVehicleInfoQuery(vParams);

  const engineOn = useEngineRunning();

  const versionCheck = useVersionCheck();
  const isDemo = useAppSelector(s => s.demo);
  const isHawaii = has('reg:HI', vehicle);
  const dealer = usePreferredDealerQuery(vParams).data?.data?.preferredDealer;
  const hasNoPreferredDealer = dealer === null;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDemo) {
      if (engineOn) {
        timeout = setTimeout(async () => {
          await engineStop({ pin: '1234', delay: 0, vin: vehicle?.vin ?? '' });
          clearTimeout(timeout);
        }, 2000);
      }
      navigation.setOptions({
        headerLeft: () => (
          <MgaButton
            trackingId="ExitDemoButton"
            variant="link"
            title={t('home:exitDemo')}
            onPress={() => {
              dispatch({ type: 'demo/end' });
              dispatch({ type: 'session/setLogin', payload: false });
              dispatch({ type: 'keychain/clearSessionId' });
            }}
          />
        ),
      });
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isDemo, engineOn]);

  // version check
  useEffect(() => {
    // surveyStart(t)
    versionCheck();
  }, []);

  // GENERATION 2 Remote
  if (
    has([gen2Plus, 'res:*', 'car:Provisioned', { not: 'car:Stolen' }], vehicle)
  ) {
    const primary = has(capabilityRESCC, vehicle) ? (
      // RES With Climate Control
      <>
        <MgaRemoteServicesButton
          trackingId="ViewStartSettingsButton"
          vertical
          borderless
          width={80}
          icon="Settings"
          variant="dashboard"
          title={t('home:viewStartSettings')}
          onPress={() =>
            quickStartSettings &&
            pushIfNotTop(navigation, 'StartSettingsView', {
              settings: quickStartSettings,
              isCurrent: true,
            })
          }
        />
        <MgaDashboardButton
          trackingId="dashboard-button"
          icon={engineOn ? 'EngineStop' : 'EngineStart'}
          title={engineOn ? t('home:stopEngine') : t('home:startEngine')}
          onPress={
            engineOn
              ? () => engineStop()
              : () =>
                quickStartSettings?.length == 0
                  ? pushIfNotTop(navigation, 'ClimateControl')
                  : quickStartSettings && engineStart(quickStartSettings)
          }
        />
        <MgaRemoteServicesButton
          width={80}
          vertical
          borderless
          trackingId="ClimateControlPresetButton"
          icon="ClimateControlPreset"
          title={t('resPresets:title')}
          variant="dashboard"
          onPress={() => pushIfNotTop(navigation, 'ClimateControl')}
        />
      </>
    ) : (
      // RES Only
      <CsfView
        flexDirection="row"
        align="center"
        justify="space-around"
        width={'100%'}>
        <MgaRemoteServicesButton
          width={80}
          vertical
          borderless
          icon="Settings"
          title={t('home:startSettings')}
          variant="dashboard"
          onPress={() => pushIfNotTop(navigation, 'RuntimeOptions')}
        />
        <MgaDashboardButton
          trackingId="dashboard-button"
          icon={engineOn ? 'EngineStop' : 'EngineStart'}
          title={engineOn ? t('home:stopEngine') : t('home:startEngine')}
          onPress={
            engineOn
              ? () => engineStop()
              : () => quickStartSettings && engineStart(quickStartSettings)
          }
        />

        <CsfView width={70} />
      </CsfView>
    );
    const secondary = (
      <CsfView flexDirection="row" gap={40} justify="center" flex={1}>
        <MgaRemoteServicesButton
          trackingId="DoorLockButton"
          icon="DoorLock"
          style={{ flex: 1 }}
          title={t('home:lockDoors')}
          variant="dashboard"
          onPress={() => lockDoors()}
        />
        <MgaRemoteServicesButton
          trackingId="DoorUnlockButton"
          icon="DoorUnlock"
          style={{ flex: 1 }}
          title={t('home:unlockDoors')}
          variant="dashboard"
          onPress={() => unlockDoors()}
        />
      </CsfView>
    );
    const tertiary = (
      <>
        <MgaRemoteServicesButton
          trackingId="LocateVehicleButton"
          icon="LocateVehicle"
          style={{ alignSelf: 'stretch' }}
          title={t('home:locateVehicle')}
          vertical
          onPress={() => locateVehicle()}
        />
        <MgaRemoteServicesButton
          trackingId="HornAndLightsButton"
          icon="HornLights"
          style={{ alignSelf: 'stretch' }}
          title={t('home:hornLights')}
          onPress={() => hornLights()}
          vertical
        />
        {canAccessScreen('TripsGen3Landing') ? (
          <MgaRemoteServicesButton
            trackingId="TripTrackerButton"
            icon="TripTracker"
            style={{ alignSelf: 'stretch' }}
            title={t('tripLog:myTrips')}
            vertical
            onPress={() => pushIfNotTop(navigation, 'TripsGen3Landing')}
          />
        ) : has('cap:TLD', vehicle) ? (
          <MgaRemoteServicesButton
            vertical
            trackingId="LocateVehicleButton"
            icon="LocateVehicle"
            style={{ alignSelf: 'stretch' }}
            title={t('tripLog:myTrips')}
            onPress={() => pushIfNotTop(navigation, 'TripTrackingLanding')}
          />
        ) : has(['cap:RPOI', { not: 'cap:TLD' }], vehicle) ? (
          <MgaRemoteServicesButton
            icon="LocateVehicle"
            trackingId="LocateVehicleButton"
            style={{ alignSelf: 'stretch' }}
            title={t('tripSearch:trips')}
            vertical
            onPress={() => pushIfNotTop(navigation, 'TripsLanding')}
          />
        ) : null}
      </>
    );
    const primaryPhev = (
      <MgaBatteryButton
        title={t('home:viewBatteryCharge')}
        onPress={() => navigation.push('ChargeReview')}
      />
    );
    const secondaryPhev = (
      <>
        <MgaRemoteServicesButton
          borderless
          vertical
          trackingId="DoorLockButton"
          icon="DoorLock"
          title={t('home:lockDoors')}
          onPress={() => lockDoors()}
          variant="dashboard"
        />
        <MgaRemoteServicesButton
          borderless
          vertical
          trackingId="ClimateControlPresetButton"
          icon="ClimateControlPreset"
          title={
            engineOn
              ? t('home:climateControlStop')
              : t('climateControlInfo:climateControl')
          }
          onPress={async () => {
            if (engineOn) {
              await engineStop();
            } else {
              pushIfNotTop(navigation, 'ClimateControl');
            }
          }}
          variant="dashboard"
        />
        <MgaRemoteServicesButton
          vertical
          icon="DoorUnlock"
          trackingId="DoorUnlockButton"
          title={t('home:unlockDoors')}
          onPress={() => unlockDoors()}
          variant="dashboard"
          borderless
        />
      </>
    );
    if (has('cap:RES', vehicle)) {
      return (
        <MgaAnalyticsContext.Provider
          value={{ id: 'DashboardGen2Plus', name: 'Dashboard - Gen 2 Plus' }}>
          <DashboardLayout
            primary={primary}
            secondary={secondary}
            tertiary={tertiary}
          />
        </MgaAnalyticsContext.Provider>
      );
    }

    if (has('cap:PHEV', vehicle)) {
      return (
        <MgaAnalyticsContext.Provider
          value={{ id: 'DashboardPHEV', name: 'Dashboard - PHEV' }}>
          <DashboardLayout
            primary={primaryPhev}
            secondary={secondaryPhev}
            tertiary={tertiary}
          />
        </MgaAnalyticsContext.Provider>
      );
    } else {
      if (has({ not: 'cap:RES' }, vehicle)) {
        return (
          <MgaAnalyticsContext.Provider
            value={{ id: 'DashboardNoRES', name: 'Dashboard  -No RES' }}>
            <DashboardLayout
              primary={
                <CsfView flexDirection="row" justify="center">
                  <MgaDashboardButton
                    icon="DoorLock"
                    style={{ flex: 1 }}
                    title={t('home:lockDoors')}
                    onPress={() => lockDoors()}
                  />
                  <MgaDashboardButton
                    icon="DoorUnlock"
                    style={{ flex: 1 }}
                    title={t('home:unlockDoors')}
                    onPress={() => unlockDoors()}
                  />
                </CsfView>
              }
              tertiary={tertiary}
            />
          </MgaAnalyticsContext.Provider>
        );
      }
    }
  }
  // GENERATION 1 & 2 Safety Only
  if (has(gen1PlusSafetyOnly, vehicle)) {
    return (
      <MgaAnalyticsContext.Provider
        value={{ id: 'DashboardSafetyOnly', name: 'Dashboard - Safety Only' }}>
        <DashboardLayout
          primary={
            <NoResContent title={t('home:subscriptionServices')}>
              <CsfText align="center">
                {t('home:subscriptionUpgradeText')}
              </CsfText>

              {canAccessScreen('SubscriptionUpgrade') ? (
                <CsfView>
                  <MgaButton
                    trackingId="UpgradeNowButton"
                    onPress={() => navigation.push('SubscriptionUpgrade')}
                    title={t('home:upgradeNow')}
                  />
                  <MgaButton
                    trackingId="StarlinkLearnMoreButton"
                    variant="link"
                    onPress={() =>
                      mgaOpenURL(
                        t('urls:starlinkLearnMore', { context: i18n.language }),
                      )
                    }
                    title={t('home:learnMoreAboutStarlink')}
                  />
                </CsfView>
              ) : (
                <MgaButton
                  trackingId="StarlinkLearnMore"
                  onPress={() =>
                    mgaOpenURL(
                      t('urls:starlinkLearnMore', { context: i18n.language }),
                    )
                  }
                  title={t('home:learnMoreAboutStarlink')}
                />
              )}
            </NoResContent>
          }
          tertiary={
            <>
              <MgaRemoteServicesButton
                trackingId="ScheduleServiceButton"
                icon="Calendar"
                vertical
                onPress={() => {
                  pushIfNotTop(navigation, 'Scheduler');
                }}
                title={t('home:service')}
              />
              <MgaRemoteServicesButton
                trackingId="SupportButton"
                icon="CustomerSupport"
                vertical
                onPress={() => {
                  pushIfNotTop(navigation, 'HelpAndSupport');
                }}
                title={t('home:supportButton')}
              />
            </>
          }
        />
      </MgaAnalyticsContext.Provider>
    );
  }
  // GENERATION 1 Remote
  if (
    has(['cap:g1', 'res:*', 'car:Provisioned', { not: 'car:Stolen' }], vehicle)
  ) {
    return (
      <MgaAnalyticsContext.Provider
        value={{ id: 'DashboardRES', name: 'Dashboard - G1' }}>
        <DashboardLayout
          primary={
            <>
              <MgaDashboardButton
                icon="DoorLock"
                title={t('home:lockDoors')}
                onPress={() => lockDoors()}
              />
              <MgaDashboardButton
                icon="DoorUnlock"
                style={{ flex: 1 }}
                title={t('home:unlockDoors')}
                onPress={() => unlockDoors()}
              />
            </>
          }
          tertiary={
            <>
              <MgaRemoteServicesButton
                trackingId="LocateVehicleButton"
                icon="LocateVehicle"
                style={{ alignSelf: 'stretch' }}
                title={t('home:locateVehicle')}
                vertical
                onPress={() => locateVehicle()}
              />
              <MgaRemoteServicesButton
                trackingId="HornLightsButton"
                icon="HornLights"
                style={{ alignSelf: 'stretch' }}
                title={t('home:hornLights')}
                vertical
                onPress={() => hornLights()}
              />
            </>
          }
        />
      </MgaAnalyticsContext.Provider>
    );
  }
  // GENERATION 1 & 2 Not Subscribed
  if (has([gen1Plus, 'sub:NONE', 'car:Provisioned'], vehicle)) {
    if (has('car:RightToRepair', vehicle)) {
      return (
        <MgaAnalyticsContext.Provider
          value={{ id: 'DashboardNoSubR2R', name: 'Dashboard - No Sub R2R' }}>
          <CsfView width={'100%'}>
            <CsfAlertBar flat subtitle={t('home:rightToRepairAlert')} />
          </CsfView>
          <DashboardLayout
            primary={
              <NoResContent title={t('home:rightToRepairTitle')}>
                <CsfText align="center">{t('home:rightToRepairBody')}</CsfText>
              </NoResContent>
            }
            tertiary={
              <>
                <MgaRemoteServicesButton
                  trackingId="ScheduleServiceButton"
                  icon="Calendar"
                  // TODO:UA:20241211 get the correct icon
                  onPress={() => {
                    pushIfNotTop(navigation, 'Scheduler');
                  }}
                  title={t('home:service')}
                  vertical
                />
                <MgaRemoteServicesButton
                  trackingId="SupportButton"
                  icon="Phone"
                  // TODO:UA:20241211 get the correct icon
                  onPress={() => {
                    pushIfNotTop(navigation, 'HelpAndSupport');
                  }}
                  title={t('home:supportButton')}
                  vertical
                />
              </>
            }
          />
        </MgaAnalyticsContext.Provider>
      );
    } else {
      return (
        <MgaAnalyticsContext.Provider
          value={{ id: 'DashboardNoSub', name: 'Dashboard - No Sub' }}>
          <DashboardLayout
            primary={
              <NoResContent title={t('home:starlinkRemoteServices')}>
                <CsfText align="center">
                  {t('home:doNotHaveSafetyBenefits')}
                </CsfText>
                {has(gen2Plus, vehicle) && (
                  <MgaButton
                    trackingId="SubscribeNowButton"
                    onPress={() =>
                      navigation.push(
                        has('reg:CA')
                          ? 'SciSubscriptionEnrollment'
                          : 'SubscriptionEnrollment',
                      )
                    }
                    title={t('common:subscribeNow')}
                  />
                )}
                <MgaButton
                  trackingId="StarlinkLearnMoreButton"
                  onPress={() =>
                    mgaOpenURL(
                      t('urls:starlinkLearnMore', { context: i18n.language }),
                    )
                  }
                  title={t('home:learnMoreAboutStarlink')}
                  variant="link"
                />
              </NoResContent>
            }
          />
        </MgaAnalyticsContext.Provider>
      );
    }
  }
  // GENERATION 1 & 2 Not Provisioned
  if (has([gen1Plus, { not: 'car:Provisioned' }], vehicle)) {
    return (
      <MgaAnalyticsContext.Provider
        value={{
          id: 'DashboardProvisioningError',
          name: 'Dashboard - Provisioning Error',
        }}>
        <DashboardLayout
          primary={
            <NoResContent title={t('home:starlinkErrorHeader')}>
              <CsfText align="center">
                {t('home:functionUnexpected', {
                  modelName: vehicle?.modelName,
                })}
              </CsfText>
              <MgaButton
                trackingId="CustomerSupportButton"
                onPress={() => mgaOpenURL(t('contact:customerSupportLink'))}
                title={t('home:contactCustomerSupport')}
              />
            </NoResContent>
          }
        />
      </MgaAnalyticsContext.Provider>
    );
  }
  // GENERATION 1 & 2 Stolen Vehicle Mode
  if (has([gen1Plus, 'car:Stolen'], vehicle)) {
    return (
      <MgaAnalyticsContext.Provider
        value={{ id: 'DashboardStolen', name: 'Dashboard - Stolen' }}>
        <DashboardLayout
          primary={
            <NoResContent title={t('home:vehicleReportedStolenHeader')}>
              <CsfText variant="body">
                {t('home:vehicleReportedStolen')}
              </CsfText>
              <MgaButton
                trackingId="CustomerSupportButton"
                onPress={() => mgaOpenURL(t('contact:customerSupportLink'))}
                title={t('home:contactCustomerSupport')}
              />
            </NoResContent>
          }
        />
      </MgaAnalyticsContext.Provider>
    );
  }
  // GENERATION 0
  if (has('cap:g0', vehicle)) {
    const tradeUpAdvantage = tradeUpAdvantageProgram(dealer, isHawaii);
    const g0TradeUp = (
      <NoResContent title={t('home:tradeUpProgram')}>
        <CsfText align="center">{t('home:lessThanExpect')}</CsfText>
        <MgaButton
          trackingId="TradeUpButton"
          title={t('home:learnMore')}
          onPress={() => mgaOpenURL(t('urls:tradeUpLearnMore'))}
        />
      </NoResContent>
    );

    const notHawaiiNoPreferredDealer = (
      <NoResContent title={t('home:welcome')}>
        <CsfText align="center">{t('home:g0Description')}</CsfText>
      </NoResContent>
    );

    const primary = tradeUpAdvantage
      ? g0TradeUp
      : !isHawaii && hasNoPreferredDealer
        ? notHawaiiNoPreferredDealer
        : null;
    return (
      <MgaAnalyticsContext.Provider
        value={{ id: 'DashboardGen0', name: 'Dashboard - Gen 0' }}>
        <DashboardLayout
          primary={primary}
          tertiary={
            <>
              <MgaRemoteServicesButton
                trackingId="ScheduleServiceButton"
                icon="Calendar"
                onPress={() => {
                  pushIfNotTop(navigation, 'Scheduler');
                }}
                title={t('home:service')}
                vertical
                width={'100%'}
                maxHeight={200}
              />
              <MgaRemoteServicesButton
                trackingId="CustomerSupportButton"
                icon="CustomerSupport"
                onPress={() => {
                  pushIfNotTop(navigation, 'HelpAndSupport');
                }}
                title={t('home:supportButton')}
                vertical
                maxHeight={200}
              />
            </>
          }
        />
      </MgaAnalyticsContext.Provider>
    );
  }
  // Should not be reached
  console.warn('Vehicle config not recognized');
  return null;
};

/** Landing screen after authentication */
const MgaDashboard: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const windowDimensions = Dimensions.get('window');
  const smallDevice = windowDimensions.height < heightThreshold;
  const isDemo = useAppSelector(s => s.demo);
  const { t } = useTranslation();

  // Login partially loads vehicle, not safe for display
  // Show spinner until subscriptionFeatures has data
  return vehicle?.subscriptionFeatures ? (
    <MgaPage
      bg="backgroundSecondary"
      showVehicleInfoBar
      stickyFooter={() => <MgaDashboardFooter />}
      noScroll>
      <CsfView gap={16} p={16} flex={1}>
        <MgaVehicleAlertBanner />
        <MgaDashboardContent />
        {canAccessScreen('ValetMode') ? (
          <MgaDashboardFooterNotificationBar />
        ) : (
          isDemo && <CsfAlertBar flat title={t('home:disclaimer')} />
        )}
      </CsfView>
      {canAccessScreen('ValetMode') && (
        <MgaValetStatusPoller
          params={{ vin: vehicle?.vin }}
          longPollIntervalMs={longPollIntervalMs}
          shortPollIntervalMs={shortPollIntervalMs}
        />
      )}
    </MgaPage>
  ) : (
    <CsfView
      bg="background"
      flexDirection="column"
      style={{ flex: smallDevice ? 0 : 1 }}
      justify="center"
      align="center">
      <CsfActivityIndicator size="large" />
    </CsfView>
  );
};


export default MgaDashboard;