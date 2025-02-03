/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable radix */
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { engineStart, engineStop } from '../features/remoteService/engine.car';
import {
  useRemoteEngineQuickStartSettingsSaveMutation,
  useRemoteEngineStartSettingsSaveMutation,
} from '../features/remoteService/climate.api';
import { validate } from '../utils/validate';
import {
  ClimateFrontAirMode,
  HeatedSeatSetting,
  OutsideAirSetting,
  getVehicleType,
} from '../utils/vehicle';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { ClientSessionVehicle } from '../../@types';
import { CsfIcon } from '../../core/res/assets/icons';
import { useEngineRunning } from '../features/remoteService/remoteStatus.slice';
import { testID } from '../components/utils/testID';
import { ScrollView } from 'react-native';
import i18n from '../i18n';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfCard from '../components/CsfCard';
import CsfPressable from '../components/CsfPressable';
import { CsfSegmentedButton } from '../components/CsfSegmentedButton';
import CsfSelect from '../components/CsfSelect';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaTemperatureSlider from '../components/MgaTemperatureSlider';
import { successNotice } from '../components/notice';
import promptDelay from './MgaSetDelay';

interface AllowedValues {
  airFlow: ClimateFrontAirMode[]
  airVolume: string[]
  heatedSeat: HeatedSeatSetting[]
  heatedRearWindow: string[]
  outerAirCirculation: OutsideAirSetting[]
  runTimeMinutes: string[]
  temperatureFahrenheit: string[]
  temperatureCelsius: string[]
}

const getAllowedValues: (
  v: ClientSessionVehicle | null,
) => AllowedValues = v => {
  const runTimeMinutes: string[] = (() => {
    const { t } = i18n;
    const key = has('cap:PHEV')
      ? 'engineStart:runtimeMinutesPHEV'
      : 'engineStart:runtimeMinutes';
    const value = t(key, { returnObjects: true });
    if (Array.isArray(value)) {
      return value as string[];
    } else {
      return ['5', '10'];
    }
  })();
  return {
    airFlow: ['FACE', 'FEET_FACE_BALANCED', 'FEET', 'FEET_WINDOW', 'WINDOW'],
    airVolume: Array.from({ length: 7 - 1 + 1 }, (_, i) => String(i + 1)),
    heatedRearWindow: ['false', 'true'],
    heatedSeat:
      v && v.features && v.features.includes('RVFS')
        ? [
          'HIGH_COOL',
          'HIGH_HEAT',
          'MEDIUM_COOL',
          'MEDIUM_HEAT',
          'LOW_COOL',
          'LOW_HEAT',
          'OFF',
        ]
        : ['HIGH_HEAT', 'MEDIUM_HEAT', 'LOW_HEAT', 'OFF'],
    outerAirCirculation: ['outsideAir', 'recirculation'],
    runTimeMinutes: runTimeMinutes,
    temperatureFahrenheit: Array.from({ length: 85 - 60 + 1 }, (_, i) =>
      String(i + 60),
    ),
    temperatureCelsius: Array.from({ length: (29 - 18) * 2 + 1 }, (_, i) =>
      String(i * 0.5 + 18),
    ),
  };
};

const airFlowIcons: Record<ClimateFrontAirMode, CsfIcon> = {
  FACE: 'AirflowInstrumentPanelOnly',
  FEET_FACE_BALANCED: 'AirflowInstrumentPanelFootOutlets',
  FEET: 'AirflowFootOutlets',
  FEET_WINDOW: 'AirflowHeatDefrost',
  WINDOW: 'FrontDefrost',
};

