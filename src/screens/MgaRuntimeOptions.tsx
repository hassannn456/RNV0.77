import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { EngineStartSettings } from '../utils/vehicle';
import { store } from '../store';
import { climateApi } from '../features/remoteService/climate.api';
import { promptDelay } from './MgaSetDelay';
import { engineStart } from '../features/remoteService/engine.car';
import { popIfTop, useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfBottomModal from '../components/CsfBottomModal';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';

/** Start Settings Engine Start Modal */
const MgaRuntimeOptions: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const res = async (runTimeMinutes: string) => {
    const settings: EngineStartSettings = {
      name: 'Last In-Car Settings',
      runTimeMinutes: runTimeMinutes,
      startConfiguration: 'START_ENGINE_ALLOW_KEY_IN_IGNITION',
      presetType: 'subaruPreset',
      includeClimate: false,
    };
    const saveResponse = await store
      .dispatch(
        climateApi.endpoints.remoteEngineQuickStartSettingsSave.initiate(
          settings,
        ),
      )
      .unwrap();
    if (!saveResponse.success) { return; } // No error handler in Cordova
    const delay = await promptDelay();
    if (delay != null) {
      popIfTop(navigation, 'RuntimeOptions');
      await engineStart(settings, { delay: delay ?? 0, pin: '', vin: '' });
    }
  };
  const id = testID('RuntimeOptions');
  return (
    <CsfBottomModal
      title={t('home:runtimeSettings')}
      testID={id('runtimeSettings')}
      message={t('home:tapARuntime', {
        year: vehicle?.modelYear,
        model: vehicle?.modelName,
      })}>
      <CsfView gap={12} testID={id()}>
        {has('reg:CA', vehicle) && (
          <>
            <MgaButton
              icon="EngineStart"
              trackingId="RuntimeEngineStart1Min"
              style={{ flex: 1 }}
              title={t('climateControlSetting:runTimeMinutes', {
                count: 1,
              })}
              onPress={() => res('1')}
            />
            <MgaButton
              icon="EngineStart"
              trackingId="RuntimeEngineStart3Min"
              style={{ flex: 1 }}
              title={t('climateControlSetting:runTimeMinutes', {
                count: 3,
              })}
              onPress={() => res('3')}
            />
          </>
        )}

        <MgaButton
          icon="EngineStart"
          trackingId="RuntimeEngineStart5Min"
          title={t('climateControlSetting:runTimeMinutes', {
            count: 5,
          })}
          onPress={() => res('5')}
        />
        <MgaButton
          icon="EngineStart"
          trackingId="RuntimeEngineStart10Min"
          title={t('climateControlSetting:runTimeMinutes', {
            count: 10,
          })}
          onPress={() => res('10')}
          variant="secondary"
        />
      </CsfView>
    </CsfBottomModal>
  );
};

export default MgaRuntimeOptions;
