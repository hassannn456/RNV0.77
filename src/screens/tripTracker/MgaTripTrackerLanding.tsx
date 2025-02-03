/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-void */
// cSpell:ignore Tripdata
import React, { useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  deleteJournal,
  deleteTripLog,
  drivingJournalApi,
  tripRequestFromTripInterval,
  useGetExpirationDateQuery,
  useRetrieveAllJournalsQuery,
  useRetrieveTripdataQuery,
  useRetrieveTripsQuery,
} from '../../api/drivingJournal.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { store, useAppSelector } from '../../store';
import {
  Journal,
  TripDetail,
  TripDetailRequest,
  TripInterval,
} from '../../../@types';
import { useAppNavigation } from '../../Controller';
import {
  formatExpirationDate,
  startTrip,
  stopTrip,
} from '../../api/tripLogs.car';
import { useVehicleValetStatusQuery } from '../../api/vehicle.api';
import MgaSelectTrip, {
  getJournalDateRange,
  getTripDistanceString,
  getTripTimeRange,
} from './MgaSelectTrip';
import { promptTripTrackerDatePicker } from './MgaTripTrackerDatePicker';
import { formatFullDate } from '../../utils/dates';
import { alertNotInDemo } from '../../features/demo/demo.slice';
import { testID } from '../../components/utils/testID';
import CsfAccordionList from '../../components/CsfAccordionList';
import CsfAccordionSection from '../../components/CsfAccordionSection';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import promptAlert from '../../components/CsfAlert';
import CsfStatusChip from '../../components/CsfChip';
import CsfListItem from '../../components/CsfListItem';
import { CsfListItemActions } from '../../components/CsfListItemActions';
import CsfRule from '../../components/CsfRule';
import { CsfSegmentTabBar } from '../../components/CsfSegmentTabBar';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';
import MgaJournalIcon from './MgaJournalIcon';

/** MGA-1752: Backend occasionally reports stale data. Use this delay before retrying. */
const serverDelay = 2000;

