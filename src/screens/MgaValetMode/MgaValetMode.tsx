/* eslint-disable eol-last */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eqeqeq */
/* eslint-disable no-void */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useVehicleValetStatusQuery } from '../../api/vehicle.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useAppNavigation } from '../../Controller';
import {
  disableValetMode,
  useValetModeSettingsQuery,
} from '../../features/remoteService/valetMode';
import {
  updateValetModeSpeedSettings,
  RemoteValetSettingsRequest,
} from '../../features/remoteService/valetMode';
import {
  speedAlertOptionsMph,
  rapidPollIntervalMs,
} from '../../utils/valetMode';
import { ValetStatus } from '../../../@types';
import { CsfGroupValue } from '../../components/CsfRadioGroup';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import { CsfWindowShade, CsfWindowShadeRef } from '../../components/CsfWindowShade';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfToggle from '../../components/CsfToggle';
import CsfStatusChip from '../../components/CsfChip';
import { CsfSegmentedButton } from '../../components/CsfSegmentedButton';
import MgaButton from '../../components/MgaButton';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import MgaPageContent from '../../components/MgaPageContent';
import MgaValetStatusPoller from '../../components/MgaValetStatusPoller';
import { MgaValetStatusButton } from './MgaValetStatusButton';
import CsfCard from '../../components/CsfCard';
import CsfAppIcon from '../../components/CsfAppIcon';
import CsfTile from '../../components/CsfTile';

