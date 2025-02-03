/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRemoteEngineQuickStartSettingsSaveMutation,
  useRemoteEngineStartSettingsFetchQuery,
  useSubaruPresets,
} from '../features/remoteService/climate.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { engineStart, engineStop } from '../features/remoteService/engine.car';
import { useAppNavigation } from '../Controller';
import { useAppSelector } from '../store';
import {
  remoteStatusReducer,
  useEngineRunning,
} from '../features/remoteService/remoteStatus.slice';
import { promptDelay } from './MgaSetDelay';
import { EngineStartSettings, getVehicleType } from '../utils/vehicle';
import i18n from '../i18n';
import { getStatusState } from '../components/MgaSnackbarRemoteServices';
import { useFocusEffect } from '@react-navigation/native';
import { trackError } from '../components/useTracking';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import promptAlert from '../components/CsfAlert';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfPressable from '../components/CsfPressable';
import CsfText from '../components/CsfText';
import CsfToggle from '../components/CsfToggle';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

export const getPresetName = (startSettings: EngineStartSettings): string => {
  const { t } = i18n;
  return startSettings.presetType == 'subaruPreset'
    ? t(
      `resPresets:subaruPresetNames.${startSettings.name
        .toLowerCase()
        .replace(' ', '_')}`,
    )
    : startSettings.name;
};

export const getTemperatureString = (
  startSettings: EngineStartSettings,
): string => {
  if (startSettings.climateZoneFrontTemp) {
    return `${startSettings.climateZoneFrontTemp}º`;
  }
  if (startSettings.climateZoneFrontTempCelsius) {
    return `${startSettings.climateZoneFrontTempCelsius}º`;
  }
  return '--';
};

