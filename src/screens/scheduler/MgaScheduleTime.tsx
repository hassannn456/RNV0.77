/* eslint-disable react/self-closing-comp */
/* eslint-disable react/jsx-no-undef */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../../Controller';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { usePreferredDealerQuery } from '../../api/account.api';
import {
  formatFullDate,
  formatShortTime,
  formatWeekday,
} from '../../utils/dates';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import MgaDealerInfo from './MgaDealerInfo';
import CsfCard from '../../components/CsfCard';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfListItem from '../../components/CsfListItem';
import MgaButton from '../../components/MgaButton';

const MgaScheduleTime: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ScheduleTime'>();
  const vehicle = useCurrentVehicle();
  const dealerResponse = usePreferredDealerQuery({ vin: vehicle?.vin ?? '' });
  const preferredDealer = dealerResponse.data?.data?.preferredDealer;
  const availableTimeSlots = route.params.availableTimeSlots ?? [];
  const firstTimeSlot = availableTimeSlots[0];
  return (
    <MgaPage showVehicleInfoBar title={t('common:service')}>
      <MgaPageContent title={t('scheduleTime:scheduleServiceWith')}>
        <MgaDealerInfo dealer={preferredDealer} />
        {/* {firstTimeSlot && (
          <CsfView align="center">
            <CsfText bold>
             
            </CsfText>
            <CsfText>}</CsfText>
          </CsfView>
        )} */}
        {availableTimeSlots.length > 0 && (
          <CsfCard
            title={`${formatWeekday(
              firstTimeSlot.appointmentDateTimeLocal,
            )}, ${formatFullDate(firstTimeSlot.appointmentDateTimeLocal)}`}
            subtitle={t('scheduleTime:selectYourPreferredTime')}>
            <CsfRuleList>
              {availableTimeSlots.map((slot, i) => (
                <CsfListItem
                  ph={0}
                  key={slot.appointmentDateTimeUTC}
                  title={formatShortTime(slot.appointmentDateTimeLocal)}
                  titleTextVariant="subheading"
                  action={
                    <MgaButton
                      trackingId={`ScheduleServiceSelectAppointment-${i}`}
                      variant="inlineLink"
                      title={t('common:select')}
                      onPress={() => {
                        navigation.push('ScheduleSummary', {
                          ...route.params,
                          appointmentDateLocal: slot.appointmentDateTimeLocal,
                          appointmentDateUtc: slot.appointmentDateTimeUTC,
                        });
                      }}
                    />
                  }></CsfListItem>
              ))}
            </CsfRuleList>
          </CsfCard>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaScheduleTime;
