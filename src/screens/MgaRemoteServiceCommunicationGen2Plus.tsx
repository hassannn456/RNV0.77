// cSpell:ignore starlinknotificationsub
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NotificationPreferenceGen2Plus,
  useNotificationPreferencesGen2Query,
} from '../features/starlinkcommunications/starlinkcommunications.api';
import { formatPhone } from '../utils/phone';
import { navigate, useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import {
  CsfLandingMenuList,
  CsfLandingMenuListItem,
} from '../components/CsfListItemLanding';
import { isStarlinkCommunicationSubscription } from '../utils/starlinkCommunications';
import { testID } from '../components/utils/testID';

const MgaRemoteServiceCommunicationGen2Plus: React.FC = () => {
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
  const { data, isFetching } = useNotificationPreferencesGen2Query({
    vin: vehicle?.vin,
  });
  const navigation = useAppNavigation();
  const preferences: NotificationPreferenceGen2Plus | undefined = data?.data;
  interface DetailsCardProps {
    heading: string
    children: ReactNode
    onChange: () => void
  }

  const DetailsCard = (props: DetailsCardProps) => {
    return (
      <CsfCard
        title={props.heading}
        action={
          <CsfButton icon="Edit" variant="link" onPress={props.onChange} />
        }>
        <CsfRuleList>{props.children}</CsfRuleList>
      </CsfCard>
    );
  };

  const id = testID('RemoteServiceCommunicationGen2Plus');

  return (
    <CsfView isLoading={isFetching} gap={24}>
      <CsfView style={{ flex: 1 }} gap={24}>
        <CsfView>
          <CsfText
            variant="subheading"
            align="center"
            testID={id('starlinknotificationsubHeader')}>
            {t('remoteServiceCommunications:starlinknotificationsubHeader')}
          </CsfText>
        </CsfView>
        <DetailsCard
          heading={t('common:contactInformation')}
          onChange={() => navigation.push('MyProfileView')}>
          <CsfDetail
            label={t('common:email')}
            value={preferences?.email}
            testID={id('email')}
          />
          <CsfDetail
            label={t('common:sms')}
            value={formatPhone(preferences?.phone || '')}
            testID={id('sms')}
          />
        </DetailsCard>

        <CsfLandingMenuList>
          {alerts?.map(
            (alert, index) =>
              alert && (
                <CsfLandingMenuListItem
                  key={index}
                  testID={id(`alert-${index}`)}
                  title={t(alert.label)}
                  route={alert.route}
                  onPress={() =>
                    navigate('NotificationPreferences', {
                      preferenceKey: alert.route,
                      label: t(alert.label),
                    })
                  }
                />
              ),
          )}
        </CsfLandingMenuList>
      </CsfView>
    </CsfView>
  );
};

export default MgaRemoteServiceCommunicationGen2Plus;
