import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChargeTimerSetting,
  ChargeTimerSettingTimerType,
} from '../features/remoteService/phev.api';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { phevSendTimerSetting } from '../features/remoteService/phev.car';
import { testID } from '../components/utils/testID';
import { CsfFormItemProps } from '../components';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfToggle from '../components/CsfToggle';
import CsfView from '../components/CsfView';
import MgaDayPicker from '../components/MgaDayPicker';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const defaultSettings: ChargeTimerSetting = {
  timerId: -1,
  timerType: 'START',
  timerEnabled: true,
  precondition: true,
  chargeTime: {
    hour: 0,
    minute: 0,
  },
  repeatSchedule: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
};

const MgaChargeSchedule: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ChargeSchedule'>();
  const settings = route.params?.chargeTimerSetting ?? defaultSettings;
  const [timerType, setTimerType] = useState(settings.timerType);
  const [autoClimate, setAutoClimate] = useState(false);
  const timerTypes = [
    { label: t('chargeSchedule:start'), value: 'START' },
    { label: t('chargeSchedule:departure'), value: 'DEPARTURE' },
  ];
  const daysValue: number[] = [];
  if (settings.repeatSchedule.sunday) {
    daysValue.push(0);
  }
  if (settings.repeatSchedule.monday) {
    daysValue.push(1);
  }
  if (settings.repeatSchedule.tuesday) {
    daysValue.push(2);
  }
  if (settings.repeatSchedule.wednesday) {
    daysValue.push(3);
  }
  if (settings.repeatSchedule.thursday) {
    daysValue.push(4);
  }
  if (settings.repeatSchedule.friday) {
    daysValue.push(5);
  }
  if (settings.repeatSchedule.saturday) {
    daysValue.push(6);
  }

  const id = testID('ChargeSchedule');
  return (
    <MgaPage title={t('chargeSchedule:chargingTimer')} focusedEdit>
      <MgaPageContent>
        <MgaForm
          initialValues={{
            timerType: settings.timerType,
            chargeTime: new Date(
              2000,
              1,
              1,
              settings.chargeTime.hour,
              settings.chargeTime.minute,
            ),
            precondition: settings.precondition,
            repeatSchedule: daysValue,
          }}
          fields={[
            {
              name: 'timerType',
              type: 'select',
              label: t('chargeSchedule:type'),
              options: timerTypes,
              componentProps: {
                onChange: (v: ChargeTimerSettingTimerType) => {
                  setTimerType(v);
                  setAutoClimate(v == 'START' ? false : autoClimate);
                },
              },
            },
            {
              name: 'chargeTime',
              type: 'date',
              componentProps: { mode: 'time', minuteInterval: 15 },
              label:
                timerType == 'START'
                  ? t('chargeSchedule:startTime')
                  : t('chargeSchedule:departureTime'),
            },
            {
              name: 'precondition',
              label: t('chargeSchedule:autoClimate'),
              component: (props: CsfFormItemProps) => {
                if (timerType !== 'START') {
                  return (
                    <CsfView
                      flexDirection="row"
                      justify="space-between"
                      align="center">
                      <CsfToggle
                        checked={props.value}
                        onChangeValue={val =>
                          props.onChange && props.onChange(val)
                        }
                        label={t('chargeSchedule:autoClimate')}
                        testID={id('autoClimateToggle')}
                      />
                      <CsfInfoButton
                        title={t('chargeSchedule:autoClimate')}
                        text={t('chargeSchedule:autoClimateDescription')}
                        testID={id('autoClimateInfo')}
                      />
                    </CsfView>
                  );
                }
              },
            },
            {
              name: 'repeatSchedule',
              label: t('chargeSchedule:repeatSchedule'),
              rules: {
                minLength: {
                  value: 1,
                  message: t('validation:required'),
                },
              },
              component: (props: CsfFormItemProps) => {
                return (
                  <MgaDayPicker
                    onChangeDays={(days: number[]) =>
                      props.onChange && props.onChange(days)
                    }
                    daysValue={props.value as number[]}
                    errors={props.error}
                    testID={id('days')}
                  />
                );
              },
            },
          ]}
          onSubmit={async (data: {
            repeatSchedule: number[]
            chargeTime: Date
            precondition: boolean
            timerType: ChargeTimerSettingTimerType
          }) => {
            const schedule = {
              sunday: data.repeatSchedule.includes(0),
              monday: data.repeatSchedule.includes(1),
              tuesday: data.repeatSchedule.includes(2),
              wednesday: data.repeatSchedule.includes(3),
              thursday: data.repeatSchedule.includes(4),
              friday: data.repeatSchedule.includes(5),
              saturday: data.repeatSchedule.includes(6),
            };

            const dateValue = new Date(data.chargeTime);

            const payload = {
              ...schedule,
              pin: '',
              precondition: data.precondition,
              startHour: dateValue.getHours(),
              startMinute: dateValue.getMinutes(),
              timerEnabled: true,
              timerType: data.timerType,
              timerId: settings.timerId > 0 ? String(settings.timerId) : '',
              vin: '',
            };

            const response = await phevSendTimerSetting(payload);
            if (response.success) {
              // successNotice({ title: t('common:savedNotice') })
              // TODO:UA:20240302 - confirm whether we need this success notice. it is colliding w/ snack bar.
              popIfTop(navigation, 'ChargeSchedule');
            }
          }}
          submitLabel={t('common:save')}
          onCancel={() => navigation.pop()}
          trackingId="ChargeScheduleForm"
        />
      </MgaPageContent>
    </MgaPage>
  );
};


export default MgaChargeSchedule;