const MgaStartSettingsEdit: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const route = useAppRoute<'StartSettingsEdit'>();
  const navigation = useAppNavigation();
  const presets = route.params.presets;
  const current =
    presets[route.params.index] ?? t('climate:default', { returnObjects: true });
  const autoMode = current.name.toUpperCase() == 'AUTO';
  const engineOn = useEngineRunning();
  const [settings, setSettings] = useState({
    ...current,
    heatedSeatFrontLeft: autoMode ? '' : current.heatedSeatFrontLeft,
    heatedSeatFrontRight: autoMode ? '' : current.heatedSeatFrontLeft,
  });
  const [saveQuick, statusQuick] =
    useRemoteEngineQuickStartSettingsSaveMutation();
  const [saveUser, statusUser] = useRemoteEngineStartSettingsSaveMutation();
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameStartPosition, setNameStartPosition] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLoading = statusQuick.isLoading || statusUser.isLoading || loading;
  const id = testID('StartSettingsEdit');
  const errors = validate(
    settings,
    {
      name: {
        alphanumericSpaceWithQuotesAmp: true,
        required: true,
        maxlength: 30,
        nameAlreadyExists: presets
          .map(p => p.name)
          .filter(n => n != current.name),
      },
    },
    (key, error) => {
      return t(`climateControlSetting:errors.${key}.${error as string}`, {
        defaultValue: t(`validation:${error as string}`),
      });
    },
  );
  const canDelete =
    current.presetType == 'userPreset' &&
    route.params.index < route.params.presets.length;
  const disabled = current.disabled == 'true';
  const allowedValues = getAllowedValues(vehicle);
  const showSave = current.presetType == 'userPreset';
  const vehicleType = getVehicleType(vehicle);

  const climateRunningMessage = async () => {
    const climateMessage =
      vehicleType == 'gas'
        ? {
          buttonOk: t('resPresets:stopEngine'),
          responseTitle: t('resPresets:engineRunning'),
          responseDetail: t('resPresets:engineRunningClimatePresetError'),
        }
        : {
          buttonOk: t('resPresets:turnOffCC'),
          responseTitle: t('resPresets:climateControlRunning'),
          responseDetail: t('resPresets:climateControlRunning2'),
        };
    const response = await promptAlert(
      climateMessage.responseTitle,
      climateMessage.responseDetail,
      [
        { title: climateMessage.buttonOk, type: 'primary' },
        { title: t('common:cancel'), type: 'secondary' },
      ],
    );
    if (response != climateMessage.buttonOk) { return; }
    await engineStop();
  };

  /**
   * Return true if error is present.
   *
   * Also starts error display and jumps to error.
   **/
  const hasErrors = (): boolean => {
    setShowErrors(true);
    const result = Object.keys(errors).length > 0;
    if (scrollRef.current) {
      if (errors.name) {
        scrollRef.current.scrollTo({ y: nameStartPosition });
      }
    }
    return result;
  };

  const EngineRuntime: React.FC<{
    onChange: () => void
    value: number
    testID?: string
  }> = props => {
    const { t } = useTranslation();
    const numbersOnly = allowedValues.runTimeMinutes.length > 3;
    // MGAS-297: Engine start counts come from content bucket.
    // They can either be an array of strings or numbers.
    // Using numbers allows translation (pluralization) to work
    // Using numbers also causes Android's accessibilityLabel implementation to crash
    // So options assumes neither and casts to number or string as needed
    const options = allowedValues.runTimeMinutes.map(m => ({
      label: numbersOnly
        ? String(m)
        : t('climateControlSetting:runTimeMinutes', {
          count: parseInt(m),
        }),
      value: m,
    }));
    return (
      <CsfCard
        title={
          has('cap:PHEV')
            ? t('climateControlSetting:labels.climateRunTimeMinutes')
            : t('climateControlSetting:labels.runTimeMinutes')
        }>
        <CsfSegmentedButton
          options={options}
          disabled={isLoading || disabled}
          onChange={props.onChange}
          value={props.value}
          testID={props.testID}
        />
      </CsfCard>
    );
  };

  const SeatSettingsButton: React.FC<{
    onChange: () => void
    value: string
    mode: 'heat' | 'cool'
    testID: string
  }> = ({ value, mode, onChange, testID }) => {
    const { t } = useTranslation();

    const options = ['low', 'medium', 'high'].map(option =>
      `${option}_${mode}`.toUpperCase(),
    );

    const index = options.indexOf(value);
    const valueBelongs = value !== 'OFF' && index > -1;
    return (
      <CsfPressable
        onPress={() => {
          if (value == 'OFF' || !valueBelongs) {
            onChange(options[2]);
          } else {
            onChange(options[index - 1]);
          }
        }}
        disabled={isLoading || disabled}
        style={{ flex: 1, height: 88 }}>
        <CsfTile
          flat
          borderWidth={1}
          borderColor="inputBorder"
          style={{ height: 88 }}
          bg={valueBelongs ? 'highlightInfo' : undefined}>
          <CsfView height="100%" justify="space-between">
            <CsfText testID={testID}>
              {t(`climateControlSetting:labels.${mode}`)}
            </CsfText>
            <CsfView
              flexDirection="row"
              justify="space-between"
              align="flex-end">
              <CsfView height={16} width={24} justify="space-between">
                {[...options]
                  .map((option, i) => {
                    return (
                      <CsfView
                        height={2}
                        width={'100%'}
                        key={option}
                        bg={i <= index ? 'button' : 'inputBorder'}
                      />
                    );
                  })
                  .reverse()}
              </CsfView>
              <CsfAppIcon icon={mode == 'heat' ? 'HeatedSeat' : 'CooledSeat'} />
            </CsfView>
          </CsfView>
        </CsfTile>
      </CsfPressable>
    );
  };

  const SeatSettings: React.FC<{
    value: HeatedSeatSetting
    onChange: () => void
    title: string
    testID?: string
  }> = ({ value, onChange, title, testID }) => {
    return (
      <CsfCard title={title}>
        <CsfView flexDirection="row" gap={16}>
          <SeatSettingsButton
            value={value}
            onChange={onChange}
            mode="heat"
            testID={testID}
          />

          {has('cap:RVFS', vehicle) && (
            <SeatSettingsButton
              value={value}
              onChange={onChange}
              mode="cool"
              testID={testID}
            />
          )}
        </CsfView>
      </CsfCard>
    );
  };

  const RearDefroster: React.FC<{
    onChange: () => void
    value: string
    testID?: string
  }> = props => {
    const { t } = useTranslation();
    return (
      <CsfCard title={t('climateControlSetting:labels.rearDefroster')}>
        <CsfSegmentedButton
          options={allowedValues.heatedRearWindow.map(m => ({
            label: m == 'true' ? t('common:on') : t('common:off'),
            value: m,
          }))}
          value={props.value}
          onChange={props.onChange}
          disabled={isLoading || disabled}
          testID={props.testID}
        />
      </CsfCard>
    );
  };

  const TemperatureCelsius: React.FC<{
    testID?: string
  }> = props => {
    const { t } = useTranslation();
    const currentValue = parseFloat(settings.climateZoneFrontTempCelsius ?? '');
    const values: number[] = allowedValues.temperatureCelsius.map(v =>
      parseFloat(v),
    );
    return (
      <CsfCard
        title={t('climateControlSetting:labels.temperature')}
        action={
          <CsfText
            variant="display2"
            testID={props.testID}>{`${currentValue}º`}</CsfText>
        }>
        <MgaTemperatureSlider
          min={Math.min(...values)}
          max={Math.max(...values)}
          onChange={value =>
            setSettings(prevState => {
              return {
                ...prevState,
                climateZoneFrontTempCelsius: value,
              };
            })
          }
          step={0.5}
          value={currentValue}
          disabled={isLoading || disabled}
        />
      </CsfCard>
    );
  };

  const TemperatureFahrenheit: React.FC<{
    testID?: string
  }> = props => {
    const { t } = useTranslation();
    const currentValue = parseFloat(settings.climateZoneFrontTemp ?? '');
    const values: number[] = allowedValues.temperatureFahrenheit.map(v =>
      parseFloat(v),
    );
    return (
      <CsfCard
        title={t('climateControlSetting:labels.temperature')}
        action={
          <CsfText
            variant="display2"
            testID={props.testID}>{`${currentValue}º`}</CsfText>
        }>
        <MgaTemperatureSlider
          min={Math.min(...values)}
          max={Math.max(...values)}
          onChange={value =>
            setSettings(prevState => {
              return {
                ...prevState,
                climateZoneFrontTemp: value,
              };
            })
          }
          value={currentValue}
          disabled={isLoading || disabled}
        />
      </CsfCard>
    );
  };

  const temperature = useMemo(() => {
    return settings.climateZoneFrontTemp ? (
      <TemperatureFahrenheit />
    ) : (
      <TemperatureCelsius />
    );
  }, [
    settings.climateZoneFrontTemp || settings.climateZoneFrontTempCelsius,
    isLoading,
  ]);

  return (
    <MgaPage
      noScroll
      title={
        settings.name
          ? t('resPresets:settings', { name: settings.name })
          : t('resPresets:createNewPreset')
      }>
      <ScrollView ref={scrollRef}>
        <CsfView pv={24} ph={16} flexDirection="column" gap={16} testID={id()}>
          {settings.presetType == 'subaruPreset' ? (
            <CsfText
              align="center"
              variant="subheading"
              testID={id('presetText')}>
              {autoMode
                ? t('resPresets:autoPresetText')
                : t('resPresets:cantEditPresetText')}
            </CsfText>
          ) : (
            <CsfCard title={t('climateControlSetting:labels.name')}>
              <CsfInput
                errors={showErrors && errors.name}
                label={t('climateControlSetting:labels.name')}
                maxLength={30}
                value={settings.name}
                editable={!isLoading}
                onChangeText={value =>
                  setSettings({ ...settings, name: value })
                }
                onLayout={event =>
                  setNameStartPosition(event.nativeEvent.layout.y)
                }
                trackingId="climateControlName"
              />
            </CsfCard>
          )}
          {autoMode ? (
            <CsfView gap={16}>
              <EngineRuntime
                onChange={value => {
                  // eslint-disable-next-line
                  setSettings({ ...settings, runTimeMinutes: value })
                }}
                value={settings.runTimeMinutes}
                testID={id('engineRuntime')}
              />
              {temperature}

              <RearDefroster
                onChange={value => {
                  // eslint-disable-next-line
                  setSettings({ ...settings, heatedRearWindowActive: value })
                }}
                value={settings.heatedRearWindowActive}
                testID={id('rearDefroster')}
              />

              {has('cap:RHSF', vehicle) && (
                <>
                  <SeatSettings
                    title={t('climateControlSetting:labels.driverSeat')}
                    value={settings.heatedSeatFrontLeft?.toUpperCase()}
                    onChange={(value: HeatedSeatSetting) =>
                      setSettings({ ...settings, heatedSeatFrontLeft: value })
                    }
                    testID={id('seatSettings')}
                  />

                  <SeatSettings
                    title={t('climateControlSetting:labels.passengerSeat')}
                    value={settings.heatedSeatFrontRight?.toUpperCase()}
                    onChange={(value: HeatedSeatSetting) =>
                      setSettings({
                        ...settings,
                        heatedSeatFrontRight: value,
                      })
                    }
                    testID={id('seatSettings')}
                  />
                </>
              )}
            </CsfView>
          ) : (
            <CsfView gap={16}>
              <EngineRuntime
                value={settings.runTimeMinutes}
                onChange={value => {
                  // eslint-disable-next-line
                  setSettings({ ...settings, runTimeMinutes: value })
                }}
                testID={id('engineRuntime')}
              />
              {temperature}
              <RearDefroster
                onChange={value => {
                  // eslint-disable-next-line
                  setSettings({ ...settings, heatedRearWindowActive: value })
                }}
                value={settings.heatedRearWindowActive}
                testID={id('rearDefroster')}
              />
              <CsfCard title={t('climateControlSetting:labels.airMode')}>
                <CsfSegmentedButton
                  label={t('climateControlSetting:labels.airMode')}
                  value={settings.climateZoneFrontAirMode}
                  options={allowedValues.airFlow.map(m => ({
                    label: t(`climateControlSetting:lists.airFlow.${m}`),
                    value: m,
                    icon: airFlowIcons[m],
                  }))}
                  disabled={isLoading || disabled}
                  iconOnly
                  onChange={value => {
                    setSettings({
                      ...settings,
                      climateZoneFrontAirMode: value as ClimateFrontAirMode,
                    });
                  }}
                />
              </CsfCard>

              <CsfCard title={t('climateControlSetting:labels.airCirculation')}>
                <CsfSegmentedButton
                  label={t('climateControlSetting:labels.airCirculation')}
                  value={settings.outerAirCirculation}
                  options={allowedValues.outerAirCirculation.map(m => ({
                    label: t(`climateControlSetting:lists.airCirculation.${m}`),
                    value: m,
                  }))}
                  disabled={isLoading || disabled}
                  onChange={value =>
                    setSettings({
                      ...settings,
                      outerAirCirculation: value as OutsideAirSetting,
                    })
                  }
                />
              </CsfCard>

              {has('cap:RHSF', vehicle) && (
                <>
                  <SeatSettings
                    title={t('climateControlSetting:labels.driverSeat')}
                    value={settings.heatedSeatFrontLeft?.toUpperCase()}
                    onChange={(value: HeatedSeatSetting) =>
                      setSettings({ ...settings, heatedSeatFrontLeft: value })
                    }
                    testID={id('seatSettings')}
                  />

                  <SeatSettings
                    title={t('climateControlSetting:labels.passengerSeat')}
                    value={settings.heatedSeatFrontRight?.toUpperCase()}
                    onChange={(value: HeatedSeatSetting) =>
                      setSettings({
                        ...settings,
                        heatedSeatFrontRight: value,
                      })
                    }
                    testID={id('seatSettings')}
                  />
                </>
              )}

              <CsfCard title={t('climateControlSetting:labels.fanSpeed')}>
                <CsfSelect
                  label={t('climateControlSetting:labels.fanSpeed')}
                  value={settings.climateZoneFrontAirVolume}
                  options={allowedValues.airVolume.map(m => ({
                    label: t('climateControlSetting:values.level', {
                      level: m,
                      defaultValue: `${m ?? '--'}`,
                    }),
                    value: m,
                  }))}
                  disabled={isLoading || disabled}
                  onSelect={value =>
                    setSettings({
                      ...settings,
                      climateZoneFrontAirVolume: value,
                    })
                  }
                />
              </CsfCard>

              {has('cap:RHVAC', vehicle) && (
                <CsfCard title={t('climateControlSetting:labels.rearAC')}>
                  <CsfSegmentedButton
                    options={[
                      {
                        label: t('common:on'),
                        value: 'true',
                      },
                      {
                        label: t('common:off'),
                        value: 'false',
                      },
                    ]}
                    disabled={isLoading || disabled}
                    value={settings.airConditionOn}
                    onChange={value =>
                      setSettings({
                        ...settings,
                        airConditionOn: value as 'true' | 'false',
                      })
                    }
                    testID={id('airConditionOn')}
                  />
                </CsfCard>
              )}
            </CsfView>
          )}

          {isLoading ? (
            <CsfView>
              <CsfActivityIndicator />
            </CsfView>
          ) : (
            <CsfView gap={12}>
              {showSave && (
                <MgaButton
                  trackingId="StartSettingsSavePresetButton"
                  onPress={async () => {
                    if (hasErrors()) { return; }
                    // NOTE: Save call is optimistic. Errors are ignored.
                    const newPresets = presets.slice();
                    newPresets[route.params.index] = settings;
                    await saveUser(newPresets).unwrap();
                    const yourSettings: string = t('resPresets:yourSettings');
                    const savedMessage: string = t(
                      'resPresets:presetSuccessfullySaved',
                    );
                    const alertMessageBody = `${yourSettings}${settings.name}${savedMessage}`;
                    successNotice({
                      title: t('resPresets:presetCreated'),
                      subtitle: alertMessageBody,
                    });
                    popIfTop(navigation, 'StartSettingsEdit');
                  }}
                  style={{ flex: 1 }}
                  title={t('resPresets:savePreset')}
                />
              )}

              {showSave && (
                <MgaButton
                  trackingId="StartSettingsSaveAndStartButton"
                  onPress={async () => {
                    if (engineOn) {
                      await climateRunningMessage();
                    } else {
                      if (hasErrors()) { return; }
                      // NOTE: Save call is optimistic. Errors are ignored.
                      setLoading(true);
                      // NOTE: Save call is optimistic. Errors are ignored.
                      const newPresets = presets.slice();
                      newPresets[route.params.index] = settings;
                      await saveUser(newPresets).unwrap();
                      const delay = await promptDelay();
                      if (delay != null) {
                        const engineResponse = await engineStart(settings, {
                          delay: delay,
                          pin: '',
                          vin: '',
                        });
                        setLoading(false);
                        if (engineResponse?.success) {
                          void saveQuick(settings).unwrap();
                          popIfTop(navigation, 'StartSettingsEdit');
                        }
                      } else {
                        setLoading(false);
                      }
                    }
                  }}
                  style={{ flex: 1 }}
                  title={
                    vehicleType == 'gas'
                      ? t('resPresets:saveSettingsStartEngine')
                      : t('resPresets:saveSettingsStartEnginePHEV')
                  }
                  variant={'secondary'}
                />
              )}
              <MgaButton
                trackingId="StartSettingsStartButton"
                onPress={async () => {
                  // NOTE: Save call is optimistic. Errors are ignored.
                  if (engineOn) {
                    await climateRunningMessage();
                  } else {
                    setLoading(true);
                    const delay = await promptDelay();
                    if (delay != null) {
                      const engineStartResult = await engineStart(settings, {
                        delay: delay,
                        pin: '',
                        vin: '',
                      });
                      if (engineStartResult?.success) {
                        void saveQuick(settings).unwrap();
                      }
                    }
                    setLoading(false);
                  }
                }}
                style={{ flex: 1 }}
                title={
                  vehicleType == 'gas'
                    ? t('resPresets:startEngine')
                    : t('resPresets:startPhev')
                }
                variant={showSave ? 'secondary' : 'primary'}
              />

              {canDelete && (
                <MgaButton
                  trackingId="StartSettingsDeletePresetButton"
                  onPress={async () => {
                    const remove: string = t('common:delete');
                    const cancel: string = t('common:cancel');
                    const selection = await promptAlert(
                      t('resPresets:deletePreset'),
                      t('resPresets:deletePresetMessage', {
                        name: presets[route.params.index].name,
                      }),
                      [
                        {
                          title: remove,
                          type: 'primary',
                        },
                        {
                          title: cancel,
                          type: 'secondary',
                        },
                      ],
                    );
                    if (selection == remove) {
                      // NOTE: Save call is optimistic. Errors are ignored.
                      const newPresets = presets.slice();
                      delete newPresets[route.params.index];
                      await saveUser(newPresets.filter(np => np)).unwrap();
                      popIfTop(navigation, 'StartSettingsEdit');
                    }
                  }}
                  icon="Delete"
                  title={t('resPresets:deletePreset')}
                  variant="link"
                />
              )}

              {!showSave && (
                <MgaButton
                  variant="link"
                  trackingId="StartSettingsEditPresetCancel"
                  title={t('common:cancel')}
                  onPress={() => navigation.pop()}
                />
              )}
            </CsfView>
          )}
        </CsfView>
      </ScrollView>
    </MgaPage>
  );
};

export default MgaStartSettingsEdit;
