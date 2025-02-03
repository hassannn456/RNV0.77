/* eslint-disable radix */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import {
  Curfew,
  CurfewAlert,
  curfewAlertSaveAndSend,
} from '../features/alerts/curfewAlert.api';
import { useTimeZones } from '../features/admin/admin.api';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { translateErrors, validate } from '../utils/validate';
import { ClientSessionVehicle } from '../../@types';
import { Keyboard } from 'react-native';
import { formatLabel } from '../components/CsfForm/CsfForm';
import { testID } from '../components/utils/testID';
import CsfDatePicker from '../components/CsfDatePicker';
import CsfFocusedEdit from '../components/CsfFocusedEdit';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSelect from '../components/CsfSelect';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaDayPicker from '../components/MgaDayPicker';

const getDefaultValuesAlert: (
  v: ClientSessionVehicle | null,
) => CurfewAlert = v => {
  return {
    name: '',
    active: true,
    timeZoneId: v?.timeZone ?? '',
    curfews: [getDefaultValuesCurfew()],
  };
};

const getDefaultValuesCurfew: () => Curfew = () => {
  return {
    startHour: '20',
    startMinute: '00',
    endHour: '06',
    endMinute: '00',
    days: [],
  };
};

const getStartDate: (curfew: Curfew) => Date = curfew => {
  return new Date(
    new Date().setHours(
      parseInt(curfew.startHour),
      parseInt(curfew.startMinute),
      0,
    ),
  );
};

const getEndDate: (curfew: Curfew) => Date = curfew => {
  return new Date(
    new Date().setHours(
      parseInt(curfew.endHour),
      parseInt(curfew.endMinute),
      0,
    ),
  );
};

