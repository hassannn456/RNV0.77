/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller';
import { useTranslation } from 'react-i18next';
import { getTripDistanceString, getTripTimeRange } from './MgaSelectTrip';
import { formatFullDate } from '../../utils/dates';
import {
  deleteTripLog,
  usePositionDataQuery,
} from '../../api/drivingJournal.api';
import { convertUnits } from '../../utils/units';
import {
  TomTomSearchResponse,
  tomTomGetAddressForLatLng,
} from '../../features/geolocation/tomtom.api';
import { LocateResponseData } from '../../../@types';
import { testID } from '../../components/utils/testID';
import { CsfTextProps, CsfColorPalette, MgaMarker } from '../../components';
import CsfRule from '../../components/CsfRule';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import { CsfWindowShade } from '../../components/CsfWindowShade';
import MgaButton from '../../components/MgaButton';
import MgaMarkerMap from '../../components/MgaMarkerMap';
import MgaPage from '../../components/MgaPage';
import { useCsfColors } from '../../components/useCsfColors';

const startMarker = 'A';
const endMarker = 'B';

export const formatAddressForTrips = (
  response: TomTomSearchResponse | null,
): string => {
  if (!response) { return ''; }
  if (!response.addresses) { return ''; }
  if (response.addresses.length == 0) { return ''; }
  const {
    streetNumber,
    streetName,
    municipality,
    countrySubdivision,
    postalCode,
  } = response.addresses[0].address;
  if (!streetNumber) { return ''; }
  if (!streetName) { return ''; }
  if (!municipality) { return ''; }
  if (!countrySubdivision) { return ''; }
  if (!postalCode) { return ''; }
  return `${streetNumber} ${streetName},\n${municipality}, ${countrySubdivision} ${postalCode}`;
};

export const MgaTripMarkerText: React.FC<
  CsfTextProps & { bg?: keyof CsfColorPalette | undefined }
> = ({ bg, ...textProps }) => {
  return (
    <CsfView
      bg={bg ?? 'button'}
      align="center"
      justify="center"
      borderRadius={16}
      width={32}
      height={32}>
      <CsfText variant="bold" color="light" {...textProps}></CsfText>
    </CsfView>
  );
};

const MgaTripTrackerDetailSheet: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const navigation = useAppNavigation();
  const route = useAppRoute<'TripTrackerDetailSheet'>();
  const { tripLog, tripRange } = route.params;
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const { data } = usePositionDataQuery({
    tripLogDataId: tripLog.tripLogDataId,
  });
  useEffect(() => {
    if (tripLog?.startLatitude && tripLog?.startLongitude) {
      // Use LatLng while waiting for TomTom response
      setStartAddress(`(${tripLog.startLatitude}, ${tripLog.startLongitude})`);
      setEndAddress(`(${tripLog.endLatitude}, ${tripLog.endLongitude})`);
      // Reverse geocode call
      tomTomGetAddressForLatLng(tripLog.startLatitude, tripLog.startLongitude)
        .then(response => {
          const address = formatAddressForTrips(response);
          if (address) {
            setStartAddress(address);
          }
        })
        .catch(console.error);
      tomTomGetAddressForLatLng(tripLog.endLatitude, tripLog.endLongitude)
        .then(response => {
          const address = formatAddressForTrips(response);
          if (address) {
            setEndAddress(address);
          }
        })
        .catch(console.error);
    }
  }, []);
  const tripTitle = formatFullDate(tripLog.startTime);
  const userUnits = t('units:distance');
  const routePoints: LocateResponseData[] = (() => {
    const positionData = data?.data?.positionData;
    if (!positionData) { return []; }
    return typeof positionData == 'string'
      ? (JSON.parse(positionData) as LocateResponseData[])
      : positionData;
  })();
  const markers: MgaMarker[] = tripLog
    ? [
      {
        latitude: tripLog.startLatitude,
        longitude: tripLog.startLongitude,
        symbolBackgroundColor: colors.success,
        symbolText: startMarker,
      },
      {
        latitude: tripLog.endLatitude,
        longitude: tripLog.endLongitude,
        symbolBackgroundColor: colors.error,
        symbolText: endMarker,
      },
    ]
    : [];

  const id = testID('TripTrackerDetailSheet');
  return (
    <MgaPage
      noScroll
      stickyFooter={() => {
        return (
          <CsfWindowShade
            title={() => (
              <CsfView
                flexDirection="row"
                align="center"
                justify="space-between"
                width="100%"
                ph={8}>
                <CsfText
                  variant="heading"
                  color="copyPrimary"
                  testID={id('tripTitle')}>
                  {tripTitle}
                </CsfText>
                <CsfView align="flex-end">
                  <CsfText
                    variant="body2"
                    color="copyPrimary"
                    testID={id('tripTimeRange')}>
                    {getTripTimeRange(tripLog)}
                  </CsfText>
                  <CsfText
                    variant="body2"
                    color="copyPrimary"
                    testID={id('tripDistance')}>
                    {getTripDistanceString(tripLog)}
                  </CsfText>
                </CsfView>
              </CsfView>
            )}>
            <CsfView standardSpacing ph={8}>
              <CsfView
                gap={4}
                flexDirection="row"
                align="center"
                justify="flex-start">
                <MgaTripMarkerText bg="success" testID={id('startMarker')}>
                  {startMarker}
                </MgaTripMarkerText>
                <CsfText testID={id('startAddress')}>{startAddress}</CsfText>
              </CsfView>
              <CsfView
                gap={4}
                flexDirection="row"
                align="center"
                justify="flex-start">
                <MgaTripMarkerText bg="error" testID={id('endMarker')}>
                  {endMarker}
                </MgaTripMarkerText>
                <CsfText testID={id('endAddress')}>{endAddress}</CsfText>
              </CsfView>
              <CsfView flexDirection="row" justify="space-between">
                <CsfText testID={id('odometerStart')}>
                  {t('tripTrackerLanding:odometerStart')}
                </CsfText>
                <CsfText variant="bold" testID={id('odometerValue')}>
                  {convertUnits(
                    tripLog.startOdometerValue,
                    tripLog.startOdometerUnit,
                    userUnits,
                  )?.toFixed(1)}
                </CsfText>
              </CsfView>
              <CsfView flexDirection="row" justify="space-between">
                <CsfText testID={id('odometerEnd')}>
                  {t('tripTrackerLanding:odometerEnd')}
                </CsfText>
                <CsfText variant="bold" testID={id('odometerEndValue')}>
                  {convertUnits(
                    tripLog.endOdometerValue,
                    tripLog.endOdometerUnit,
                    userUnits,
                  )?.toFixed(1)}
                </CsfText>
              </CsfView>
              <CsfRule />
              <MgaButton
                icon="Delete"
                title={t('tripLog:deleteTripLog')}
                variant="link"
                trackingId="TripTrackerDeleteTripLog"
                onPress={async () => {
                  const response = await deleteTripLog(tripLog, tripRange);
                  if (response.success) {
                    popIfTop(navigation, 'TripTrackerDetailSheet');
                  }
                }}
              />
            </CsfView>
          </CsfWindowShade>
        );
      }}
      title={tripTitle}>
      <CsfView flex={1}>
        <MgaMarkerMap
          route={routePoints}
          markers={markers}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 0,
          }}
          testID={id('routePoints')}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaTripTrackerDetailSheet
