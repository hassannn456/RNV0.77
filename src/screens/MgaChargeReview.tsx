import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useConditionQuery,
  usePhevGetTimerSettingsQuery,
} from '../features/remoteService/phev.api';
import ActiveCircleIcon from '../../content/svg/active-circle-icon.svg';
import InactiveCircleIcon from '../../content/svg/inactive-circle-icon.svg';
import { useAppNavigation } from '../Controller';
import {
  phevChargeNow,
  phevChargeNowNotConnected,
  phevChargeNowStatus,
  phevDeleteTimerSetting,
  phevFetchVehicleStatus,
  phevIsCharging,
  phevIsUnplugged,
  phevSendTimerSetting,
} from '../features/remoteService/phev.car';
import { formatFullDateTime, formatShortTime } from '../utils/dates';
import { VehicleConditionStatusResponse } from '../../@types';
import { convertUnits } from '../utils/units';
import { testID } from '../components/utils/testID';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfDetail from '../components/CsfDetail';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfListItem from '../components/CsfListItem';
import { CsfListItemActions } from '../components/CsfListItemActions';
import CsfPressable from '../components/CsfPressable';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaBatteryView from '../components/MgaBatteryView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaChargeReview: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const phevGetTimerSettings = usePhevGetTimerSettingsQuery(undefined);
  const chargeTimerSettings =
    phevGetTimerSettings.data?.data?.result?.data?.chargeTimerSettings ?? [];
  const conditionQuery = useConditionQuery(undefined);
  const condition = conditionQuery?.data?.data?.result;
  const chargingStatusText: string = condition
    ? phevIsCharging(condition)
      ? t('chargeReview:charging')
      : phevIsUnplugged(condition)
        ? t('chargeReview:unplugged')
        : t('chargeReview:pluggedIn')
    : '';

  const id = testID('ChargeReview');
  return condition || chargeTimerSettings ? (
    <MgaPage title={t('chargeReview:batteryStatus')} showVehicleInfoBar>
      <MgaPageContent title={t('chargeReview:batteryStatus')}>
        <CsfView>
          <CsfView
            flexDirection="row"
            standardSpacing
            align="center"
            justify="center">
            <CsfText align="center" testID={id('lastUpdatedTime')}>
              {condition?.lastUpdatedTime
                ? t('chargeReview:lastUpdated', {
                  when: formatFullDateTime(condition.lastUpdatedTime),
                })
                : '--'}
            </CsfText>
            <MgaButton
              trackingId="PHEVRefreshStatusButton"
              title={t('common:refresh')}
              onPress={async () => {
                await phevFetchVehicleStatus();
              }}
              variant="inlineLink"
            />
          </CsfView>
        </CsfView>

        <CsfView standardSpacing>
          <CsfTile>
            <CsfAlertBar
              title={t('chargeReview:vehicleCurrently', {
                status: chargingStatusText,
              })}
              testID={id('chargingStatusText')}
              action={
                conditionQuery.isLoading || conditionQuery.isFetching ? (
                  <CsfActivityIndicator />
                ) : conditionQuery.isError ? (
                  <CsfAppIcon color="error" icon="WarningAttention" />
                ) : (
                  <CsfAppIcon
                    color="button"
                    icon={
                      phevIsCharging(condition)
                        ? 'Charging'
                        : phevIsUnplugged(condition)
                          ? 'Unplugged'
                          : 'PluggedIn'
                    }
                  />
                )
              }
              flat />

            <MgaBatteryView
              batteryPercent={condition?.evStateOfChargePercent ?? 0}
            />

            <CsfDetail
              label={t('chargeReview:estimatedBatteryRangeTitle')}
              testID={id('estimatedBatteryRangeTitle')}
              value={
                <CsfView flexDirection="row" gap={4}>
                  <CsfText testID={id('evDistanceToEmpty')}>
                    {convertUnits(
                      condition?.evDistanceToEmpty,
                      'mi',
                      t('units:distance'),
                    ) ?? `-- ${t('units:distance')} `}
                  </CsfText>
                  <CsfInfoButton
                    title={t('chargeReview:estimatedBatteryRangeTitle')}
                    text={t('chargeReview:batteryRange')}
                    testID={id('batteryRange')}
                  />
                </CsfView>
              }
            />

            <MgaButton
              trackingId="PHEVChargeNowButton"
              title={t('chargeReview:chargeNow')}
              variant="secondary"
              onPress={async () => {
                const _ok = await promptAlert(
                  t('common:info'),
                  t('chargeSettings:isReadyToCharge'),
                );
                const status = await phevChargeNowStatus();
                const phevVehicleState = status.data
                  ?.result as VehicleConditionStatusResponse;
                if (phevVehicleState.evStateOfChargePercent == 100) {
                  const _ok = await promptAlert(
                    t('common:info'),
                    t('chargeSettings:isCharged'),
                  );
                } else if (phevIsCharging(phevVehicleState)) {
                  const _ok = await promptAlert(
                    t('common:info'),
                    t('chargeSettings:isCharging'),
                  );
                } else if (phevIsUnplugged(phevVehicleState)) {
                  const yes: string = t('common:continue');
                  const no: string = t('common:cancel');
                  const selection = await promptAlert(
                    t('common:alert'),
                    t('chargeSettings:chargePluggedIn'),
                    [
                      {
                        title: yes,
                        type: 'primary',
                      },
                      {
                        title: no,
                        type: 'link',
                      },
                    ],
                  );
                  if (selection == yes) {
                    await phevChargeNowNotConnected();
                  }
                } else {
                  const yes: string = t('common:continue');
                  const no: string = t('common:cancel');
                  const selection = await promptAlert(
                    t('common:alert'),
                    t('chargeSettings:readyToCharge'),
                    [
                      {
                        title: yes,
                        type: 'primary',
                      },
                      {
                        title: no,
                        type: 'primary',
                      },
                    ],
                  );
                  if (selection == yes) {
                    await phevChargeNow();
                  }
                }
              }}
            />
          </CsfTile>

          {/* <CsfText align="center">
              {t('chargeReview:selectToGetUpdatedSchedule')}
            </CsfText> */}
        </CsfView>

        <CsfView standardSpacing>
          {chargeTimerSettings.length == 0 ? (
            <CsfView>
              <CsfText bold align="center" testID={id('chargingTimer')}>
                {t('chargeReview:chargingTimer')}
              </CsfText>
              <CsfText align="center" testID={id('createSchedule')}>
                {t('chargeReview:createSchedule')}
              </CsfText>
            </CsfView>
          ) : (
            <>
              <CsfTile p={0}>
                <CsfRuleList>
                  {chargeTimerSettings.map((s, i) => {
                    const itemTestId = testID(id(`timerSetting-${i}`));
                    const timerType: string = t(
                      `chargeReview:${s.timerType.toLowerCase()}`,
                    );
                    const time = formatShortTime(
                      new Date(
                        2000,
                        1,
                        1,
                        s.chargeTime.hour,
                        s.chargeTime.minute,
                      ),
                    );
                    const title = `${timerType} ${time}`;

                    const schedule: string = Object.keys(s.repeatSchedule)
                      .filter(d => s.repeatSchedule[d])
                      .map(d => t(`common:days.${d.substring(0, 3)}`))
                      .join(', ');
                    return (
                      <CsfListItem
                        key={s.timerId}
                        icon={
                          <CsfPressable
                            testID={itemTestId('sendTimerSettings')}
                            onPress={async () =>
                              await phevSendTimerSetting({
                                pin: '',
                                vin: '',
                                timerId: String(s.timerId),
                                timerEnabled: !s.timerEnabled,
                                timerType: s.timerType,
                                precondition: s.precondition,
                                startHour: s.chargeTime.hour,
                                startMinute: s.chargeTime.minute,
                                ...s.repeatSchedule,
                              })
                            }>
                            {s.timerEnabled ? (
                              <ActiveCircleIcon />
                            ) : (
                              <InactiveCircleIcon />
                            )}
                          </CsfPressable>
                        }
                        title={title}
                        titleTextVariant="subheading"
                        subtitle={schedule}
                        subtitleTextVariant="body2"
                        action={
                          <CsfListItemActions
                            testID={itemTestId('ChargeReviewActions')}
                            title={title}
                            message={schedule}
                            options={[
                              {
                                label: t('common:edit'),
                                value: 'edit',
                                handleSelect: () =>
                                  navigation.push('ChargeSchedule', {
                                    chargeTimerSetting: s,
                                  }),
                                icon: 'Edit',
                              },
                              {
                                label: t('common:delete'),
                                value: 'delete',
                                icon: 'Delete',
                                variant: 'link',

                                handleSelect: async () => {
                                  await phevDeleteTimerSetting({
                                    timerSettingId: s.timerId,
                                    vin: '',
                                    pin: '',
                                  });
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
            </>
          )}
        </CsfView>

        <CsfView pt={0}>
          {chargeTimerSettings.length >= 3 ? (
            <CsfView>
              {/* <CsfText bold align="center">
  {t('chargeReview:createNewSchedule')}
</CsfText> */}
              <CsfText
                align="center"
                variant="caption"
                color="copySecondary"
                testID={id('reachedMaxNumber')}>
                {t('chargeReview:reachedMaxNumber')}
              </CsfText>
            </CsfView>
          ) : (
            <MgaButton
              trackingId="PHEVCreateNewScheduleButton"
              title={t('chargeReview:createNewSchedule')}
              onPress={() => navigation.navigate('ChargeSchedule')}
            />
          )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  ) : (
    <MgaPage title={t('chargeReview:batteryStatus')} showVehicleInfoBar>
      <CsfView flex={1} justify="center">
        <CsfActivityIndicator />
      </CsfView>
    </MgaPage>
  );
};

export default MgaChargeReview;
