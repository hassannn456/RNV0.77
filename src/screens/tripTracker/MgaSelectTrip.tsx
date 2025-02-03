/* eslint-disable eol-last */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Journal,
  JournalEntry,
  TripDetail,
  TripInterval,
} from '../../../@types';
import CsfActivityIndicator from '../../components';
import
CsfSelect,
{
  CsfDropdownItem,
  CsfDropdownProps,
} from '../../components/CsfSelect';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import {
  tripRequestFromTripInterval,
  useRetrieveTripsQuery,
} from '../../api/drivingJournal.api';
import i18n from '../../i18n';
import { convertUnits } from '../../utils/units';
import { formatFullDate } from '../../utils/dates';

export const isCurrentTrip = (trip: TripInterval): boolean => {
  const now = new Date();
  const start = new Date(trip.tripStartDate);
  const stop = new Date(trip.tripStopDate);
  return start <= now && now <= stop;
};

export const getTripDistanceString = (
  object: TripDetail | JournalEntry | TripDetail[] | JournalEntry[],
): string => {
  const { t } = i18n;
  const userUnits = t('units:distance');
  const distance = Array.isArray(object)
    ? object.reduce((sum, o) => {
      const d0 =
        convertUnits(o.startOdometerValue, o.startOdometerUnit, userUnits) ??
        0;
      const d1 =
        convertUnits(o.endOdometerValue, o.endOdometerUnit, userUnits) ?? 0;
      return sum + d1 - d0;
    }, 0)
    : convertUnits(object.endOdometerValue, object.endOdometerUnit, userUnits) -
    convertUnits(
      object.startOdometerValue,
      object.startOdometerUnit,
      userUnits,
    );
  return `${distance.toFixed(1)} ${userUnits}`;
};

export const getTripTimeRange = (detail: TripDetail): string => {
  return `${detail.onlyTimeStart} - ${detail.onlyTimeEnd}`;
};

export const getJournalDateRange = (journal: Journal): string => {
  const entries = journal.journalEntries;
  if (entries.length == 0) return '';
  const startTime = entries
    .map(journal => journal.startTime)
    .reduce((x, y) => (x < y ? x : y));
  const endTime = entries
    .map(journal => journal.endTime)
    .reduce((x, y) => (x > y ? x : y));
  return `${formatFullDate(startTime)} - ${formatFullDate(endTime)}`;
};

const MgaSelectTrip: React.FC<CsfDropdownProps> = props => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const { data, isLoading } = useRetrieveTripsQuery({
    vin: vehicle?.vin ?? '',
  });
  const trips: CsfDropdownItem[] =
    (data?.data
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
                start: formatFullDate(start),
                stop: formatFullDate(stop),
                count: trip.triplogCount,
              }),
            value: JSON.stringify(tripRequestFromTripInterval(trip)),
          }
          : null;
      })
      .filter(trip => trip) as CsfDropdownItem[]) ?? [];
  // If value passed to list is not on list, re-point to first entry
  useEffect(() => {
    if (trips.length == 0) return;
    const index = trips.findIndex(trip => trip.value == props.value);
    if (index != -1) return;
    if (!trips[0].value) return;
    props.onSelect && props.onSelect(trips[0].value);
  }, [props.value, data]);
  return isLoading ? (
    <CsfActivityIndicator />
  ) : (
    <CsfSelect
      label={t('tripLog:selectTrip')}
      trackingId="TripTrackerSelectTrip"
      outsideLabel
      options={trips}
      {...props}
    />
  );
};

export default MgaSelectTrip;