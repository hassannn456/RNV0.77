/* eslint-disable no-void */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useEventsQuery } from '../api/events.api';
import { parseLocalDateTime } from '../utils/dates';

import RNCalendarEvents from 'react-native-calendar-events';
import { EventItemInfo } from '../../@types';
import { testID } from '../components/utils/testID';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaAddress from '../components/MgaAddress';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice, errorNotice } from '../components/notice';
import mgaOpenURL from '../components/utils/linking';

const MgaEvents: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const eventsQuery = useEventsQuery({ vin: vehicle?.vin });
  const events = eventsQuery?.data?.data;

  const addCalendarEvent = async (event: EventItemInfo): Promise<void> => {
    try {
      const dateStart = parseLocalDateTime(event.eventStartDate);
      const dateEnd = parseLocalDateTime(event.eventEndDate);
      const permissions = await RNCalendarEvents.requestPermissions();
      if (permissions !== 'denied') {
        await RNCalendarEvents.saveEvent(event.title, {
          startDate: dateStart.toISOString(),
          endDate: dateEnd.toISOString(),
          description: event.description,
          location: `${event.address1} ${event.address2}, ${event.city} ${event.state} ${event.zip}`,
        });
        successNotice({
          title: t('events:eventAddedToCalendar', { title: event.title }),
        });
      } else {
        errorNotice({ title: t('events:permissionDenied') });
      }
    } catch (_error) {
      CsfSimpleAlert(t('common:notice'), t('events:errorSavingEvent'), {
        type: 'warning',
      });
    }
  };

  const id = testID('Events');

  return (
    <MgaPage title={t('events:title')} bg="background" showVehicleInfoBar>
      <MgaPageContent
        isLoading={eventsQuery.isFetching}
        title={t('events:title')}>
        {events?.map((event, i) => (
          <CsfAccordionList key={i} testID={id(`list-${i}`)}>
            <CsfView bg="dark" height={150}>
              <CsfView
                style={{ position: 'absolute', bottom: 0, right: 0 }}
                p={16}
                pv={8}
                bg={'button'}>
                <CsfText
                  color={'light'}
                  variant="heading"
                  testID={id('eventStartDate')}>
                  {/* TODO:UA:20240229 Implement date parse/format functions */}
                  {event.eventStartDate.month
                    .substring(0, 3)
                    .toUpperCase()}{' '}
                  {event.eventStartDate.dayOfMonth}
                  {' - '}
                  {event.eventEndDate.month.substring(0, 3).toUpperCase()}{' '}
                  {event.eventEndDate.dayOfMonth}
                </CsfText>
              </CsfView>
            </CsfView>
            <MgaAccordionSection
              trackingId={`EventAccordion-${i}`}
              key={event.eventId}
              title={event.title}
              subtitle={`${event.city}, ${event.state}`}
              renderBody={
                <CsfView style={{ padding: 16 }} pv={16} gap={16}>
                  {/* TODO:UA:20240229 Implement date parse/format functions */}
                  <CsfText testID={id('eventDate')}>
                    {t('messageCenterLanding:eventDate', {
                      when: `${event.eventStartDate.month}${' '}${event.eventStartDate.dayOfMonth}${' - '}${event.eventEndDate.month}${' '}${event.eventEndDate.dayOfMonth}`,
                    })}
                  </CsfText>
                  <CsfText testID={id('description')}>
                    {event.description}
                  </CsfText>

                  <MgaAddress
                    address={event.address1}
                    address2={event.address2}
                    city={event.city}
                    state={event.state}
                    zip={event.zip}
                    testID={id('address')}
                  />

                  <MgaButton
                    trackingId="EventsAddToCalendarButton"
                    onPress={async () => {
                      await addCalendarEvent(event);
                    }}
                    title={t('events:addToCalendar')}
                  />
                  {event.url && (
                    <MgaButton
                      trackingId="EventsWebsiteButton"
                      title={t('events:eventWebsite')}
                      onPress={() => {
                        void mgaOpenURL(
                          event.url.startsWith('http:') ||
                            event.url.startsWith('https:')
                            ? event.url
                            : 'https://' + event.url,
                        );
                      }}
                      icon="OutboundLink"
                      iconPosition="end"
                      variant="secondary"
                    />
                  )}
                </CsfView>
              }
            />
          </CsfAccordionList>
        ))}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaEvents;