export const MgaTripLogsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const isDemo = useAppSelector(s => s.demo);
  const vehicleInfo = { vin: vehicle?.vin ?? '' };
  const {
    data: tripsData,
    refetch: tripsRefetch,
    isLoading: isLoadingTrips,
  } = useRetrieveTripsQuery(vehicleInfo);
  const [selectedTrip, setSelectedTrip] = useState('');
  const tripRange = selectedTrip
    ? (JSON.parse(selectedTrip) as TripDetailRequest)
    : { tripStartDate: '', tripStopDate: '' };
  const {
    data: tripData,
    isFetching: isLoadingTripData,
    refetch: tripDataRefetch,
  } = useRetrieveTripdataQuery(tripRange);
  const resultMap = tripData?.data?.resultMap;
  const { data: expirationData, refetch: expirationRefetch } =
    useGetExpirationDateQuery(vehicleInfo);
  const { data: valetStatusData } = useVehicleValetStatusQuery(vehicleInfo);
  const tripActive = expirationData?.data?.active == 't';
  const isCurrentTrip = (trip: TripInterval) => {
    const now = new Date();
    const start = new Date(trip.tripStartDate);
    const stop = new Date(trip.tripStopDate);
    return start <= now && now <= stop;
  };
  const trips =
    tripsData?.data
      ?.map(trip => {
        const start = new Date(trip.tripStartDate);
        const stop = new Date(trip.tripStopDate);
        const count = trip.triplogCount;
        const isCurrent = isCurrentTrip(trip);
        return isCurrent || count > 0
          ? {
            label: isCurrent
              ? t('tripTrackerLanding:currentTrip')
              : t('tripTrackerLanding:tripLogLabel', {
                start: start.toLocaleDateString(),
                stop: stop.toLocaleDateString(),
                count: trip.triplogCount,
              }),
            value: JSON.stringify(tripRequestFromTripInterval(trip)),
          }
          : null;
      })
      .filter(trip => trip) ?? [];
  const valetActive = valetStatusData?.data == 'VAL_ON';
  const startANewTrip = async () => {
    if (isDemo) {
      await alertNotInDemo();
      return;
    }
    const expirationDate = await promptTripTrackerDatePicker();
    if (expirationDate) {
      const expirationDateString = formatExpirationDate(expirationDate);
      const response = await startTrip(expirationDateString);
      if (response.success) {
        void tripsRefetch();
        void tripDataRefetch();
        const refresh = await expirationRefetch().unwrap();
        // MGA-1752: Backend occasionally reports stale data. Retry once if detected.
        if (refresh.data?.active != 't') {
          setTimeout(() => {
            // MGA-2015: Also refetch trip data. This issue appears common on empty data sets.
            void tripsRefetch();
            void tripDataRefetch();
            void expirationRefetch();
          }, serverDelay);
        }
      }
    }
  };
  const editCurrentTrip = async () => {
    const current = tripsData?.data?.find(isCurrentTrip);
    if (!current) { return; }
    const expirationDate = await promptTripTrackerDatePicker({
      title: t('tripLog:selectNewEndDate'),
      message: t('tripLog:tripSetToExpire', {
        date: formatFullDate(current.tripStopDate),
      }),
      confirmLabel: t('common:save'),
      date: current.tripStopDate,
    });
    if (!expirationDate) { return; }
    const expirationDateString = formatExpirationDate(expirationDate);
    const request = drivingJournalApi.endpoints.saveExpirationDate.initiate({
      expirationDate: expirationDateString,
    });
    const response = await store.dispatch(request).unwrap();
    if (response.success) {
      void tripsRefetch();
      void tripDataRefetch();
      void expirationRefetch();
      void promptAlert(
        t('tripTrackerLanding:tripDuration'),
        t('tripTrackerLanding:successfulTripUpdate', {
          start: formatFullDate(current.tripStartDate),
          stop: formatFullDate(expirationDate),
        }),
      );
    } else {
      // TODO:AG:20240502: Cordova has no error handler here. Requirements?
      void promptAlert(t('common:error'), JSON.stringify(response));
    }
  };
  const stopCurrentTrip = async () => {
    const yes: string = t('tripTrackerLanding:stopMyTrip');
    const no: string = t('common:cancel');
    const confirm = await promptAlert(
      t('tripTrackerLanding:stopMyTrip'),
      t('tripTrackerLanding:stopMyTripMessage', {
        date: expirationData?.data?.expireDate,
      }),
      [
        {
          title: yes,
          type: 'primary',
        },
        { title: no, type: 'secondary' },
      ],
    );
    if (confirm == yes) {
      const response = await stopTrip();
      if (response.success) {
        void tripsRefetch();
        void tripDataRefetch();
        const refresh = await expirationRefetch().unwrap();
        // MGA-1752: Backend occasionally reports stale data. Retry once if detected.
        if (refresh.data?.active != 'f') {
          setTimeout(() => {
            // MGA-2015: Also refetch trip data. This issue appears common on empty data sets.
            void tripsRefetch();
            void tripDataRefetch();
            void expirationRefetch();
          }, serverDelay);
        }
      }
    }
  };
  const id = testID('TripLogs');
  return isLoadingTrips ? (
    <CsfView edgeInsets>
      <CsfActivityIndicator />
    </CsfView>
  ) : trips.length == 0 ? (
    <CsfView edgeInsets standardSpacing>
      <CsfText align="center" testID={id('tripWelcome')}>
        {t('tripLog:tripWelcome')}
      </CsfText>
      <CsfView style={{ width: '100%' }} align="center">
        <Image
          style={{ aspectRatio: 1, maxWidth: '100%', borderRadius: 1000 }}
          source={require('../../../content/img/trip-tracker-tutorial.jpg')}
        />
      </CsfView>
      <MgaButton
        trackingId="TripLogsStartNewTrip"
        title={t('tripLog:startNewTrip')}
        onPress={startANewTrip}
      />
    </CsfView>
  ) : (
    <CsfView edgeInsets standardSpacing flex={1}>
      <MgaSelectTrip value={selectedTrip} onSelect={setSelectedTrip} />
      <ScrollView>
        {isLoadingTripData ? (
          <CsfView edgeInsets>
            <CsfActivityIndicator />
          </CsfView>
        ) : resultMap ? (
          Object.keys(resultMap).length > 0 && (
            <CsfAccordionList>
              {Object.keys(resultMap).map(key => {
                const value = resultMap[key] as TripDetail[];
                return (
                  <CsfAccordionSection
                    key={key}
                    title={`${key} (${value.length})`}
                    renderBody={() => (
                      <CsfView>
                        {value.map((detail, i) => {
                          const title = getTripTimeRange(detail);
                          const subtitle = getTripDistanceString(detail);
                          const itemTestId = testID(id(`detail-${i}`));
                          return (
                            <CsfListItem
                              onPress={() =>
                                navigation.push('TripTrackerDetailSheet', {
                                  tripLog: detail,
                                  tripRange: tripRange,
                                })
                              }
                              testID={itemTestId('logListItem')}
                              key={detail.tripLogDataId}
                              title={title}
                              subtitle={subtitle}
                              action={
                                <CsfListItemActions
                                  trackingId={itemTestId('tripLogActions')}
                                  title={title}
                                  options={[
                                    {
                                      label: t('common:view'),
                                      value: 'view',
                                      handleSelect: () =>
                                        navigation.push(
                                          'TripTrackerDetailSheet',
                                          {
                                            tripLog: detail,
                                            tripRange: tripRange,
                                          },
                                        ),
                                    },
                                    {
                                      label: t('common:delete'),
                                      value: 'delete',
                                      variant: 'link',
                                      icon: 'Delete',
                                      handleSelect: async () =>
                                        deleteTripLog(
                                          detail,
                                          selectedTrip
                                            ? JSON.parse(selectedTrip)
                                            : {},
                                        ),
                                    },
                                  ]}
                                />
                              }
                            />
                          );
                        })}
                      </CsfView>
                    )}
                  />
                );
              })}
            </CsfAccordionList>
          )
        ) : (
          <CsfView>
            <CsfText testID={id('noTripLogsFound')}>
              {t('tripTrackerLanding:noTripLogsFound')}
            </CsfText>
          </CsfView>
        )}
      </ScrollView>
      {tripActive ? (
        <CsfView gap={12}>
          <MgaButton
            trackingId="TripTrackerStopCurrentTrip"
            disabled={valetActive}
            title={t('tripLog:stopCurrentTrip')}
            onPress={stopCurrentTrip}
          />
          <MgaButton
            trackingId="TripTrackerEdit"
            variant="secondary"
            disabled={valetActive}
            title={t('common:edit')}
            onPress={editCurrentTrip}
          />
        </CsfView>
      ) : (
        <MgaButton
          trackingId="TripTrackerStartNewTrip"
          title={t('tripLog:startNewTrip')}
          onPress={startANewTrip}
        />
      )}
    </CsfView>
  );
};