const MgaCurfewSetting: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = getCurrentVehicle();
  const route = useAppRoute<'CurfewSetting'>();
  const navigation = useAppNavigation();
  const alerts = route.params.alerts;
  const index = route.params.index;
  const [target, setTarget] = useState<CurfewAlert>(
    route.params.target ?? getDefaultValuesAlert(vehicle),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeZones = useTimeZones();

  const setCurfew = (curfew: Curfew, index: number) => {
    setTarget({
      ...target,
      curfews: target.curfews.map((c, i) => (index == i ? curfew : c)),
    });
  };
  const alertErrors = validate(target, {
    name: {
      alphanumericSpace: true,
      nameAlreadyExists: alerts
        .map(alert => alert.name)
        .filter(name => name != route.params.target?.name),
      noSpaceStart: true,
      noSpaceEnd: true,
      required: true,
    },
    timeZoneId: 'required',
  });
  const curfewErrors = target.curfews.map((curfew, cIndex) => {
    return validate(curfew, {
      days: {
        custom: {
          crossesUTCMidnight: () => {
            const dayOffset =
              curfew.startHour > curfew.endHour ||
                (curfew.startHour == curfew.endHour &&
                  curfew.startMinute > curfew.endMinute)
                ? 1
                : 0;
            const startDate = getStartDate(curfew)
              .toISOString()
              .substring(0, 10);
            const endDate = (() => {
              const endDate = getEndDate(curfew);
              if (dayOffset) {
                endDate.setDate(endDate.getDate() + dayOffset);
              }
              return endDate;
            })()
              .toISOString()
              .substring(0, 10);
            return startDate != endDate;
          },
          schedulesCannotOverlap: () => {
            const currentRanges = curfew.days.map(day => {
              const dayOffset =
                curfew.startHour > curfew.endHour ||
                  (curfew.startHour == curfew.endHour &&
                    curfew.startMinute > curfew.endMinute)
                  ? 24 * 60
                  : 0;
              return [
                day * 24 * 60 +
                60 * parseInt(curfew.startHour) +
                parseInt(curfew.startMinute),
                day * 24 * 60 +
                60 * parseInt(curfew.endHour) +
                parseInt(curfew.endMinute) +
                dayOffset,
              ];
            });
            const testRanges = target.curfews.slice(0, cIndex).flatMap(test =>
              test.days.map(day => {
                const dayOffset =
                  test.startHour > test.endHour ||
                    (test.startHour == test.endHour &&
                      test.startMinute > test.endMinute)
                    ? 24 * 60
                    : 0;
                return [
                  day * 24 * 60 +
                  60 * parseInt(test.startHour) +
                  parseInt(test.startMinute),
                  day * 24 * 60 +
                  60 * parseInt(test.endHour) +
                  parseInt(test.endMinute) +
                  dayOffset,
                ];
              }),
            );
            if (testRanges.length == 0) {
              return false;
            }
            const match = currentRanges.filter(current => {
              const match = testRanges.filter(
                test =>
                  (test[0] <= current[0] && current[0] <= test[1]) ||
                  (test[0] <= current[1] && current[1] <= test[1]),
              );
              return match.length > 0;
            });
            return match.length > 0;
          },
          selectCurfewTime: () => {
            return curfew.days.length == 0;
          },
          startEndMore: () => {
            const t0 =
              parseInt(curfew.startHour) * 60 + parseInt(curfew.startMinute);
            const t1 =
              parseInt(curfew.endHour) * 60 + parseInt(curfew.endMinute);
            return t1 - t0 + (t0 > t1 ? 1440 : 0) > 720;
          },
          startEndSame: () => {
            return (
              curfew.startHour == curfew.endHour &&
              curfew.startMinute == curfew.endMinute
            );
          },
        },
      },
    });
  });
  const hasErrors =
    Object.keys(alertErrors).length != 0 ||
    curfewErrors.find(cError => Object.keys(cError).length != 0) != undefined;
  const atMaxDays = target.curfews.flatMap(item => item.days).length >= 7;

  const id = testID('CurfewSetting');

  return (
    <CsfFocusedEdit title={t('curfewsLanding:title')}>
      <CsfView edgeInsets standardSpacing>
        <CsfTile>
          <CsfInput
            errors={
              // TODO:AG:20240405 remove translateErrors
              showErrors &&
              translateErrors(
                alertErrors.name,
                t,
                'curfewsSetting:validation.name',
              )
            }
            label={formatLabel({
              rules: { required: { message: '' } },
              name: t('curfewsSetting:nameSetting'),
              label: t('curfewsSetting:nameSetting'),
            })}
            value={target.name}
            maxLength={40}
            onChangeText={text => setTarget({ ...target, name: text })}
            editable={!isLoading}
            testID={id('name')}
          />
          <CsfSelect
            label={t('curfewsSetting:timeZone')}
            value={target.timeZoneId}
            onSelect={value => setTarget({ ...target, timeZoneId: value })}
            options={timeZones}
            testID={id('timeZone')}
          />
        </CsfTile>
        <CsfTile>
          <CsfRuleList testID={id('list')}>
            {target.curfews.map((curfew, cIndex) => {
              const itemTestId = testID(id(`curfew-${cIndex}`));
              return (
                <CsfView
                  key={cIndex}
                  pt={cIndex == 0 ? 0 : 16}
                  pb={24}
                  gap={12}
                  testID={itemTestId()}>
                  {/* mt=4 prevents clipping because CsfInput has negative top margin */}

                  <CsfDatePicker
                    label={t('curfewsSetting:startTime')}
                    mode="time"
                    testID={itemTestId('startTime')}
                    date={getStartDate(curfew)}
                    onChangeDate={date =>
                      setCurfew(
                        {
                          ...curfew,
                          startHour: date
                            .getHours()
                            .toString()
                            .padStart(2, '0'),
                          startMinute: date
                            .getMinutes()
                            .toString()
                            .padStart(2, '0'),
                        },
                        cIndex,
                      )
                    }
                  />

                  <CsfDatePicker
                    label={t('curfewsSetting:endTime')}
                    mode="time"
                    testID={itemTestId('endTime')}
                    date={getEndDate(curfew)}
                    onChangeDate={date =>
                      setCurfew(
                        {
                          ...curfew,
                          endHour: date.getHours().toString().padStart(2, '0'),
                          endMinute: date
                            .getMinutes()
                            .toString()
                            .padStart(2, '0'),
                        },
                        cIndex,
                      )
                    }
                  />

                  <MgaDayPicker
                    canAddDays={!atMaxDays}
                    daysValue={curfew.days}
                    testID={itemTestId('curfewDayPicker')}
                    onChangeDays={days =>
                      setCurfew(
                        {
                          ...curfew,
                          days: days,
                        },
                        cIndex,
                      )
                    }
                  />

                  {cIndex > 0 && (
                    <MgaButton
                      trackingId={itemTestId('delete')}
                      variant="link"
                      icon="Delete"
                      title={t('common:delete')}
                      onPress={() => {
                        setTarget({
                          ...target,
                          curfews: target.curfews.filter((_, i) => cIndex != i),
                        });
                      }}
                    />
                  )}
                </CsfView>
              );
            })}

            {atMaxDays ? (
              <CsfText align="center" testID={id('reachedMaxDays')}>
                {t('curfewsSetting:reachedMaxDays')}
              </CsfText>
            ) : (
              <CsfView pt={32} pb={16}>
                <MgaButton
                  disabled={isLoading}
                  trackingId="AddAdditionalCurfew"
                  title={t('curfewsSetting:addAdditionalCurfew')}
                  variant="secondary"
                  iconPosition="end"
                  onPress={() => {
                    for (const curfewError of curfewErrors) {
                      if (curfewError.days) {
                        if (curfewError.days.includes('selectCurfewTime')) {
                          CsfSimpleAlert(
                            t('common:info'),
                            t(
                              'curfewsSetting:validation.curfews.selectCurfewTime',
                            ),
                            { type: 'information' },
                          );
                          return;
                        }
                      }
                    }
                    setTarget({
                      ...target,
                      curfews: target.curfews.concat([
                        getDefaultValuesCurfew(),
                      ]),
                    });
                  }}
                />
              </CsfView>
            )}
          </CsfRuleList>
        </CsfTile>
        <MgaButton
          title={t('speedAlertSetting:labels.submit')}
          trackingId="CurfewSettingSubmit"
          isLoading={isLoading}
          disabled={isLoading}
          onPress={async () => {
            Keyboard.dismiss();
            setShowErrors(true);
            // This screen shows errors as dialogs rather than inline.
            // Unpacking them here.
            for (const curfewError of curfewErrors) {
              if (curfewError.days) {
                const errorCodes = [
                  'selectCurfewTime',
                  'startEndSame',
                  'startEndMore',
                  'crossesUTCMidnight',
                  'schedulesCannotOverlap',
                ];
                for (const errorCode of errorCodes) {
                  if (curfewError.days.includes(errorCode)) {
                    CsfSimpleAlert(
                      t('common:info'),
                      t(`curfewsSetting:validation.curfews.${errorCode}`),
                      { type: 'information' },
                    );
                    return;
                  }
                }
              }
            }
            if (hasErrors) {
              return;
            }
            setIsLoading(true);
            const response = await curfewAlertSaveAndSend(alerts, index, {
              ...target,
              active: true,
            });
            setIsLoading(false);
            if (response.success) {
              popIfTop(navigation, 'CurfewSetting');
            }
          }}
        />
        <MgaButton
          title={t('common:cancel')}
          trackingId="CurfewSettingCancel"
          variant="link"
          onPress={() => navigation.pop()}
        />
      </CsfView>
    </CsfFocusedEdit>
  );
};

export default MgaCurfewSetting;
