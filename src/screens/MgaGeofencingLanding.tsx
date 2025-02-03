import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  geoFenceSaveAndSend,
  useGeoFenceFetchQuery,
} from '../features/alerts/boundaryAlert.api';
import ActiveCircleIcon from '../../content/svg/active-circle-icon.svg';
import InactiveCircleIcon from '../../content/svg/inactive-circle-icon.svg';
import { useAppNavigation } from '../Controller';
import { CsfListItemActions } from '../components/CsfListItemActions';
import { testID } from '../components/utils/testID';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import CsfPressable from '../components/CsfPressable';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaGeofencingLanding: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { data, isFetching } = useGeoFenceFetchQuery(undefined);
  const alerts = data?.data;
  const id = testID('GeofencingLanding');
  return (
    <MgaPage title={t('geofencingLanding:title')} showVehicleInfoBar>
      <MgaPageContent
        isLoading={isFetching}
        title={t('geofencingLanding:title')}>
        {alerts ? (
          <CsfView gap={32}>
            {alerts.length == 0 ? (
              <CsfTile>
                <CsfView align="center">
                  <CsfAppIcon icon="BoundaryAlert" size="xl" />
                  <CsfText align="center" testID={id('pageDescription')}>
                    {t('geofencingLanding:pageDescription')}
                  </CsfText>
                </CsfView>
              </CsfTile>
            ) : (
              <CsfTile p={0}>
                <CsfRuleList testID={id('list')}>
                  {alerts.map((alert, index) => {
                    const newAlert = { ...alert, active: !alert.active };
                    return (
                      <CsfListItem
                        title={alert.name}
                        key={alert.name}
                        testID={id(`item-${index}`)}
                        onPress={() =>
                          navigation.push('GeofencingSetting', {
                            alerts: alerts,
                            index: index,
                            target: alert,
                          })
                        }
                        icon={
                          <CsfPressable
                            onPress={async () => {
                              await geoFenceSaveAndSend(alerts, index, newAlert);
                            }}>
                            {alert.active ? (
                              <ActiveCircleIcon />
                            ) : (
                              <InactiveCircleIcon />
                            )}
                          </CsfPressable>
                        }
                        action={
                          <CsfListItemActions
                            trackingId={`BoundaryAlertActions-${index}`}
                            title={alert.name}
                            options={[
                              alert.active
                                ? {
                                  label: t(
                                    'geofencingLanding:deactivateAlert',
                                  ),
                                  value: 'deactivateAlert',
                                  handleSelect: async () =>
                                    await geoFenceSaveAndSend(
                                      alerts,
                                      index,
                                      newAlert,
                                    ),
                                }
                                : {
                                  label: t('geofencingLanding:sendToVehicle'),
                                  value: 'sendToVehicle',
                                  handleSelect: async () =>
                                    await geoFenceSaveAndSend(
                                      alerts,
                                      index,
                                      newAlert,
                                    ),
                                },

                              {
                                label: t('common:edit'),
                                value: 'edit',
                                variant: 'secondary',
                                handleSelect: () =>
                                  navigation.push('GeofencingSetting', {
                                    alerts: alerts,
                                    index: index,
                                    target: alert,
                                  }),
                              },
                              {
                                label: t('common:delete'),
                                value: 'delete',
                                variant: 'link',
                                icon: 'Delete',
                                handleSelect: async () => {
                                  const title = t('common:attention');
                                  const message: string = t(
                                    'speedAlertLanding:wantDelete',
                                    {
                                      name: alert.name,
                                    },
                                  );
                                  const yes: string = t('common:delete');
                                  const no: string = t('common:cancel');
                                  const response = await promptAlert(
                                    title,
                                    message,
                                    [
                                      {
                                        title: yes,
                                        type: 'primary',
                                      },
                                      { title: no, type: 'secondary' },
                                    ],
                                  );
                                  if (response == yes) {
                                    await geoFenceSaveAndSend(alerts, index);
                                  }
                                },
                              },
                            ]}
                          />
                        }
                      />
                    );
                  })}
                </CsfRuleList>
              </CsfTile>
            )}

            <CsfView>
              {alerts.length < 5 ? (
                <MgaButton
                  trackingId="BoundaryAlertCreateNewButton"
                  title={t('geofencingLanding:createNewAlert')}
                  onPress={() =>
                    navigation.push('GeofencingSetting', {
                      alerts: alerts,
                    })
                  }
                />
              ) : (
                <CsfText align="center" testID={id('reachedMaxNumber')}>
                  {t('geofencingLanding:reachedMaxNumber')}
                </CsfText>
              )}
            </CsfView>
          </CsfView>
        ) : (
          <CsfView style={{ height: '100%' }} justify="center">
            <CsfActivityIndicator />
          </CsfView>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaGeofencingLanding;
