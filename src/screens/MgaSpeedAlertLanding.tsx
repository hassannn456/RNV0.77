/* eslint-disable eqeqeq */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  speedFenceSaveAndSend,
  useSpeedFenceFetchQuery,
} from '../features/alerts/speedAlert.api';
import ActiveCircleIcon from '../../content/svg/active-circle-icon.svg';
import InactiveCircleIcon from '../../content/svg/inactive-circle-icon.svg';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import { CsfListItemActions } from '../components/CsfListItemActions';
import CsfPressable from '../components/CsfPressable';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaSpeedAlertLanding: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { data, isFetching } = useSpeedFenceFetchQuery(undefined);
  const alerts = data?.data;
  const id = testID('SpeedAlert');
  return (
    <MgaPage title={t('speedAlertLanding:title')} showVehicleInfoBar>
      <MgaPageContent
        isLoading={isFetching}
        title={t('speedAlertLanding:title')}>
        <CsfView gap={32} testID={id()}>
          {alerts ? (
            <>
              {alerts.length == 0 ? (
                <CsfTile>
                  <CsfView align="center">
                    <CsfAppIcon icon="SpeedAlert" size="xl" />
                    <CsfText align="center" testID={id('createAlerts')}>
                      {t('speedAlertLanding:createAlerts')}
                    </CsfText>
                  </CsfView>
                </CsfTile>
              ) : (
                <CsfTile p={0}>
                  <CsfRuleList testID={id('list')}>
                    {alerts.map((alert, index) => {
                      const itemTestId = testID(id(`alert-${index}`));
                      const newAlert = { ...alert, active: !alert.active };
                      return (
                        <CsfListItem
                          testID={itemTestId('list')}
                          onPress={() =>
                            navigation.push('SpeedAlertSetting', {
                              alerts: alerts,
                              index: index,
                              target: alert,
                            })
                          }
                          key={alert.name}
                          icon={
                            <CsfPressable
                              testID={itemTestId('button')}
                              onPress={async () => {
                                await speedFenceSaveAndSend(
                                  alerts,
                                  index,
                                  newAlert,
                                );
                              }}>
                              {alert.active ? (
                                <ActiveCircleIcon />
                              ) : (
                                <InactiveCircleIcon />
                              )}
                            </CsfPressable>
                          }
                          title={alert.name}
                          subtitle={t(
                            alert.maxSpeedKph
                              ? 'speedAlertLanding:speedAlertDescriptionKPH'
                              : 'speedAlertLanding:speedAlertDescriptionMPH',
                            {
                              seconds: alert.exceedMinimumSeconds,
                              speed: alert.maxSpeedKph || alert.maxSpeedMph,
                            },
                          )}
                          action={
                            <CsfListItemActions
                              trackingId={`SpeedAlertActions-${index}`}
                              title={alert.name}
                              options={[
                                alert.active
                                  ? {
                                    label: t(
                                      'speedAlertLanding:deactivateAlert',
                                    ),
                                    value: 'deactivateAlert',
                                    handleSelect: async () =>
                                      await speedFenceSaveAndSend(
                                        alerts,
                                        index,
                                        newAlert,
                                      ),
                                  }
                                  : {
                                    label: t(
                                      'speedAlertLanding:sendToVehicle',
                                    ),
                                    value: 'sendToVehicle',
                                    handleSelect: async () =>
                                      await speedFenceSaveAndSend(
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
                                    navigation.push('SpeedAlertSetting', {
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
                                      await speedFenceSaveAndSend(alerts, index);
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
                {alerts.length > 4 ? (
                  <CsfText align="center" testID={id('reachedLimit')}>
                    {t('speedAlertLanding:reachedLimit')}
                  </CsfText>
                ) : (
                  <MgaButton
                    trackingId="SpeedAlertsCreateNewButton"
                    title={t('speedAlertLanding:createANewSpeedAlert')}
                    onPress={() =>
                      navigation.push('SpeedAlertSetting', {
                        alerts: alerts,
                      })
                    }
                  />
                )}
              </CsfView>
            </>
          ) : (
            <CsfView>
              <CsfActivityIndicator />
            </CsfView>
          )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaSpeedAlertLanding;
