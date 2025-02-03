/* eslint-disable eol-last */
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../../Controller';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import {
  updateValetModeSpeedSettings,
  RemoteValetSettingsRequest,
  valetModeApi,
} from '../../features/remoteService/valetMode';
import {
  speedAlertOptionsMph,
  speedAlertValuesMps,
} from '../../utils/valetMode';
import { store } from '../../store';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfCard from '../../components/CsfCard';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfToggle from '../../components/CsfToggle';
import { CsfSegmentedButton } from '../../components/CsfSegmentedButton';
import MgaButton from '../../components/MgaButton';
import { CsfProgressDots } from '../../components/CsfProgressDots';

const MgaValetModeSetSpeedAlerts: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ValetModeSetPasscode'>();
  const _valetSetupScreens = route.params.setupScreenKeys;
  const [speedAlertEnabled, setSpeedAlertEnabled] = useState(false);
  // default selected speed limit for first time experience is `18MPS` AKA `40MPH`
  const [speedLimit, setSpeedLimit] = useState(String(speedAlertValuesMps[1]));
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };

  const id = testID('ValetModeSetSpeedAlerts');

  return (
    <MgaPage noScroll showVehicleInfoBar title={t('valetMode:setSpeedAlert')}>
      <MgaPageContent title={t('valetMode:setup.step2')}>
        <CsfCard
          testID={id('enableSpeedAlertPrompt')}
          title={t('valetMode:setup.enableSpeedAlertPrompt')}
          subtitle={t('valetMode:setup.speedAlertDescription')}>
          <CsfView width={'100%'} maxWidth={'100%'} flexDirection="row" pb={16}>
            <CsfView align="flex-start" justify="center" width={'80%'}>
              <CsfText variant="button" testID={id('speedAlert')}>
                {t('valetMode:speedAlert')}
              </CsfText>
            </CsfView>
            <CsfView justify="center" align="flex-end" width={'20%'}>
              <CsfToggle
                testID={id('setSpeedAlert')}
                align="center"
                editable={true}
                checked={speedAlertEnabled}
                onChangeValue={() => {
                  setSpeedAlertEnabled(!speedAlertEnabled);
                  setSpeedLimit(String(speedAlertValuesMps[1]));
                }}
              />
            </CsfView>
          </CsfView>

          <CsfSegmentedButton
            testID={id('selectSpeedLimitPrompt')}
            label={t('valetMode:setup.selectSpeedLimitPrompt')}
            value={speedLimit}
            options={speedAlertOptionsMph.map(option =>
              option.value == speedLimit
                ? { ...option, icon: 'Success' }
                : option,
            )}
            onChange={value => {
              setSpeedLimit(value as string);
              setSpeedAlertEnabled(true);
            }}
          />
        </CsfCard>

        <CsfView>
          <MgaButton
            trackingId="ValetSetupSendSettingsButton"
            title={t('valetMode:setup.sendSettings')}
            variant="primary"
            onPress={async () => {
              const params: RemoteValetSettingsRequest = {
                maxSpeedMPS: Number(speedLimit),
                hysteresisSec: 0,
                speedType: 'absolute',
                enableSpeedFence: speedAlertEnabled,
                vin: '',
                pin: '',
              };
              const response = await updateValetModeSpeedSettings(params);
              // invalidate the valet mode cache before routing to `ValetMode`
              await store
                .dispatch(
                  valetModeApi.endpoints.valetModeSetup.initiate(vParams),
                )
                .unwrap();

              await store
                .dispatch(
                  valetModeApi.endpoints.valetModeSettings.initiate(vParams),
                )
                .unwrap();
              if (response && response.success) {
                navigation.push('ValetMode');
              }
            }}
          />
          <CsfProgressDots count={2} index={1} variant="classic" />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaValetModeSetSpeedAlerts;