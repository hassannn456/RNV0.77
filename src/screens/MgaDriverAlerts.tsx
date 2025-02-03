import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { useAppNavigation } from '../Controller';
import { canAccessScreen } from '../utils/menu';
import {
  CsfLandingMenuList,
  CsfLandingMenuListItem,
} from '../components/CsfListItemLanding';
import { MgaRemoteServiceSubscriptionFooter } from './MgaRemoteService';
import { alertNotInDemo, canDemo } from '../features/demo/demo.slice';
import { useAppSelector } from '../store';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaDriverAlerts: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const isDemo = useAppSelector(s => s.demo);

  const id = testID('DriverAlerts');
  return (
    <MgaPage title={t('index:driverAlerts')} showVehicleInfoBar>
      <MgaPageContent title={t('index:driverAlerts')}>
        <CsfView gap={40}>
          {has('res:*', vehicle) && (
            <CsfLandingMenuList testID={id('list')}>
              <CsfLandingMenuListItem
                onPress={() => navigation.push('GeofencingLanding')}
                icon="BoundaryAlert"
                title={t('geofencingLanding:title')}
                testID={id('geofencingLanding')}
              />
              <CsfLandingMenuListItem
                onPress={() => navigation.push('SpeedAlertLanding')}
                icon="SpeedAlert"
                title={t('speedAlertLanding:title')}
                testID={id('speedAlertLanding')}
              />
              <CsfLandingMenuListItem
                onPress={() => navigation.push('CurfewLanding')}
                icon="CurfewAlert"
                title={t('curfewsLanding:title')}
                testID={id('curfewsLanding')}
              />
              {canAccessScreen('ValetMode') && (
                <CsfLandingMenuListItem
                  onPress={() =>
                    !isDemo || canDemo('ValetMode')
                      ? navigation.push('ValetMode')
                      : alertNotInDemo()
                  }
                  icon="ValetMode"
                  title={t('valetMode:valetMode')}
                  testID={id('valetMode')}
                />
              )}
            </CsfLandingMenuList>
          )}

          {has({ or: ['sub:REMOTE', 'sub:SAFETY'] }, vehicle) && (
            <MgaRemoteServiceSubscriptionFooter trackingId="DriverAlerts" />
          )}
          {/* {has('sub:SAFETY', vehicle) && <MgaStarlinkPlans />} */}
          {has('sub:NONE', vehicle) && (
            <CsfView flex={1} edgeInsets justify="center">
              <CsfText testID={id('enrollRenewMessage')}>
                {t('driverAlerts:enrollRenewMessage')}
              </CsfText>
            </CsfView>
          )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaDriverAlerts;
