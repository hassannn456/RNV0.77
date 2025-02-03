/* eslint-disable react-native/no-inline-styles */
// cSpell:ignore starlinknotificationsub
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationPreferencesGen2Query } from '../features/starlinkcommunications/starlinkcommunications.api';
import { navigate } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import {
  CsfLandingMenuList,
  CsfLandingMenuListItem,
} from '../components/CsfListItemLanding';
import { isStarlinkCommunicationSubscription } from '../utils/starlinkCommunications';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';

const MgaCommunicationGen2Plus: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const isGeneration2 = has(['cap:g2'], vehicle);
  const isNonSecondaryUser = !vehicle?.authorizedVehicle;
  const alerts = [
    isStarlinkCommunicationSubscription('remoteVehicleControls', vehicle) && {
      key: 1,
      label: 'remoteServiceCommunicationsGen3:remoteVehicleControls',
      route: 'remoteVehicleControls',
    },
    isStarlinkCommunicationSubscription('vehicleMonitoring', vehicle) && {
      key: 2,
      label: 'remoteServiceCommunicationsGen3:vehicleMonitoring',
      route: 'vehicleMonitoring',
    },
    isGeneration2
      ? isStarlinkCommunicationSubscription(
        'driverServicesNotifications',
        vehicle,
      ) && {
        key: 3,
        label: 'remoteServiceCommunicationsGen3:driverServicesNotifications',
        route: 'driverServicesNotifications',
      }
      : isStarlinkCommunicationSubscription(
        'tripTrackerNotification',
        vehicle,
      ) && {
        key: 3,
        label: 'remoteServiceCommunicationsGen3:tripTrackerNotification',
        route: 'tripTrackerNotification',
      },
    {
      key: 4,
      label: 'remoteServiceCommunicationsGen3:vehicleHealthAlerts',
      route: 'vehicleHealthAlerts',
    },
    isNonSecondaryUser && {
      key: 5,
      label: 'remoteServiceCommunicationsGen3:billing',
      route: 'billing',
    },
  ];
  const { isFetching } = useNotificationPreferencesGen2Query({
    vin: vehicle?.vin,
  });

  const id = testID('CommunicationGen2');

  return (
    <CsfView isLoading={isFetching} gap={24} testID={id()}>
      <CsfView style={{ flex: 1 }} gap={24}>
        <CsfView justify="center" align="center">
          <CsfText
            variant="subheading"
            align="center"
            testID={id('preferences')}>
            {
              'Stay connected and informed by selecting your communication preferences. '
            }
          </CsfText>
        </CsfView>

        <CsfLandingMenuList>
          {alerts?.map((alert, index) => {
            const itemTestId = testID(id(`alert-${index}`));
            if (alert) {
              return (
                <CsfLandingMenuListItem
                  key={index}
                  testID={itemTestId()}
                  title={t(alert.label)}
                  route={alert.route}
                  onPress={() =>
                    navigate('NotificationPreferences', {
                      preferenceKey: alert.route,
                      label: t(alert.label),
                    })
                  }
                />
              );
            }
          })}
        </CsfLandingMenuList>
      </CsfView>
    </CsfView>
  );
};

export default MgaCommunicationGen2Plus;