const MgaValetMode: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [isSpeedAlerts, setSpeedAlerts] = useState<boolean>(false);
  const optionsPanel = useRef<CsfWindowShadeRef>(null);
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const { data: valetModeSettingsData, refetch } =
    useValetModeSettingsQuery(vParams);
  const existingSpeedLimitMPS =
    valetModeSettingsData?.data?.speedFence?.maxSpeedMPS;
  const existingSpeedLimitOption = speedAlertOptionsMph.find(
    option => option.value == String(existingSpeedLimitMPS),
  );
  const remoteValetStatus =
    useVehicleValetStatusQuery(vParams, { pollingInterval: 0 }).data?.data ??
    'NO_RECORDS';
  const [valetStatus, setValetStatus] = useState<ValetStatus>(remoteValetStatus);
  const [valetActivating, setValetActivating] = useState<boolean>(false);
  const [valetDeactivating, setValetDeactivating] = useState<boolean>(false);
  const valetNotActive =
    valetStatus == 'VAL_OFF' ||
    valetStatus == 'NO_RECORDS' ||
    valetStatus == 'NO_MATCHING_SERVICE_NAME';
  useEffect(() => {
    if (valetActivating && remoteValetStatus == 'VAL_OFF') {
      setValetDeactivating(false);
      setValetStatus('VAL_ACTIVATING');
      void refetch();
    } else if (valetDeactivating && remoteValetStatus == 'VAL_ON') {
      setValetActivating(false);
      setValetStatus('VAL_DEACTIVATING');
    } else {
      setValetActivating(false);
      setValetDeactivating(false);
      setValetStatus(remoteValetStatus);
    }
  }, [remoteValetStatus, valetActivating, valetDeactivating]);

  // default, initial UI speed limit
  const [speedLimit, setSpeedLimit] = useState(speedAlertOptionsMph[1]);
  // if speed limit exists on the server, update UI
  useEffect(() => {
    setSpeedLimit(
      existingSpeedLimitOption
        ? existingSpeedLimitOption
        : speedAlertOptionsMph[1],
    );
    setSpeedAlerts(!!existingSpeedLimitOption);
  }, [existingSpeedLimitOption]);

  const handleSpeedChange = (val: CsfGroupValue) => {
    const selectedSpeed = speedAlertOptionsMph.find(
      option => option.value == String(val),
    );
    if (selectedSpeed) {
      setSpeedLimit(selectedSpeed);
      setSpeedAlerts(true);
    }
  };

  const id = testID('ValetMode');

  return (
    <MgaPage
      noScroll
      showVehicleInfoBar
      stickyFooter={() => {
        return (
          <CsfWindowShade
            overlay
            disabled={
              valetStatus == 'VAL_ON_PENDING' ||
              valetStatus == 'VAL_OFF_PENDING' ||
              valetStatus == 'VAL_DEACTIVATING'
            }
            title={t('valetMode:notificationOptions')}
            ref={optionsPanel}>
            <CsfView
              width={'100%'}
              maxWidth={'100%'}
              flexDirection="row"
              pt={16}
              ph={16}>
              <CsfView align="flex-start" justify="center" width={'80%'}>
                <CsfText variant="heading2" testID={id('speedAlert')}>
                  {t('valetMode:speedAlert')}
                </CsfText>
              </CsfView>
              <CsfView justify="center" align="flex-end" width={'20%'}>
                {valetNotActive ? (
                  <CsfToggle
                    align="center"
                    editable={valetNotActive}
                    checked={isSpeedAlerts}
                    testID={id('setSpeedLimit')}
                    onChangeValue={() => {
                      setSpeedAlerts(!isSpeedAlerts);
                      isSpeedAlerts && setSpeedLimit(speedAlertOptionsMph[1]);
                    }}
                  />
                ) : (
                  <CsfStatusChip
                    align="flex-end"
                    testID={id('existingSpeedLimitOption')}
                    value={existingSpeedLimitOption ? 'on' : 'off'}
                    active={!!existingSpeedLimitOption}
                    label={
                      existingSpeedLimitOption
                        ? t('common:on')
                        : t('common:off')
                    }
                  />
                )}
              </CsfView>
            </CsfView>
            <CsfView align="flex-start" ph={16} pt={16} gap={16}>
              <CsfView width={'100%'} gap={24}>
                {valetStatus == 'VAL_ON' && !!existingSpeedLimitOption && (
                  <CsfText testID={id('speedNotificationActive')}>
                    {t('valetMode:speedNotificationActive', {
                      speedLimitLabel: speedLimit.label,
                    })}
                  </CsfText>
                )}

                {valetStatus == 'VAL_ON' && (
                  <CsfText
                    variant="caption"
                    color="copySecondary"
                    testID={id('speedAlertsUneditable')}>
                    {t('valetMode:speedAlertsUneditable')}
                  </CsfText>
                )}
                {valetNotActive && (
                  <CsfSegmentedButton
                    options={speedAlertOptionsMph.map(option =>
                      option.value == speedLimit.value
                        ? { ...option, icon: 'Success' }
                        : option,
                    )}
                    value={speedLimit.value}
                    label={t('valetMode:notifySpeedExceeds')}
                    onChange={handleSpeedChange}
                    testID={id('notifySpeedExceeds')}
                  />
                )}

                {valetNotActive && (
                  <MgaButton
                    trackingId="ValetSaveAndSendButton"
                    variant="primary"
                    title={t('valetMode:saveAndSendSettings')}
                    onPress={() => {
                      const params: RemoteValetSettingsRequest = {
                        maxSpeedMPS: Number(speedLimit.value),
                        hysteresisSec: 0,
                        speedType: 'absolute',
                        enableSpeedFence: isSpeedAlerts,
                        vin: '',
                        pin: '',
                      };
                      updateValetModeSpeedSettings(params)
                        .then(res => {
                          if (res.errorCode) {
                            setSpeedLimit(
                              existingSpeedLimitOption
                                ? existingSpeedLimitOption
                                : speedAlertOptionsMph[1],
                            );
                            setSpeedAlerts(!!existingSpeedLimitOption);
                          }
                        })
                        .catch(() =>
                          CsfSimpleAlert(t('common:error'), undefined, {
                            type: 'error',
                          }),
                        );
                      optionsPanel.current?.setShadeOpen(false);
                    }}
                  />
                )}
                {valetStatus == 'VAL_ON' && (
                  <MgaButton
                    trackingId="DeactivateValetModeButton"
                    title={t('valetMode:deactivateValetMode')}
                    variant="primary"
                    onPress={() => {
                      setValetDeactivating(true);
                      optionsPanel.current?.setShadeOpen(false);
                      disableValetMode()
                        .then(({ errorCode, success }) => {
                          if (
                            !success &&
                            (errorCode == 'cancelled' ||
                              errorCode == 'TimeframePassed' ||
                              errorCode == 'InvalidCredentials')
                          ) {
                            setValetDeactivating(false);
                          }
                        })
                        .catch(console.error);
                    }}
                  />
                )}
              </CsfView>
            </CsfView>
          </CsfWindowShade>
        );
      }}
      title={t('valetMode:activateValetMode')}>
      <CsfView flex={1}>
        <MgaPageContent title={t('valetMode:valet')}>
          <MgaValetStatusPoller
            params={vParams}
            longPollIntervalMs={rapidPollIntervalMs}
            shortPollIntervalMs={rapidPollIntervalMs}
          />

          <CsfView height="100%" gap={24}>
            <CsfView align="center" flex={3} justify="center">
              <CsfView height={220}>
                <MgaValetStatusButton
                  status={valetStatus}
                  handleValetActivating={activating => {
                    setValetActivating(activating);
                  }}
                />
              </CsfView>
            </CsfView>

            <CsfView flex={2}>
              {valetStatus == 'VAL_ON_PENDING' && (
                <CsfCard
                  testID={id('valetModeOnPendingDescription')}
                  title={t('valetMode:reminder')}
                  subtitle={t('valetMode:valetModeOnPendingDescription')}
                  action={<CsfAppIcon icon="ValetMode" size="xl" />}
                />
              )}

              {valetStatus == 'VAL_OFF_PENDING' && (
                <CsfCard
                  testID={id('valetModeOffPendingDescription')}
                  title={t('valetMode:reminder')}
                  subtitle={t('valetMode:valetModeOffPendingDescription')}
                  action={<CsfAppIcon icon="ValetMode" size="xl" />}
                />
              )}

              {valetNotActive && (
                <CsfTile>
                  <CsfText
                    align="center"
                    variant="subheading"
                    testID={id('resetCodeInstructions')}>
                    {t('valetMode:setup.resetCodeInstructions')}
                  </CsfText>
                  <MgaButton
                    trackingId="ValetModePasswordResetButton"
                    title={t('valetMode:setup.goToReset')}
                    onPress={() => {
                      navigation.push('ValetPasscodeReset');
                    }}
                    variant="inlineLink"
                  />
                </CsfTile>
              )}

              {valetStatus == 'VAL_ON' && (
                <MgaButton
                  trackingId="ValetModeDeactivateButton"
                  title={t('valetMode:deactivate')}
                  variant="primary"
                  onPress={() => {
                    setValetDeactivating(true);
                    optionsPanel.current?.setShadeOpen(false);
                    disableValetMode()
                      .then(({ errorCode, success }) => {
                        if (
                          !success &&
                          (errorCode == 'cancelled' ||
                            errorCode == 'TimeframePassed' ||
                            errorCode == 'InvalidCredentials')
                        ) {
                          setValetDeactivating(false);
                        }
                      })
                      .catch(console.error);
                  }}
                />
              )}
            </CsfView>
          </CsfView>
        </MgaPageContent>
      </CsfView>
    </MgaPage>
  );
};

export default MgaValetMode;