const cardHeight = 112;
const userPresetsLimit = 4;
// TODO:UA:20230503: Valet check
const MgaClimateControl: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();

  const vehicleType = getVehicleType(vehicle);
  const [saveSetting, saveSettingStatus] =
    useRemoteEngineQuickStartSettingsSaveMutation();
  const navigation = useAppNavigation();
  const engineOn = useEngineRunning();
  const remoteStatus = useAppSelector(remoteStatusReducer);
  const [selectedPreset, setSelectedPreset] = useState(''); // maybe this should move to redux so you can leave presets page and come back?
  const [selectingPreset, setSelectingPreset] = useState(false);

  useFocusEffect(() => {
    // mga-1626 -- this is here because none of the the conditions we check for active toggle are true while the runtime modal is open.
    if (!engineOn && !remoteStatus) { setSelectingPreset(false); }
    return () => {
      if (selectedPreset != '') {
        setSelectingPreset(true);
      }
    };
  });

  const userPresets = useRemoteEngineStartSettingsFetchQuery(
    undefined,
  )?.data?.data?.filter(p => p != null);
  const sections: {
    title: string
    data: EngineStartSettings[]
  }[] = [];
  const subaruPresets = useSubaruPresets();
  if (subaruPresets) {
    sections.push({
      title: t('resPresets:starlinkPresets'),
      data: subaruPresets,
    });
  }
  if (userPresets) {
    sections.push({ title: t('resPresets:myPresets'), data: userPresets });
  }

  const id = testID('MgaClimateControl');

  const PresetItem: React.FC<{
    item: EngineStartSettings
    index: number
    presets: EngineStartSettings[]
    testID: string
  }> = ({ item, index, presets, ...props }) => {
    const presetName = `${item.presetType}-${item.name}`;
    const itemTestId = testID(id(props.testID));
    return (
      <CsfView
        key={index}
        width={'50%'}
        pr={index % 2 ? 0 : 8}
        pl={index % 2 ? 8 : 0}
        pb={16}>
        <CsfPressable
          testID={itemTestId('StartSettingsEdit')}
          onPress={() => {
            if (item.canEdit == 'true') {
              navigation.push('StartSettingsEdit', {
                presets,
                index,
              });
            } else {
              navigation.push('StartSettingsView', {
                settings: item,
              });
            }
          }}>
          <CsfCard height={cardHeight}>
            <CsfView height={'100%'} justify="space-between">
              <CsfText variant="body2" testID={itemTestId('presetName')}>
                {getPresetName(item)}
              </CsfText>

              <CsfView
                flexDirection="row"
                justify="space-between"
                style={{ alignItems: 'flex-end' }}>
                <CsfToggle
                  testID={itemTestId('savePreset')}
                  style={{ paddingVertical: 0 }}
                  editable={!saveSettingStatus.isLoading}
                  control
                  checked={
                    // we clicked this preset
                    presetName == selectedPreset &&
                    // engine is on, or saving setting, or remote command is in progress, or bottom modal is open
                    (engineOn ||
                      !!(
                        remoteStatus &&
                        getStatusState(remoteStatus) == 'progress'
                      ) ||
                      selectingPreset)
                  }
                  inline
                  onChangeValue={async isToggleOn => {
                    if (engineOn) {
                      const climateMessage =
                        vehicleType == 'gas'
                          ? {
                            buttonOk: t('resPresets:stopEngine'),
                            responseTitle: t('resPresets:engineRunning'),
                            responseDetail: t(
                              'resPresets:engineRunningClimatePresetError',
                            ),
                          }
                          : {
                            buttonOk: t('resPresets:turnOffCC'),
                            responseTitle: t(
                              'resPresets:climateControlRunning',
                            ),
                            responseDetail: t(
                              'resPresets:climateControlRunning2',
                            ),
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
                      const engineStopResponse = await engineStop();
                      //if engine stopped then setPreset
                      if (engineStopResponse.success) {
                        setSelectedPreset(
                          selectedPreset == presetName ? '' : presetName,
                        );
                      } else {
                        return;
                      }
                    }

                    if (isToggleOn) {
                      setSelectedPreset(presetName);
                      const delay = await promptDelay();

                      if (delay != null) {
                        const engineStartResult = await engineStart(item, {
                          delay: delay,
                          pin: '',
                          vin: '',
                        });

                        if (engineStartResult?.success) {
                          const save = await saveSetting(item).unwrap();
                          if (!save.success) {
                            // NOTE: Save call is optimistic. Errors are ignored.
                            trackError('MgaClimateControl.tsx')(
                              'Quick start setting can not be saved.',
                              { errorCode: save?.errorCode ?? '' },
                            );
                          }
                        }
                      }
                    }
                  }}
                />

                <CsfView>
                  {/* TODO:UA:20231226 temporary bodge. probably need to move this to transformResponse if the names are coming back from CA/FR pre-translated */}
                  {item.presetType == 'subaruPreset' &&
                    item.name.toLowerCase() == 'full cool' ? (
                    <CsfAppIcon icon="ClimateControlPreset" />
                  ) : item.presetType == 'subaruPreset' &&
                    item.name.toLowerCase() == 'full heat' ? (
                    <CsfAppIcon icon="FlamePreset" />
                  ) : item.presetType == 'subaruPreset' &&
                    item.name.toLowerCase() == 'auto' ? (
                    <CsfAppIcon icon="EngineStart" />
                  ) : (
                    <CsfText
                      variant="display2"
                      testID={itemTestId('temperature')}>
                      {getTemperatureString(item)}
                    </CsfText>
                  )}
                </CsfView>
              </CsfView>
            </CsfView>
          </CsfCard>
        </CsfPressable>
      </CsfView>
    );
  };

  return (
    <MgaPage title={t('resPresets:resPresets')} showVehicleInfoBar>
      <MgaPageContent title={t('resPresets:resPresets')}>
        {engineOn && (
          <CsfAlertBar
            type="success"
            title={t('resPresets:engineCurrentlyRunning')}
          />
        )}
        {subaruPresets.length > 0 && (
          <CsfView gap={16}>
            <CsfView align="center" justify="space-between" flexDirection="row">
              <CsfText variant="heading" testID={id('starlinkPresets')}>
                {t('resPresets:starlinkPresets')}
              </CsfText>
              <CsfInfoButton
                title={t('resPresets:climateRuntime')}
                text={t('resPresets:climateControlRuntimeInfo')}
                testID={id('climateControlRuntimeInfo')}
                actions={[{ title: t('common:ok'), type: 'primary' }]}
              />
            </CsfView>
            <CsfView
              flexDirection="row"
              style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {subaruPresets &&
                subaruPresets.map((item, i) => {
                  return (
                    <PresetItem
                      item={item}
                      index={i}
                      key={i}
                      presets={subaruPresets}
                      testID={`subaruPreset-${i}`}
                    />
                  );
                })}
            </CsfView>
          </CsfView>
        )}

        <CsfView gap={16}>
          <CsfView flexDirection="row" justify="space-between">
            <CsfText variant="heading" testID={id('myPresets')}>
              {t('resPresets:myPresets')}
            </CsfText>
            <CsfText variant="subheading" testID={id('userPresetsLimit')}>{`${userPresets?.length || '0'
              }/${userPresetsLimit}`}</CsfText>
          </CsfView>
          <CsfView
            flexDirection="row"
            style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {userPresets &&
              userPresets.map((item, i) => (
                <PresetItem
                  item={item}
                  index={i}
                  key={i}
                  presets={userPresets}
                  testID={`userPreset-${i}`}
                />
              ))}
            {userPresets && userPresets.length < userPresetsLimit && (
              <CsfPressable
                onPress={() =>
                  navigation.push('StartSettingsEdit', {
                    presets: userPresets,
                    index: userPresets.length,
                  })
                }
                testID={id('createNewPreset')}
                aria-label={t('resPresets:createNewPreset')}
                style={{
                  height: cardHeight,
                  width: '50%',
                  paddingRight: userPresets.length % 2 ? 0 : 8,
                  paddingLeft: userPresets.length % 2 ? 8 : 0,
                }}>
                <CsfView
                  align="center"
                  justify="center"
                  borderWidth={1}
                  borderColor="inputBorder"
                  width="100%"
                  height="100%"
                  borderRadius={8}
                  style={{
                    borderStyle: 'dashed',
                  }}>
                  <CsfView
                    bg="button"
                    width={32}
                    height={32}
                    borderRadius={16}
                    justify="center"
                    align="center">
                    <CsfAppIcon icon="Plus" color="light" />
                  </CsfView>
                </CsfView>
              </CsfPressable>
            )}
          </CsfView>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaClimateControl;
