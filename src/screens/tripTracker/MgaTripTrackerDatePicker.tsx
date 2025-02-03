import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMonthYear } from '../../utils/dates';
import { Dimensions, ViewStyle } from 'react-native';
import {
  navigate,
  popIfTop,
  useAppNavigation,
  useAppRoute,
} from '../../Controller';
import { testID } from '../../components/utils/testID';
import { CsfCardProps } from '../../components';
import CsfCard from '../../components/CsfCard';
import CsfDatePicker from '../../components/CsfDatePicker';
import CsfPressable from '../../components/CsfPressable';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';

interface CsfCalendarViewProps extends CsfCardProps {
  value?: Date
  onChange?: (value: Date) => void
  isChangeAllowed?: (current: Date, newValue: Date) => boolean
}

export const CsfCalendarView: React.FC<CsfCalendarViewProps> = props => {
  const { t } = useTranslation();
  const [month, setMonth] = useState(new Date());
  const [dates, setDates] = useState<Date[][]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  useEffect(() => {
    onMonthChange(month);
  }, []);
  const deviceWidth = Dimensions.get('screen').width;
  const cellSize = Math.floor(deviceWidth / 8);
  const dateStyle: ViewStyle = {
    alignContent: 'center',
    justifyContent: 'center',
    width: cellSize,
    height: cellSize,
  };
  const prevMonth = (() => {
    const value = new Date(month);
    value.setDate(0); // Last day of previous month
    return value;
  })();
  const nextMonth = (() => {
    const value = new Date(month);
    value.setDate(1); // First day
    value.setMonth(month.getMonth() + 1); // Of next month
    return value;
  })();
  const isChangeAllowed = (current: Date, newValue: Date) => {
    if (!props.isChangeAllowed) return true;
    return props.isChangeAllowed(current, newValue);
  };
  const onMonthChange = (month: Date) => {
    const dayMap = [-6, 0, -1, -2, -3, -4, -5]; // JS getDay() is Sunday (0) - Saturday (6)
    const pStart = new Date(month.getFullYear(), month.getMonth(), 1, 12); // First day of current month
    const pDate = new Date(
      pStart.getFullYear(),
      pStart.getMonth(),
      dayMap[pStart.getDay()],
      12,
    ); // First day of week that starts month
    const pEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12); // Last day of current month
    const monthDates: Date[][] = [];
    while (pDate < pEnd) {
      const weekDates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        pDate.setDate(pDate.getDate() + 1);
        weekDates.push(new Date(pDate));
      }
      monthDates.push(weekDates);
    }
    setDates(monthDates);
  };

  const id = testID('CsfCalendarView');
  return (
    <CsfCard>
      <CsfView align="center" flexDirection="row">
        <MgaButton
          trackingId="CalendarViewBack"
          disabled={!isChangeAllowed(month, prevMonth)}
          icon="BackArrow"
          variant="link"
          onPress={() => {
            setMonth(prevMonth);
            onMonthChange(prevMonth);
          }}
        />
        <CsfText
          align="center"
          flex={1}
          variant="subheading"
          testID={id('monthYear')}>
          {formatMonthYear(month)}
        </CsfText>
        <MgaButton
          trackingId="CalendarViewForward"
          disabled={!isChangeAllowed(month, nextMonth)}
          icon="ForwardArrow"
          variant="link"
          onPress={() => {
            setMonth(nextMonth);
            onMonthChange(nextMonth);
          }}
        />
      </CsfView>
      <CsfView align="center" flexDirection="row">
        {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, i) => {
          const itemTestId = testID(id(`day-${i}`));
          return (
            <CsfView key={day} style={dateStyle}>
              <CsfText
                align="center"
                variant="subheading"
                testID={itemTestId()}>
                {t(`common:days.${day}`)}
              </CsfText>
            </CsfView>
          );
        })}
      </CsfView>
      <CsfView>
        {dates.map((week, weekNumber) => (
          <CsfView key={weekNumber} align="center" flexDirection="row">
            {week.map((day, i) => {
              const color =
                day.getMonth() == month.getMonth()
                  ? 'copyPrimary'
                  : 'copySecondary';
              const disabled = !isChangeAllowed(startDate, day);
              const isDateRange = day == startDate || day == endDate;
              // const inDateRange = startDate && endDate && startDate <= day && day <= endDate
              const itemTestId = testID(id(`weekDay-${i}`));
              return (
                <CsfPressable
                  key={day}
                  style={dateStyle}
                  disabled={disabled}
                  testID={itemTestId()}
                  onPress={() => {
                    if (startDate == null) {
                      // Fill start
                      setStartDate(day);
                    } else if (startDate == day) {
                      // Clear start
                      setStartDate(endDate);
                      setEndDate(null);
                    } else if (endDate == null) {
                      // Fill end
                      setEndDate(day);
                    } else if (endDate == day) {
                      // Clear end
                      setEndDate(null);
                    } else {
                      // Move end
                      if (day > startDate) {
                        setEndDate(day);
                      } else {
                        setStartDate(day);
                      }
                    }
                  }}>
                  <CsfView
                    bg={isDateRange ? 'button' : 'backgroundSecondary'}
                    style={[dateStyle, { borderRadius: cellSize / 2 }]}>
                    <CsfText
                      align="center"
                      testID={itemTestId('DayDate')}
                      color={isDateRange ? 'light' : color}>
                      {disabled ? '' : day.getDate()}
                    </CsfText>
                  </CsfView>
                </CsfPressable>
              );
            })}
          </CsfView>
        ))}
      </CsfView>
    </CsfCard>
  );
};

