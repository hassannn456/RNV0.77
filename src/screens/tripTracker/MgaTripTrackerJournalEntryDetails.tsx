/* eslint-disable eol-last */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller';
import { useTranslation } from 'react-i18next';
import {
  JournalEntry,
  JournalEntryTripEntryData,
  LocateResponseData,
} from '../../../@types';
import { formatFullDate, formatShortTime } from '../../utils/dates';
import { getTripDistanceString } from './MgaSelectTrip';
import { tomTomGetAddressForLatLng } from '../../features/geolocation/tomtom.api';
import {
  MgaTripMarkerText,
  formatAddressForTrips,
} from './MgaTripTrackerDetailSheet';
import { convertUnits } from '../../utils/units';
import {
  deleteEntryFromJournal,
  deleteJournal,
  drivingJournalApi,
  useJournalQuery,
} from '../../api/drivingJournal.api';
import { promptTripTrackingEditAddress } from './MgaTripTrackerEditAddress';
import { store } from '../../store';
import { testID } from '../../components/utils/testID';
import { MgaMarker } from '../../components';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import CsfRule from '../../components/CsfRule';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import { CsfWindowShade } from '../../components/CsfWindowShade';
import MgaButton from '../../components/MgaButton';
import MgaMarkerMap from '../../components/MgaMarkerMap';
import MgaPage from '../../components/MgaPage';
import { successNotice, errorNotice } from '../../components/notice';
import { useCsfColors } from '../../components/useCsfColors';

