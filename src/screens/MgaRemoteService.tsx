import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppNavigation } from '../Controller';
import { has } from '../features/menu/rules';
import { lockDoors } from '../features/remoteService/lockDoors.car';
import { unlockDoors } from '../features/remoteService/unlockDoors.car';
import { useAppSelector } from '../store';
import { useEngineRunning } from '../features/remoteService/remoteStatus.slice';
import { engineStart, engineStop } from '../features/remoteService/engine.car';
import { hornLights } from '../features/remoteService/hornLights.car';
import { locateVehicle } from '../features/remoteService/locateVehicle.car';
import { useRemoteEngineQuickStartSettingsFetchQuery } from '../features/remoteService/climate.api';
import { CsfLandingMenuListItem } from '../components/CsfListItemLanding';
import { canAccessScreen } from '../utils/menu';
import { testID } from '../components/utils/testID';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaStarlinkPlans from '../components/MgaStarlinkPlans';

/** Main body of remote service.
 *
 * Implemented as separate function to ensure exactly one panel is returned.  */
const MgaRemoteServiceContent: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const engineOn = useEngineRunning();
  const quickStartSettings =
    useRemoteEngineQuickStartSettingsFetchQuery(undefined)?.data?.data;

  const id = testID('RemoteService');
  if (!vehicle) {
    return null;
  }
  if (has('res:*', vehicle)) {
    return (
      <CsfView gap={40} testID={id()}>
        <CsfTile pv={0}>
          <CsfRuleList testID={id('list')}>
            {has({ or: ['cap:RESCC', 'cap:RCC'] }, vehicle) && (
              <CsfLandingMenuListItem
                title={t('resPresets:resPresets')}
                icon={'ClimateControlPreset'}
                onPress={() => navigation.push('ClimateControl')}
                testID={id('climateControl')}
              />
            )}

            {has(['cap:RES', { not: 'cap:RCC' }], vehicle) && (
              <CsfView>
                {engineOn ? (
                  <CsfLandingMenuListItem
                    title={t('remoteService:remoteEngineStop')}
                    icon={'EngineStop'}
                    onPress={() => engineStop()}
                    noDestination
                    testID={id('remoteEngineStop')}
                  />
                ) : (
                  <CsfLandingMenuListItem
                    title={t('remoteService:remoteEngineStart')}
                    icon={'EngineStart'}
                    onPress={() =>
                      quickStartSettings && engineStart(quickStartSettings)
                    }
                    noDestination
                    testID={id('remoteEngineStart')}
                  />
                )}
              </CsfView>
            )}

            {has('cap:PHEV', vehicle) && (
              <CsfLandingMenuListItem
                title={t('chargeReview:chargingTimer')}
                icon={'Battery'}
                onPress={() => {
                  navigation.push('ChargeReview');
                }}
                testID={id('chargingTimer')}
              />
            )}

            <CsfLandingMenuListItem
              title={t('remoteService:lockDoors')}
              icon={'DoorLock'}
              onPress={async () => {
                await lockDoors();
              }}
              noDestination
              testID={id('lockDoors')}
            />

            <CsfLandingMenuListItem
              title={t('remoteService:unlockDoors')}
              icon={'DoorUnlock'}
              onPress={async () => {
                await unlockDoors();
              }}
              noDestination
              testID={id('unlockDoors')}
            />

            <CsfLandingMenuListItem
              title={t('remoteService:locateVehicle')}
              icon={'LocateVehicle'}
              onPress={async () => {
                await locateVehicle();
              }}
              noDestination
              testID={id('locateVehicle')}
            />

            <CsfLandingMenuListItem
              title={t('remoteService:hornLights')}
              icon={'HornLights'}
              onPress={() => hornLights()}
              noDestination
              testID={id('hornLights')}
            />
          </CsfRuleList>
        </CsfTile>

        <MgaRemoteServiceSubscriptionFooter trackingId="RemoteServiceLanding" />
      </CsfView>
    );
  } else if (has('sub:SAFETY', vehicle)) {
    return (
      <CsfView>
        <MgaStarlinkPlans />
        <CsfText testID={id('noSubscription')}>
          {t('remoteService:noSubscription')}
        </CsfText>
      </CsfView>
    );
  } else {
    return (
      <CsfText testID={id('noSubscription')}>
        {t('remoteService:noSubscription')}
      </CsfText>
    );
  }
};

const MgaRemoteServiceSubscriptionFooter: React.FC<{
  trackingId: string
}> = ({ trackingId }) => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const isDemo = useAppSelector(s => s.demo);
  return isDemo ? null : (
    <CsfView gap={0} testID={trackingId}>
      <>
        {canAccessScreen('SubscriptionServicesLanding') && (
          <MgaButton
            onPress={() => navigation.push('SubscriptionManage')}
            title={t('remoteService:manageStarlinkSubscription')}
            variant="link"
            trackingId={`${trackingId}-SubscriptionManage`}
          />
        )}
        {canAccessScreen('SciSubscriptionServiceLanding') && (
          <MgaButton
            onPress={() => navigation.push('SciSubscriptionManage')}
            title={t('remoteService:manageStarlinkSubscription')}
            variant="link"
            trackingId={`${trackingId}-SciSubscriptionManage`}
          />
        )}
        {canAccessScreen('CommunicationPreferences') && (
          <MgaButton
            onPress={() => navigation.navigate('CommunicationPreferences')}
            title={t('communicationPreferences:communicationPreferenceTitle')}
            variant="link"
            trackingId={`${trackingId}-CommunicationPreferences`}
          />
        )}
      </>
    </CsfView>
  );
};
/** List of available STARLINK® commands */
export const MgaRemoteService: React.FC = () => {
  const { t } = useTranslation();
  return (
    <MgaPage title={t('remoteService:title')} showVehicleInfoBar>
      <CsfView pv={24} ph={16} gap={24}>
        <CsfText variant="title2" align="center">
          {t('remoteService:title')}
        </CsfText>
        <MgaRemoteServiceContent />
      </CsfView>
    </MgaPage>
  );
};

export default MgaRemoteServiceContent;