let nid = 0;
let receivers: { id: number; resolver: (value: Date | undefined) => void }[] =
  [];

const send = (id: number | undefined, value: Date | undefined) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

export type MgaTripTrackerDatePickerOptions = {
  id?: number
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  date?: string
}

/** Show alert outside components and capture selected response. */
export const promptTripTrackerDatePicker = async (
  options?: MgaTripTrackerDatePickerOptions,
): Promise<Date | undefined> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('TripTrackerDatePicker', {
      ...options,
      id: nid,
    });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

const MgaTripTrackerDatePicker: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'TripTrackerDatePicker'>();
  const [date, setDate] = useState<Date | undefined>(
    route?.params?.date ? new Date(route?.params?.date) : undefined,
  );

  const minimumDate = (() => {
    const value = new Date();
    value.setUTCHours(0);
    value.setUTCMinutes(0);
    value.setUTCSeconds(0);
    return value;
  })();
  const maximumDate = (() => {
    const value = new Date();
    value.setDate(value.getDate() + 28);
    value.setUTCHours(23);
    value.setUTCMinutes(59);
    value.setUTCSeconds(59);
    return value;
  })();
  const onComplete = (date: Date | undefined) => {
    if (route.params.id) {
      send(route.params.id, date);
      receivers = receivers.filter(r => r.id != route.params.id);
    }
    popIfTop(navigation, 'TripTrackerDatePicker');
  };

  const id = testID('TripTrackerDatePicker');
  return (
    <MgaPage bg="background" focusedEdit title={t('tripLog:tripTracker')}>
      <MgaPageContent
        title={route.params?.title ?? t('tripLog:selectTripEndDate')}>
        <CsfText
          variant="body"
          align="center"
          testID={id('selectTripDateInfo')}>
          {route.params?.message ?? t('tripLog:selectTripDateInfo')}
        </CsfText>
        <CsfDatePicker
          outsideLabel
          label={t('tripLog:tripEndDate')}
          mode="date"
          date={date}
          onChangeDate={newDate => setDate(newDate)}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={id('tripEndDate')}
        />
        <CsfView gap={12}>
          <MgaButton
            trackingId="TripTrackerDatePickerStart"
            disabled={date == undefined}
            variant="primary"
            title={route.params?.confirmLabel ?? t('chargeSchedule:start')}
            onPress={() => onComplete(date)}
          />
          <MgaButton
            trackingId="TripTrackerDatePickerCancel"
            variant="secondary"
            title={t('common:cancel')}
            onPress={() => onComplete(undefined)}
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaTripTrackerDatePicker;