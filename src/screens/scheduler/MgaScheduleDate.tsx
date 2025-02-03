/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAppNavigation, useAppRoute } from '../../Controller';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { usePreferredDealerQuery } from '../../api/account.api';
import { useAppointmentFinderQuery } from '../../api/schedule.api';
import { formatShortDateWithWeekday } from '../../utils/dates';
import { formatPhone } from '../../utils/phone';
import { scheduleWindowLength } from './MgaChooseService';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import MgaDealerInfo from './MgaDealerInfo';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfTile from '../../components/CsfTile';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfListItem from '../../components/CsfListItem';
import MgaButton from '../../components/MgaButton';
import { MgaPhoneNumber } from '../../components/CsfPhoneNumber';

const getHalfDay = (date: string): string => {
  const d = new Date(date);
  return date.substring(0, 10) + (d.getHours() < 12 ? 'A' : 'P');
};

const MgaScheduleDate: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ScheduleDate'>();
  const vehicle = useCurrentVehicle();
  const dealerResponse = usePreferredDealerQuery({ vin: vehicle?.vin ?? '' });
  const finderResponse = useAppointmentFinderQuery(route.params);
  const preferredDealer = dealerResponse.data?.data?.preferredDealer;
  const dealerServicePhone =
    preferredDealer?.servicePhoneNumber ?? preferredDealer?.phoneNumber;
  const availableAppointments =
    finderResponse?.data?.data?.availableAppointments ?? [];
  const availableAppointmentDates = availableAppointments.map(
    a => a.appointmentDateTimeLocal,
  );
  const availableTimeSlots = availableAppointmentDates
    .map(getHalfDay)
    .filter((v, i, a) => a.indexOf(v) === i);
  const firstDate = availableAppointmentDates.reduce(
    (x, y) => (x < y ? x : y),
    '999',
  );
  const date = new Date(firstDate);
  const dates = [...Array(scheduleWindowLength).keys()].map(() => {
    date.setDate(date.getDate() + 1);
    return date.toISOString().substring(0, 10);
  });
  const onSelect = (timeSlot: string) => {
    const availableTimeSlots = availableAppointments.filter(
      a => getHalfDay(a.appointmentDateTimeLocal) === timeSlot,
    );
    if (availableTimeSlots.length == 0) return;
    navigation.push('ScheduleTime', {
      ...route.params,
      availableTimeSlots: availableTimeSlots,
    });
  };

  const id = testID('ScheduleDate');
  return (
    <MgaPage showVehicleInfoBar title={t('common:service')}>
      <MgaPageContent
        title={t('scheduleTime:scheduleServiceWith')}
        isLoading={finderResponse.isLoading}>
        <MgaDealerInfo dealer={preferredDealer} />
        {availableAppointments.length == 0 ? (
          <CsfView>
            <CsfText testID={id('noOnlineAppointments')}>
              {t('scheduleTime:noOnlineAppointments', {
                servicePhone: formatPhone(dealerServicePhone),
              })}
            </CsfText>
          </CsfView>
        ) : (
          <>
            <CsfTile isLoading={finderResponse.isLoading}>
              <CsfRuleList>
                {dates.map((date, i) => {
                  const hasAM = availableTimeSlots.includes(date + 'A');
                  const hasPM = availableTimeSlots.includes(date + 'P');
                  return (
                    <CsfListItem
                      ph={0}
                      key={date}
                      title={formatShortDateWithWeekday(date, {
                        timeZone: 'UTC',
                      })}
                      titleTextVariant="subheading"
                      action={
                        <CsfView
                          flexDirection="row"
                          justify="space-between"
                          align="center"
                          gap={12}>
                          <MgaButton
                            trackingId={`ScheduleAppointmentAM-${i}`}
                            bg={hasAM ? 'button' : 'disabled'}
                            title="AM"
                            onPress={() => onSelect(date + 'A')}
                            variant="inlineLink"
                          />
                          <MgaButton
                            trackingId={`ScheduleAppointmentPM-${i}`}
                            bg={hasPM ? 'button' : 'disabled'}
                            title="PM"
                            onPress={() => onSelect(date + 'P')}
                            variant="inlineLink"
                          />
                        </CsfView>
                      }>
                      {/* Non-standard date format but day of week matters for scheduling */}
                    </CsfListItem>
                  );
                })}
              </CsfRuleList>
            </CsfTile>

            <CsfText align="center" testID={id('endOfAppointmentLookup')}>
              {`${t('scheduleTime:endOfAppointmentLookup')} `}
            </CsfText>
            {dealerServicePhone && (
              <MgaPhoneNumber
                trackingId="DealerServicePhone"
                variant="inlineLink"
                phone={dealerServicePhone}
              />
            )}
          </>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaScheduleDate;
