import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { getTemperatureString } from './MgaClimateControl';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { testID } from '../components/utils/testID';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaStartSettingsView: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'StartSettingsView'>();
  const navigation = useAppNavigation();
  const settings = route.params?.settings;
  const vehicle = useCurrentVehicle();

  const id = testID('StartSettings');
  return (
    <MgaPage
      title={
        route.params?.isCurrent
          ? t('resPresets:quickStartSettings')
          : settings?.name
      }
      focusedEdit>
      <MgaPageContent>
        {settings?.length == 0 ? (
          <CsfView testID={id()}>
            <CsfView ph={16} pv={40}>
              <CsfText
                align="center"
                variant="title2"
                testID={id('noQuickStartSettingsTitle')}>
                {t('resPresets:noQuickStartSettingsTitle')}
              </CsfText>
            </CsfView>
            <CsfView gap={16}>
              <CsfText
                align="center"
                variant="body2"
                testID={id('noQuickStartSettingsContent')}>
                {t('resPresets:noQuickStartSettingsContent')}
              </CsfText>
              <MgaButton
                trackingId="StartSettingEditButton"
                title={t('resPresets:title')}
                onPress={() => {
                  navigation.navigate('ClimateControl');
                }}
              />
            </CsfView>
          </CsfView>
        ) : (
          <CsfView testID={id()}>
            <CsfView ph={16} pv={40}>
              <CsfText
                variant="title2"
                align="center"
                testID={id('currentSettings')}>
                {t('resPresets:currentSettings')}
              </CsfText>
            </CsfView>
            <CsfRuleList testID={id('list')}>
              <CsfDetail
                label={t('climateControlSetting:labels.runTimeMinutes')}
                value={t('climateControlSetting:values.runTimeMinutes', {
                  count: settings.runTimeMinutes,
                  defaultValue: `${settings.runTimeMinutes}`,
                })}
                testID={id('runTimeMinutes')}
              />
              <CsfDetail
                label={t('climateControlSetting:labels.temperature')}
                value={getTemperatureString(settings)}
                testID={id('temperature')}
              />
              {settings?.climateZoneFrontAirMode && (
                <CsfDetail
                  label={t('climateControlSetting:labels.airMode')}
                  value={t(
                    `climateControlSetting:lists.airFlow.${settings.climateZoneFrontAirMode.toUpperCase()}`,
                    { defaultValue: settings.climateZoneFrontAirMode },
                  )}
                  testID={id('airMode')}
                />
              )}
              {settings?.heatedSeatFrontLeft && has('cap:RHSF', vehicle) && (
                <CsfDetail
                  label={t('climateControlSetting:labels.driverSeat')}
                  value={t(
                    `climateControlSetting:lists.seat.${settings.heatedSeatFrontLeft.toUpperCase()}`,
                    { defaultValue: settings.heatedSeatFrontLeft },
                  )}
                  testID={id('driverSeat')}
                />
              )}

              {settings?.outerAirCirculation && (
                <CsfDetail
                  label={t('climateControlSetting:labels.airCirculation')}
                  value={t(
                    `climateControlSetting:lists.airCirculation.${settings.outerAirCirculation}`,
                    { defaultValue: settings.outerAirCirculation },
                  )}
                  testID={id('airCirculation')}
                />
              )}
              {settings?.heatedRearWindowActive && (
                <CsfDetail
                  label={t('climateControlSetting:labels.rearDefroster')}
                  value={
                    settings.heatedRearWindowActive == 'true'
                      ? t('common:on')
                      : t('common:off')
                  }
                  testID={id('rearDefroster')}
                />
              )}
              {settings?.climateZoneFrontAirVolume && (
                <CsfDetail
                  label={t('climateControlSetting:labels.fanSpeed')}
                  value={
                    settings.climateZoneFrontAirVolume == 'AUTO'
                      ? t('climateControlSetting:values.auto')
                      : t('climateControlSetting:values.level', {
                        level: settings.climateZoneFrontAirVolume,
                      })
                  }
                  testID={id('fanSpeed')}
                />
              )}
              {settings?.heatedSeatFrontRight && has('cap:RHSF', vehicle) && (
                <CsfDetail
                  label={t('climateControlSetting:labels.passengerSeat')}
                  value={t(
                    `climateControlSetting:lists.seat.${settings.heatedSeatFrontRight.toUpperCase()}`,
                    { defaultValue: settings.heatedSeatFrontRight },
                  )}
                  testID={id('passengerSeat')}
                />
              )}
              {settings?.airConditionOn && has('cap:RHVAC', vehicle) && (
                <CsfDetail
                  label={t('climateControlSetting:labels.rearAC')}
                  value={
                    settings.airConditionOn == 'true'
                      ? t('common:on')
                      : t('common:off')
                  }
                  testID={id('rearAC')}
                />
              )}
            </CsfRuleList>
            <CsfView pt={16}>
              <MgaButton
                onPress={() => navigation.pop()}
                title={t('common:ok')}
              />
            </CsfView>
          </CsfView>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};
export default MgaStartSettingsView;