export const MgaDrivingJournalsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const isDemo = useAppSelector(s => s.demo);
  const { data: tripsData } = useRetrieveTripsQuery({ vin: vehicle?.vin ?? '' });
  const {
    data: journalData,
    isLoading: journalLoading,
    isFetching: journalFetching,
    refetch: journalRefetch,
  } = useRetrieveAllJournalsQuery(undefined);
  const noTrips = (tripsData?.data ?? []).length == 0;
  // Endpoint returns string (error) or array (data)
  const drivingJournals =
    journalData?.success &&
      journalData.data &&
      typeof journalData.data !== 'string'
      ? journalData.data
      : [];
  const createJournal = () => {
    navigation.push('TripTrackerJournalEditDetails', {});
  };
  const viewJournal = (journal: Journal) => {
    navigation.push('TripTrackerJournalDetails', journal);
  };
  const editJournal = (journal: Journal) => {
    navigation.push('TripTrackerJournalEditDetails', journal);
  };
  const editJournalTrips = (journal: Journal) => {
    navigation.push('TripTrackerJournalEditTripLogs', journal);
  };
  const deleteAllJournals = async () => {
    if (isDemo) {
      await alertNotInDemo();
      return;
    }
    const title = t('tripTrackerLanding:deleteAllDrivingJournal');
    const message = t('tripTrackerLanding:confirmDeleteAllJournal');
    const yes: string = t('common:delete');
    const no: string = t('common:cancel');
    const confirm = await promptAlert(title, message, [
      { title: yes, type: 'primary' },
      { title: no, type: 'secondary' },
    ]);
    if (confirm != yes) {
      return;
    }
    const request =
      drivingJournalApi.endpoints.deleteAllJournals.initiate(undefined);
    const response = await store.dispatch(request).unwrap();
    const _ok = await promptAlert(
      response.success ? t('common:success') : t('common:error'),
      response.data ?? t('tripTrackerLanding:deleteJournalSuccessMsg'),
    );
    void journalRefetch();
  };

  const id = testID('DrivingJournals');
  return (
    <CsfView edgeInsets standardSpacing flex={1}>
      <ScrollView>
        {journalLoading || journalFetching ? (
          <CsfView>
            <CsfActivityIndicator />
          </CsfView>
        ) : (
          <CsfView>
            {drivingJournals.length == 0 ? (
              <CsfView standardSpacing>
                <CsfText
                  align="center"
                  variant="subheading"
                  testID={id('noSavedDrivingJournalsMsg')}>
                  {t('tripTrackerLanding:noSavedDrivingJournalsMsg')}
                </CsfText>
                {noTrips && (
                  <CsfText
                    align="center"
                    variant="subheading"
                    testID={id('noTripLoggedMsg')}>
                    {t('tripTrackerLanding:noTripLoggedMsg')}
                  </CsfText>
                )}
              </CsfView>
            ) : (
              <CsfView standardSpacing>
                <CsfAccordionList>
                  {(drivingJournals ?? []).map((journal, i) => {
                    const itemTestId = testID(id(`journal-${i}`));
                    return (
                      <CsfListItem
                        onPress={() => viewJournal(journal)}
                        icon={<MgaJournalIcon journal={journal} />}
                        title={journal.journalName}
                        testID={itemTestId()}
                        subtitle={(() => {
                          return (
                            <CsfView>
                              <CsfText
                                testID={itemTestId('journalDescription')}>
                                {journal.journalDescription}
                              </CsfText>
                              <CsfText
                                bold
                                testID={itemTestId('journalDateRange')}>
                                {getJournalDateRange(journal)}
                              </CsfText>
                            </CsfView>
                          );
                        })()}
                        action={
                          <CsfListItemActions
                            trackingId={itemTestId('DrivingJournalActions')}
                            title={journal.journalName}
                            options={[
                              {
                                label: t('common:view'),
                                value: 'view',
                                handleSelect: () => viewJournal(journal),
                              },
                              {
                                label: t('tripTrackerLanding:editDetails'),
                                value: 'editMetadata',
                                variant: 'secondary',
                                handleSelect: () => editJournal(journal),
                              },
                              {
                                label: t('tripLogAddJournal:selectTripsTitle'),
                                value: 'selectTripLogs',
                                variant: 'secondary',
                                handleSelect: () => editJournalTrips(journal),
                              },
                              {
                                label: t('common:delete'),
                                value: 'delete',
                                icon: 'Delete',
                                variant: 'link',
                                handleSelect: () => void deleteJournal(journal),
                              },
                            ]}
                          />
                        }
                        key={journal.journalId}
                      />
                    );
                  })}
                </CsfAccordionList>
                <CsfRule />
                <MgaButton
                  trackingId="DeleteAllDrivingJournal"
                  icon="Delete"
                  title={t('tripTrackerLanding:deleteAllDrivingJournal')}
                  variant="link"
                  onPress={() => void deleteAllJournals()}
                />
              </CsfView>
            )}
          </CsfView>
        )}
      </ScrollView>
      {drivingJournals.length < 10 ? (
        <MgaButton
          trackingId="CreateNewDrivingJournal"
          disabled={noTrips}
          title={t('tripTrackerLanding:createNewDrivingJournal')}
          onPress={createJournal}
        />
      ) : (
        <CsfText align="center" testID={id('max10DrivingJournals')}>
          {t('tripTrackerLanding:max10DrivingJournals')}
        </CsfText>
      )}
    </CsfView>
  );
};

