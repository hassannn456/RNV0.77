/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-void */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RNCalendarEvents from 'react-native-calendar-events';

import { ScreenList, useAppNavigation, useAppRoute } from '../../Controller';
import { schedulerApi } from '../../api/schedule.api';
import { store, useAppSelector } from '../../store';
import { RetailerLink } from '../../components/MgaRetailerComponents';
import { formatFullDateTime, formatWeekday } from '../../utils/dates';
import { alertNotInDemo } from '../../features/demo/demo.slice';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfCard from '../../components/CsfCard';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaButton from '../../components/MgaButton';
import { errorNotice, successNotice } from '../../components/notice';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import MgaDealerInfo from './MgaDealerInfo';
import promptAlert from '../../components/CsfAlert';
import MgaMarkerMap from '../../components/MgaMarkerMap';

const MgaScheduleConfirm: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ScheduleConfirm'>();
  const isDemo = useAppSelector(s => s.demo);
  const dealer = route.params?.appointment?.dealerInfo;
  const dealerLocation: { latitude: number; longitude: number } | null =
    (() => {
      if (!dealer) return null;
      if (dealer.serviceLatDeg && dealer.serviceLongDeg) {
        return {
          latitude: dealer.serviceLatDeg,
          longitude: dealer.serviceLongDeg,
        };
      } else if (dealer.latDeg && dealer.longDeg) {
        return { latitude: dealer.latDeg, longitude: dealer.longDeg };
      } else {
        return null;
      }
    })();
  const transportTypes = [
    '',
    t('scheduleSummary:dropOffVehicle'),
    t('scheduleSummary:waitAtDealership'),
  ];

  useEffect(() => {
    store.dispatch({
      type: 'preferences/triggerAppReview',
      payload: {
        key: 'appRating',
        value: 'serviceAppointmentCount',
      },
    });
  }, []);

  const id = testID('ScheduleConfirm');
  return (
    <MgaPage title={t('common:service')} showVehicleInfoBar>
      <MgaPageContent title={t('common:confirmation')}>
        <CsfCard align="center">
          <CsfView align="center" pb={8}>
            <CsfText variant="body" testID={id('appointmentConfirmedFor')}>
              {t('scheduleSummary:appointmentConfirmedFor')}
            </CsfText>
            <CsfText bold testID={id('appointmentDateLocal')}>
              {formatWeekday(route.params.appointmentDateLocal)}
              {', '}
              {formatFullDateTime(route.params.appointmentDateLocal)}
            </CsfText>
            <CsfText testID={id('transportType')}>
              {transportTypes[route.params.transportType ?? 0]}
            </CsfText>
          </CsfView>
          <MgaButton
            trackingId="ServiceAddToCalendarButton"
            onPress={async () => {
              if (isDemo) {
                await alertNotInDemo();
                return;
              }
              try {
                const title = t('scheduleSummary:nameServiceAppointment', {
                  dealerName: dealer?.name ?? '',
                });
                const appointmentDateLocal = route.params.appointmentDateLocal
                  ? new Date(route.params.appointmentDateLocal)
                  : null;
                const startDate = appointmentDateLocal?.toISOString() ?? '';
                if (appointmentDateLocal) {
                  appointmentDateLocal.setMinutes(
                    appointmentDateLocal.getMinutes() + 30,
                  );
                }
                const endDate = appointmentDateLocal?.toISOString() ?? '';
                const location = dealer
                  ? `${dealer.serviceAddress}, ${dealer.serviceCity}, ${dealer.serviceState}`
                  : '';
                const permissions = await RNCalendarEvents.requestPermissions();
                if (permissions !== 'denied') {
                  const allCalendarEvents =
                    await RNCalendarEvents.fetchAllEvents(startDate, endDate);
                  const calendarEventExist = allCalendarEvents.find(
                    event =>
                      event.startDate == startDate &&
                      event.endDate == endDate &&
                      event.title == title,
                  );

                  if (calendarEventExist) {
                    successNotice({
                      title: t('events:eventAddedToCalendar', {
                        title,
                      }),
                    });
                  } else {
                    await RNCalendarEvents.saveEvent(title, {
                      startDate,
                      endDate,
                      location,
                    });
                    successNotice({
                      title: t('events:addToCalendar', {
                        title,
                      }),
                    });
                  }
                } else {
                  errorNotice({ title: t('events:permissionDenied') });
                }
              } catch (_error) {
                CsfSimpleAlert(
                  t('common:notice'),
                  t('events:errorSavingEvent'),
                  {
                    type: 'warning',
                  },
                );
              }
            }}
            title={t('events:addToCalendar')}
          />
        </CsfCard>

        <MgaDealerInfo dealer={dealer} />
        <CsfView standardSpacing flexDirection="row">
          {dealer && (
            <RetailerLink dealer={dealer} flex={1} variant="secondary" />
          )}
          {dealerLocation && (
            <MgaButton
              trackingId="ServiceGetDirectionsButton"
              flex={1}
              onPress={async () => {
                if (isDemo) {
                  await alertNotInDemo();
                  return;
                }
                CsfLinkToMapApp(dealerLocation, null, dealer?.name);
              }}
              title={t('common:getDirectionsLink')}
              variant="secondary"
            />
          )}
          <MgaButton
            trackingId="ServiceCancelAppointmentButton"
            flex={1}
            onPress={async () => {
              if (isDemo) {
                await alertNotInDemo();
                return;
              }
              const title: string = t('scheduler:cancelDialogTitle');
              const message: string = t('scheduler:wantToCancelAppointment');
              const yes: string = t('common:yes');
              const no: string = t('common:no');
              const confirmation = await promptAlert(title, message, [
                { title: yes, type: 'primary' },
                { title: no, type: 'secondary' },
              ]);
              if (confirmation != yes) return;
              const request = schedulerApi.endpoints.cancelAppointment.initiate(
                {
                  requestJson: JSON.stringify({
                    ...route.params.appointment,
                    appointmentDateTimeLocalDisplayFormat: undefined,
                    dealerInfo: undefined,
                  }),
                },
              );
              const response = await store.dispatch(request).unwrap();
              if (response.success) {
                const _ok = await promptAlert(
                  t('scheduler:appointmentCancelledDialogTitle'),
                  t('scheduler:appointmentHasBeenCancelled'),
                  [],
                  { type: 'success' },
                );
                const parentPage = route.params?.parentPage;
                if (parentPage) {
                  navigation.navigate(parentPage as keyof ScreenList);
                }
              } else {
                void promptAlert(
                  t('common:error'),
                  response.data?.message ??
                  t('scheduler:unableToCancelAppointment'),
                  // eslint-disable-next-line semi
                )
              }
            }}
            title={t('scheduler:cancelAppointment')}
            variant="secondary"
          />
        </CsfView>
        {dealerLocation && (
          <MgaMarkerMap
            testID={id('dealerLocation')}
            markers={[{ ...dealerLocation }]}
            center={dealerLocation}
            style={{ height: 300 }}
          />
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaScheduleConfirm;