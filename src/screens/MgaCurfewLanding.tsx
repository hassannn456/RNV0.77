import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  curfewAlertSaveAndSend,
  useCurfewAlertFetchQuery,
} from '../features/alerts/curfewAlert.api';
import ActiveCircleIcon from '../../content/svg/active-circle-icon.svg';
import InactiveCircleIcon from '../../content/svg/inactive-circle-icon.svg';
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
import { useAppNavigation } from '../Controller';

const MgaCurfewLanding: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { data, isFetching } = useCurfewAlertFetchQuery(undefined);
  const alerts = data?.data;
  const id = testID('CurfewLanding');
  return (
    <MgaPage title={t('curfewsLanding:title')} showVehicleInfoBar>
      {alerts ? (
        <MgaPageContent
          isLoading={isFetching}
          title={t('curfewsLanding:title')}>
          <CsfView gap={32} testID={id()}>
            {alerts.length == 0 ? (
              <CsfTile align="center">
                <CsfAppIcon color="copyPrimary" icon="CurfewAlert" size="xl" />
                <CsfText align="center" testID={id('createAlertDescription')}>
                  {t('curfewsLanding:createAlertDescription')}
                </CsfText>
              </CsfTile>
            ) : (
              <CsfTile p={0}>
                <CsfRuleList testID={id('list')}>
                  {alerts.map((alert, index) => {
                    const newAlert = { ...alert, active: !alert.active };
                    const itemTestId = testID(id(`alert-${index}`));

                    return (
                      <CsfListItem
                        key={alert.name}
                        title={alert.name}
                        testID={itemTestId()}
                        onPress={() =>
                          navigation.push('CurfewSetting', {
                            alerts: alerts,
                            index: index,
                            target: alert,
                          })
                        }
                        icon={
                          <CsfPressable
                            onPress={async () => {
                              await curfewAlertSaveAndSend(
                                alerts,
                                index,
                                newAlert,
                              );
                            }}
                            testID={itemTestId('button')}>
                            {alert.active ? (
                              <ActiveCircleIcon />
                            ) : (
                              <InactiveCircleIcon />
                            )}
                          </CsfPressable>
                        }
                        action={
                          <CsfListItemActions
                            trackingId={`CurfewActions-${index}`}
                            title={alert.name}
                            options={[
                              alert.active
                                ? {
                                  label: t('curfewsLanding:deactivateAlert'),
                                  value: 'deactivateAlert',
                                  handleSelect: async () =>
                                    await curfewAlertSaveAndSend(
                                      alerts,
                                      index,
                                      newAlert,
                                    ),
                                }
                                : {
                                  label: t('curfewsLanding:sendToVehicle'),
                                  value: 'sendToVehicle',
                                  handleSelect: async () =>
                                    await curfewAlertSaveAndSend(
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
                                  navigation.push('CurfewSetting', {
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
                                    await curfewAlertSaveAndSend(alerts, index);
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
                  trackingId="CurfewAlertsCreateNewButton"
                  title={t('curfewsLanding:createNewAlert')}
                  onPress={() =>
                    navigation.push('CurfewSetting', {
                      alerts: alerts,
                    })
                  }
                />
              ) : (
                <CsfText align="center" testID={id('reachedMaxNumber')}>
                  {t('curfewsLanding:reachedMaxNumber')}
                </CsfText>
              )}
            </CsfView>
          </CsfView>
        </MgaPageContent>
      ) : (
        <CsfView>
          <CsfActivityIndicator />
        </CsfView>
      )}
    </MgaPage>
  );
};

export default MgaCurfewLanding;