export const MgaTripTrackerLanding: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('tripLogs');
  const vehicle = useCurrentVehicle();
  const vehicleInfo = { vin: vehicle?.vin };
  const { data: valetStatusData } = useVehicleValetStatusQuery(vehicleInfo);
  const valetActive = valetStatusData?.data == 'VAL_ON';
  const { data: expirationData } = useGetExpirationDateQuery(vehicleInfo);
  const tripActive = expirationData?.data?.active == 't';

  const id = testID('TripTrackerLanding');
  return (
    <MgaPage
      bg="background"
      noScroll
      showVehicleInfoBar
      title={t('tripLog:tripTracker')}>
      <CsfView align="center" pt={24} p={0} gap={16} bg="backgroundSecondary">
        <CsfView flexDirection="row" gap={12}>
          <CsfText variant="title2" align="center" testID={id('tripTracker')}>
            {t('tripLog:tripTracker')}
          </CsfText>
          {tripActive && (
            <CsfStatusChip
              icon={valetActive ? 'Pause' : undefined}
              label={t(valetActive ? 'tripLog:tripPaused' : 'common:active')}
              active={!valetActive}
              testID={id('tripStatus')}
            />
          )}
        </CsfView>
        {tripActive && valetActive && (
          <CsfView ph={16}>
            <CsfText
              align="center"
              color={'copySecondary'}
              testID={id('tripPausedWhenValetModeActive')}>
              {t('tripLog:tripPausedWhenValetModeActive')}
            </CsfText>
          </CsfView>
        )}
        <CsfSegmentTabBar
          options={[
            { label: t('tripTrackerLanding:tripLogs'), value: 'tripLogs' },
            {
              label: t('tripTrackerLanding:drivingJournals'),
              value: 'drivingJournals',
            },
          ]}
          value={tab}
          testID={id('journalLogTab')}
          onSelect={setTab}
        />
      </CsfView>
      {tab == 'tripLogs' && <MgaTripLogsTab />}
      {tab == 'drivingJournals' && <MgaDrivingJournalsTab />}
    </MgaPage>
  );
};