const MgaTripTrackerJournalEntryDetails: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const navigation = useAppNavigation();
  const route = useAppRoute<'TripTrackerJournalEntryDetails'>();
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const { journal, journalEntries } = useJournalQuery(route.params.journalId);
  const [journalEntryIndex, setJournalEntryIndex] = useState(
    journalEntries.findIndex(
      je => je.journalEntryId == route.params.journalEntryId,
    ),
  );
  const journalEntry =
    journalEntryIndex >= 0 ? journalEntries[journalEntryIndex] : null;
  const routePoints: LocateResponseData[] = (() => {
    if (!journalEntry) return [];
    const positionData = journalEntry.positionData;
    if (!positionData) return [];
    return typeof positionData === 'string'
      ? (JSON.parse(positionData) as LocateResponseData[])
      : positionData;
  })();
  const [start, end] = (() => {
    if (routePoints && routePoints.length > 1) {
      return [routePoints[0], routePoints[routePoints.length - 1]];
    } else {
      return [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0 },
      ];
    }
  })();
  const updateJournalEntry = async (journalEntry: Partial<JournalEntry>) => {
    const request =
      drivingJournalApi.endpoints.updateJournalEntry.initiate(journalEntry);
    const response = await store.dispatch(request).unwrap();
    if (response.success) {
      const refreshRequest =
        drivingJournalApi.endpoints.retrieveAllJournals.initiate(undefined);
      void store.dispatch(refreshRequest);
      successNotice({
        title: t('tripTrackerLanding:editAddressSuccess'),
      });
    } else {
      errorNotice({
        title: t('tripTrackerLanding:editAddressFailure'),
      });
    }
  };
  useEffect(() => {
    const tripEntryData = journalEntry?.tripEntryData
      ? typeof journalEntry.tripEntryData === 'string'
        ? (JSON.parse(journalEntry.tripEntryData) as JournalEntryTripEntryData)
        : journalEntry.tripEntryData
      : {};
    if (tripEntryData.startName) {
      setStartAddress(tripEntryData.startName);
    } else if (start.latitude && start.longitude) {
      // Reverse geocode call
      tomTomGetAddressForLatLng(start.latitude, start.longitude)
        .then(response => {
          const address = formatAddressForTrips(response);
          if (address) {
            setStartAddress(address);
          }
        })
        .catch(error => {
          // Use LatLng if TomTom fails
          setStartAddress(`(${start.latitude}, ${start.longitude})`);
          console.error(error);
        });
    }
    if (tripEntryData.endName) {
      setEndAddress(tripEntryData.endName);
    } else if (end.latitude && end.longitude) {
      // Reverse geocode call
      tomTomGetAddressForLatLng(end.latitude, end.longitude)
        .then(response => {
          const address = formatAddressForTrips(response);
          if (address) {
            setEndAddress(address);
          }
        })
        .catch(error => {
          // Use LatLng if TomTom fails
          setEndAddress(`(${end.latitude}, ${end.longitude})`);
          console.error(error);
        });
    }
  }, [journalEntry]);
  const startMarker = String(journalEntryIndex * 2 + 1);
  const endMarker = String(journalEntryIndex * 2 + 2);
  const markers: MgaMarker[] = [
    {
      latitude: start.latitude,
      longitude: start.longitude,
      symbolBackgroundColor: colors.success,
      symbolText: startMarker,
    },
    {
      latitude: end.latitude,
      longitude: end.longitude,
      symbolBackgroundColor: colors.error,
      symbolText: endMarker,
    },
  ];
  const title = formatFullDate(journalEntry?.startTime);
  const userUnits = t('units:distance');
  const id = testID('TripTrackerJournalEntryDetails');
  return (
    <MgaPage
      noScroll
      stickyFooter={() => {
        return (
          <CsfWindowShade
            title={() => {
              if (!journalEntry) {
                return (
                  <CsfView p={8}>
                    <CsfActivityIndicator />
                  </CsfView>
                );
              }
              return (
                <CsfView
                  flexDirection="row"
                  align="center"
                  justify="space-between"
                  width="100%"
                  ph={8}>
                  <CsfText
                    variant="heading"
                    color="copyPrimary"
                    testID={id('title')}>
                    {title}
                  </CsfText>
                  <CsfView align="flex-end">
                    <CsfText
                      variant="body2"
                      color="copyPrimary"
                      testID={id('entryTime')}>
                      {`${formatShortTime(
                        journalEntry.startTime,
                      )} - ${formatShortTime(journalEntry.endTime)}`}
                    </CsfText>
                    <CsfText
                      variant="body2"
                      color="copyPrimary"
                      testID={id('tripDistance')}>
                      {getTripDistanceString(journalEntry)}
                    </CsfText>
                  </CsfView>
                </CsfView>
              );
            }}>
            <CsfView standardSpacing p={8} pv={12}>
              <CsfView flexDirection="row" justify="space-between">
                <CsfView gap={4} flexDirection="row" align="center">
                  <MgaTripMarkerText bg="success" testID={id('startMarker')}>
                    {startMarker}
                  </MgaTripMarkerText>
                  <CsfText selectable={true} testID={id('startAddress')}>
                    {startAddress}
                  </CsfText>
                </CsfView>
                <MgaButton
                  trackingId="JournalEntryDetailsEdit"
                  aria-label={t('common:edit')}
                  icon="Edit"
                  variant="link"
                  onPress={async () => {
                    if (!journalEntry) { return; }
                    const newAddress = await promptTripTrackingEditAddress({
                      currentAddress: startAddress,
                    });
                    if (newAddress) {
                      void updateJournalEntry({
                        journalId: journalEntry.journalId,
                        journalEntryId: journalEntry.journalEntryId,
                        tripEntryData: JSON.stringify({
                          startName: newAddress,
                          endName: endAddress,
                        }),
                      });
                    }
                  }}
                />
              </CsfView>
              <CsfView flexDirection="row" justify="space-between">
                <CsfView gap={4} flexDirection="row" align="center">
                  <MgaTripMarkerText bg="error" testID={id('endMarker')}>
                    {endMarker}
                  </MgaTripMarkerText>
                  <CsfText selectable={true} testID={id('endAddress')}>
                    {endAddress}
                  </CsfText>
                </CsfView>
                <MgaButton
                  trackingId="TripTrackerJournalEditAddress"
                  aria-label={t('common:edit')}
                  icon="Edit"
                  variant="link"
                  onPress={async () => {
                    if (!journalEntry) { return; }
                    const newAddress = await promptTripTrackingEditAddress({
                      currentAddress: endAddress,
                    });
                    if (newAddress) {
                      void updateJournalEntry({
                        journalId: journalEntry.journalId,
                        journalEntryId: journalEntry.journalEntryId,
                        tripEntryData: JSON.stringify({
                          startName: startAddress,
                          endName: newAddress,
                        }),
                      });
                    }
                  }}
                />
              </CsfView>
              {journalEntry && (
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText testID={id('odometerStart')}>
                    {t('tripTrackerLanding:odometerStart')}
                  </CsfText>
                  <CsfText variant="bold" testID={id('startOdometerValue')}>
                    {convertUnits(
                      journalEntry.startOdometerValue,
                      journalEntry.startOdometerUnit,
                      userUnits,
                    )?.toFixed(1)}
                  </CsfText>
                </CsfView>
              )}
              {journalEntry && (
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText testID={id('odometerEnd')}>
                    {t('tripTrackerLanding:odometerEnd')}
                  </CsfText>
                  <CsfText variant="bold" testID={id('endOdometerValue')}>
                    {convertUnits(
                      journalEntry.endOdometerValue,
                      journalEntry.endOdometerUnit,
                      userUnits,
                    )?.toFixed(1)}
                  </CsfText>
                </CsfView>
              )}
              {journalEntries.length > 1 && (
                <CsfView
                  align="center"
                  flexDirection="row"
                  justify="space-between">
                  <MgaButton
                    trackingId="TripTrackerJournalEntryGoBack"
                    enabled={journalEntryIndex > 0}
                    icon="BackArrow"
                    variant="link"
                    onPress={() => {
                      if (journalEntryIndex <= 0) { return; }
                      setJournalEntryIndex(journalEntryIndex - 1);
                    }}
                  />
                  <CsfText testID={id('journalEntries')}>
                    {journalEntryIndex + 1} of {journalEntries.length}
                  </CsfText>
                  <MgaButton
                    trackingId="TripTrackerJournalEntryGoForward"
                    enabled={journalEntryIndex < journalEntries.length - 1}
                    icon="ForwardArrow"
                    variant="link"
                    onPress={() => {
                      if (journalEntryIndex >= journalEntries.length - 1) { return; }
                      setJournalEntryIndex(journalEntryIndex + 1);
                    }}
                  />
                </CsfView>
              )}
              <CsfRule />
              <MgaButton
                trackingId="TripTrackerDeleteFromDrivingJournal"
                icon="Delete"
                title={t('tripTrackerLanding:deleteFromDrivingJournal')}
                variant="link"
                onPress={async () => {
                  if (journalEntries.length == 1) {
                    const response = await deleteJournal(journal, {
                      message: t(
                        'tripTrackerLanding:confirmLastJournalEntryDelete',
                        journal,
                      ),
                    });
                    if (response.success) {
                      popIfTop(navigation, 'TripTrackerJournalEntryDetails');
                      popIfTop(navigation, 'TripTrackerJournalDetails');
                    }
                  } else {
                    const response = await deleteEntryFromJournal(
                      journalEntry,
                      journal,
                    );
                    if (response.success) {
                      popIfTop(navigation, 'TripTrackerJournalEntryDetails');
                    }
                  }
                }}
              />
            </CsfView>
          </CsfWindowShade>
        );
      }}
      title={title}>
      <CsfView flex={1}>
        <MgaMarkerMap
          testID={id('routePoints')}
          route={routePoints}
          markers={markers}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 0,
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaTripTrackerJournalEntryDetails;