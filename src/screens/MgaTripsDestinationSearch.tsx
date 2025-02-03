/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-shadow */
// cSpell:ignore POIS
import React, { useState, useEffect, useRef } from 'react';
import { GestureResponderEvent, ScrollView } from 'react-native';
import {
  CreateTripResponse,
  POIRequest,
  POIResponse,
  POIcategory,
  TripDestinationResult,
  TripsDestinationScreenMode,
} from '../../@types';
import { useTranslation } from 'react-i18next';
import { CsfColorPalette, useCsfColors } from '../components/useCsfColors';
import {
  CustomerProfileResponse,
  contactApi,
} from '../features/profile/contact/contactApi';
import { store } from '../store';
import { ScreenList, useAppRoute } from '../Controller';
import { useAppNavigation } from '../Controller';
import { validate } from '../utils/validate';
import {
  Coordinates,
  TomTomSearchResult,
  tomTomStructuredGeocodeSearch,
} from '../features/geolocation/tomtom.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  tripsApi,
  useRetrieveFavoritePOIsQuery,
  useRetrieveAllTripsQuery,
  sendPOIToVehicle,
  RemoteSendPOIToVehicleRequest,
} from '../api/trips.api';
import { pingCurrentLocation } from '../features/geolocation/geolocation.slice';
import MgaLocationSelect, { FilterItem } from '../components/MgaLocationSelect';
import {
  metersToMiles,
  numericIndexToUpperCaseLetter,
} from '../utils/conversion';
import { parseName, parseZip } from '../utils/tomtom';
import { MAX_TRIP_COUNT } from './MgaSavedTrips';
import { testID } from '../components/utils/testID';
import { cNetworkError } from '../api';
import { MgaMarkerMapRef, MgaMarker, CsfWindowShadeRef } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import CsfModal from '../components/CsfModal';
import CsfPressable from '../components/CsfPressable';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTextInput from '../components/CsfTextInput';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import { CsfWindowShade } from '../components/CsfWindowShade';
import MgaButton from '../components/MgaButton';
import MgaMarkerMap from '../components/MgaMarkerMap';
import MgaPage from '../components/MgaPage';
import { successNotice, errorNotice } from '../components/notice';
import MgaTripNotFound from './MgaTripNotFound';

export interface TripsDestinationRouteParams {
  trip?: CreateTripResponse
  destination?: TripDestinationResult
  mode?: TripsDestinationScreenMode
}

const primaryPOICategories: Array<POIcategory | null | undefined> = [
  'WORK',
  'HOME',
  'DEALER',
];
const MAX_DESTINATION_COUNT = 5;
const FAV_ZOOM_LEVEL = 12;

const formatResults = (
  resultItems: TomTomSearchResult[],
): TripDestinationResult[] => {
  return resultItems
    .map(item => {
      const { address } = item;
      return {
        id: item.id,
        name: parseName(item),
        zip: parseZip(item) || '',
        freeformAddress: address.freeformAddress,
        streetNumber: address.streetNumber,
        streetName: address.streetName,
        city:
          address.localName != undefined
            ? address.localName
            : address.municipality,
        state: address.countrySubdivision,
        distance: metersToMiles(item.dist),
        position: item.position,
      };
    })
    .sort((a, b) => Number(a.distance) - Number(b.distance));
};

/**
 * typecast utility to work with POI data
 * and receive Trip Destination Result data
 */
export const poiToDestinationData = (
  POI: POIResponse,
): TripDestinationResult => {
  return {
    poiId: POI.poiId || null,
    mysPoiCategory: POI.mysPoiCategory || null,
    mysPoiName: POI.mysPoiName || null,
    name: POI.mysPoiName,
    zip: String(POI.zip),
    freeformAddress: POI.formattedAddress,
    streetNumber: POI.streetNumber == null ? null : String(POI.streetNumber),
    streetName: POI.street,
    city: POI.city,
    state: POI.state,
    distance: POI.distanceText,
    position: { lat: POI.latitude, lon: POI.longitude },
  };
};

export const tripDestinationToPoi = (
  destination: TripDestinationResult,
  category?: POIcategory,
): POIRequest => {
  return {
    tripPoiId: null,
    poiId: destination.poiId || null,
    mysPoiName: destination.mysPoiName || null,
    mysPoiCategory: category || destination.mysPoiCategory || null,
    displayName: `${destination.name}, ${destination.freeformAddress}`,
    distanceText: destination.distance,
    name: destination.name,
    latitude: destination.position.lat,
    longitude: destination.position.lon,
    formattedAddress: destination.freeformAddress,
    streetNumber: Number(destination.streetNumber),
    street: destination.streetName,
    city: destination.city,
    state: destination.state,
    zip: destination.zip,
  };
};

type MgaDestinationItemProps = TripDestinationResult & {
  title: string
  index: number
  onClose: (event: GestureResponderEvent) => void
  testID?: string
}

const MgaDestinationItem: React.FC<MgaDestinationItemProps> = (
  props: MgaDestinationItemProps,
) => {
  const { colors } = useCsfColors();
  const { title, index, onClose } = props;
  return (
    <CsfListItem
      title={title}
      titleTextVariant="body2"
      icon={
        <CsfView
          flexDirection="row"
          justify="center"
          align="center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 32 / 2,
            backgroundColor: colors.button,
          }}>
          <CsfText
            variant="body"
            color="light"
            align="center"
            testID={props.testID}>
            {numericIndexToUpperCaseLetter(index)}
          </CsfText>
        </CsfView>
      }
      action={
        <CsfView flexDirection="row" gap={8}>
          <CsfPressable onPress={onClose}>
            <CsfAppIcon size="md" color="dark" icon="Close" />
          </CsfPressable>
        </CsfView>
      }
    />
  );
};

const MgaTripsDestinationSearch: React.FC = () => {
  const { colors } = useCsfColors();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const route = useAppRoute<'TripsDestinationSearch'>();
  const navigation = useAppNavigation();
  const routeParams: TripsDestinationRouteParams = route?.params;
  const mapRef = useRef<MgaMarkerMapRef>(null);
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const { data: existingFavoritePOIs } = useRetrieveFavoritePOIsQuery(vParams);
  const { data: allTrips } = useRetrieveAllTripsQuery(vParams);

  /**
   * a Trip was passed to the screen via route params
   */
  let existingTripName: string | null = null;
  let existingTripID: number | null = null;
  let existingTripPois:
    | {
      tripPoiId: number
      sortOrder: number
      poi: POIResponse
    }[]
    | null = null;
  let initialMarkers: MgaMarker[] = [];
  if (!!routeParams && routeParams.trip) {
    existingTripName = routeParams.trip.name;
    existingTripID = routeParams.trip.tripId;
    existingTripPois = routeParams.trip.pois;
    initialMarkers = existingTripPois.map(item => ({
      latitude: item.poi.latitude,
      longitude: item.poi.longitude,
      // `sortOrder` property is 1-indexed.
      symbolText: numericIndexToUpperCaseLetter(item.sortOrder - 1),
      id: item.poi.poiId,
      type: 'destination',
    }));
  }
  const initialTripID = existingTripID || null;
  const initialPois = existingTripPois || [];
  const initialTripName = existingTripName || '';
  const initialDestinations: TripDestinationResult[] = initialPois
    .map(obj => obj.poi)
    .map(poiToDestinationData);

  /**
   * a Destination was passed to the screen via route params (i.e: viewing a Favorite destination)
   */
  let existingDestination: TripDestinationResult | null = null;
  let initialCoordinate: Coordinates = { latitude: 0, longitude: 0 };
  if (!!routeParams && routeParams.destination) {
    existingDestination = routeParams.destination;
    const { position } = existingDestination;
    initialCoordinate = { latitude: position.lat, longitude: position.lon };
    const initialMarker: MgaMarker = {
      latitude: position.lat,
      longitude: position.lon,
    };
    initialMarkers.push(initialMarker);
  }

  /**
   * `WORK` was passed as the value of `mode` via route params. Allow the user to set their work address.
   */
  const [mode, setMode] = useState<TripsDestinationScreenMode>(
    routeParams?.mode ?? 'EXPLORE',
  );
  const [showLocationResults, setShowLocationResults] = useState<boolean>(
    mode == 'WORK',
  );
  const destinationDetailPanel = useRef<CsfWindowShadeRef>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinate);
  const filters: Array<FilterItem> = t('tripPlan:destinationSearchFilters', {
    returnObjects: true,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterItem | null>(null);
  const [markers, setMarkers] = useState<MgaMarker[]>(initialMarkers);
  const [destinations, setDestinations] =
    useState<TripDestinationResult[]>(initialDestinations);
  const [candidate, setCandidate] = useState<TripDestinationResult | null>(
    existingDestination,
  );
  const [tripID, setTripID] = useState<number | null>(initialTripID);
  const [showTripErrors, setShowTripErrors] = useState<boolean>(false);
  const [showPOIErrors, setShowPOIErrors] = useState<boolean>(false);
  const [state, setState] = useState({
    requiredTripName: initialTripName,
    requiredPOIName: candidate?.mysPoiName ?? '',
    showSaveTripModal: false,
    showEditPOINameModal: false,
    saveTripSuccess: false,
    savedTripName: initialTripName,
    value: '',
    results: [] as TomTomSearchResult[],
    loading: false,
  });

  const existingTripNames: string[] | undefined = allTrips?.data
    ?.filter(t => t.tripId != tripID)
    .map(t => t.name.toUpperCase().trim());

  const tripErrors = validate(
    { ...state, requiredTripName: state.requiredTripName.toUpperCase().trim() },
    {
      requiredTripName: {
        required: true,
        alphanumericSpace: true,
        nameAlreadyExists: existingTripNames,
      },
    },
    (_key, error) => {
      return t(`validation:${error as string}`);
    },
  );

  const POIErrors = validate(
    state,
    {
      requiredPOIName: 'required',
    },
    (_key, error) => {
      return t(`validation:${error as string}`);
    },
  );

  const favoritePOISData: POIResponse[] = existingFavoritePOIs?.data || [];

  const getCandidatePoiState = (): {
    icon: keyof typeof CsfIcons
    color: keyof CsfColorPalette
    status: boolean
  } => {
    const POI = favoritePOISData.find(POI => POI.poiId == candidate?.poiId);

    /**
     * Default values for a `candidate` that has not been marked as favorite.
     */
    let icon: keyof typeof CsfIcons = 'Heart';
    let color: keyof CsfColorPalette = 'button';
    let status = false;

    /**
     * `DEALER` is not a real `POI` as it doesn't come from the endpoint `retrieve/favorite/pois.json`
     */
    if (candidate?.mysPoiCategory == 'DEALER') {
      icon = 'Subaru';
      status = true;
      color = 'copyPrimary';
      /**
       * Otherwise we check the normal `POI` for its category and proceed accordingly.
       */
    } else if (POI) {
      switch (POI.mysPoiCategory) {
        case 'HOME':
          icon = 'Home';
          color = 'copyPrimary';
          break;
        case 'WORK':
          icon = 'Work';
          color = 'copyPrimary';
          break;
        case 'FAV':
          icon = 'HeartFill';
          color = 'button';
          break;
      }
      status = true;
    }

    /**
     * If we are setting the user's Work address
     */
    if (mode == 'WORK') {
      icon = 'Work';
      color = 'copyPrimary';
    }

    return { icon, status, color };
  };

  const updatePOIName = async () => {
    if (!candidate) { return; }
    setShowPOIErrors(true);
    if (Object.keys(POIErrors).length > 0) { return; }

    await store
      .dispatch(
        tripsApi.endpoints.updatePOI.initiate({
          ...tripDestinationToPoi(candidate),
          mysPoiName: state.requiredPOIName,
        }),
      )
      .unwrap()
      .then(response => {
        setState({ ...state, showEditPOINameModal: false, requiredPOIName: '' });
        if (response.success) {
          const updatedDestination = {
            ...candidate,
            mysPoiName: state.requiredPOIName,
          };
          setCandidate(updatedDestination);
          successNotice({
            title: t('common:success'),
            subtitle: t('tripPlan:destinationNameSaveSuccess', {
              tripName: state.requiredTripName,
            }),
          });
        } else {
          let errorMessage: string;
          if (
            !!response.errorCode &&
            response.errorCode == 'NO_RECORD_FOUND_TO_MODIFY'
          ) {
            errorMessage = t('tripPlan:destinationNameSaveFailedNoPOIFound');
          } else {
            errorMessage = t('tripPlan:destinationNameSaveFailed');
          }
          errorNotice({
            title: t('common:error'),
            subtitle: errorMessage,
          });
        }
      })
      .then(() => {
        // Manually trigger a re-fetch
        // To refresh the store / UI.
        return store
          .dispatch(tripsApi.endpoints.retrieveFavoritePOIs.initiate(vParams))
          .unwrap();
      })
      .catch(err => {
        console.error(err);
        errorNotice({
          title: t('common:error'),
          subtitle: t('tripPlan:destinationNameSaveFailed'),
        });
        setState({ ...state, requiredPOIName: '' });
      });
  };

  const onTripAction = async () => {
    setShowTripErrors(true);
    if (Object.keys(tripErrors).length > 0) { return; }
    const poisArray: POIRequest[] = destinations.map(destination =>
      tripDestinationToPoi(destination),
    );
    if (tripID) {
      // Trip already exists. Update the trip.
      const request = tripsApi.endpoints.updateTrip.initiate({
        tripId: tripID,
        name: state.requiredTripName,
        pois: poisArray.map(poi => ({ poi: poi })),
      });
      const response = await store.dispatch(request).unwrap();
      if (response.success) {
        // eslint-disable-next-line
        setTripID(response.data?.tripId || null)
        setState({
          ...state,
          showSaveTripModal: false,
          savedTripName: state.requiredTripName,
        });
        successNotice({
          title: t('common:success'),
          subtitle: t('tripPlan:saveTripSuccessMessage', {
            tripName: state.requiredTripName,
          }),
        });
      } else {
        errorNotice({
          title: t('common:error'),
          subtitle: t('tripPlan:saveTripErrorMessage', {
            tripName: state.requiredTripName,
          }),
        });
      }
    } else {
      // Trip doesn't exist. Create the trip.
      await store
        .dispatch(
          tripsApi.endpoints.createTrip.initiate({
            name: state.requiredTripName,
            pois: poisArray.map(poi => ({ poi: poi })),
          }),
        )
        .unwrap()
        .then(response => {
          if (response.success) {
            // eslint-disable-next-line
            setTripID(response.data?.tripId || null)
            setState({
              ...state,
              showSaveTripModal: false,
              saveTripSuccess: true,
              savedTripName: state.requiredTripName,
            });
            successNotice({
              title: t('common:success'),
              subtitle: t('tripPlan:successSaving', {
                tripName: state.requiredTripName,
              }),
            });
          } else if (response?.errorCode != cNetworkError) {
            errorNotice({
              title: t('common:error'),
              subtitle: t('tripPlan:errorSaving', {
                tripName: state.requiredTripName,
              }),
            });
          }
        })
        .catch(err => {
          console.error(err);
          errorNotice({
            title: t('common:error'),
            subtitle: t('tripPlan:errorSaving', {
              tripName: state.requiredTripName,
            }),
          });
        });
    }

    /**
     * After Save or Update, Manually trigger a re-fetch
     * To refresh the store / UI.
     */
    const response = await store
      .dispatch(tripsApi.endpoints.retrieveAllTrips.initiate(vParams))
      .unwrap()
      .catch(console.error);
    if (response?.success) {
      setState({
        ...state,
        showSaveTripModal: false,
        saveTripSuccess: false,
        savedTripName: state.requiredTripName,
      });
    }
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      const gps = await pingCurrentLocation();
      if (gps?.position) {
        const { latitude, longitude } = gps.position.coords;
        if (!existingDestination) {
          setCoordinates({ latitude, longitude });
        }
        if (mode == 'EXPLORE') {
          // Render the user marker only in Explore mode
          setMarkers([
            ...markers,
            {
              latitude,
              longitude,
              symbolBackgroundColor: colors.success,
              type: 'user',
            },
          ]);
        }
        setState({ ...state, value: t('common:currentLocation') });
      } else {
        const { data = { success: true } } = await store.dispatch(
          contactApi.endpoints.customerProfile.initiate({
            vin: vehicle?.vin || '',
            oemCustId: vehicle?.oemCustId || '',
          }),
        );
        const { data: profileResponseData }: CustomerProfileResponse = data;
        const customerProfile = profileResponseData?.customerProfile;
        const customerZipCode = customerProfile?.zip5Digits;
        if (customerZipCode) {
          try {
            const geoCodeResponse = await tomTomStructuredGeocodeSearch({
              postalCode: customerZipCode,
              countryCode: 'USA',
            });

            const positionCandidate = geoCodeResponse.results
              ? geoCodeResponse.results[0].position
              : null;
            setCoordinates({
              latitude: positionCandidate?.lat || 0,
              longitude: positionCandidate?.lon || 0,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    };
    getCurrentLocation().catch(console.error);
    destinationDetailPanel?.current?.setShadeOpen(true);
  }, []);

  useEffect(() => {
    /**
     * Only fit bounds when more than 1 marker exists.
     * Otherwise the zoom level will be too high.
     */
    if (markers.length > 1) {
      mapRef.current?.fitMapBounds(markers, false);
    }
  }, [markers]);

  let windowShadeTitle = '';
  if (candidate) {
    // user is viewing a destination info
    const { name, freeformAddress, streetName, streetNumber, mysPoiName } =
      candidate;

    if (name == freeformAddress) {
      if (streetNumber && streetName) {
        windowShadeTitle = `${streetNumber}, ${streetName}`;
      } else {
        // i.e: a Municipality like "California, MD"
        windowShadeTitle = freeformAddress;
      }
    } else {
      if (mysPoiName) {
        windowShadeTitle = mysPoiName;
      } else {
        windowShadeTitle = name;
      }
    }
  } else {
    // user is viewing a trip info
    if (state.savedTripName) {
      windowShadeTitle = state.savedTripName;
    } else {
      windowShadeTitle = t('tripPlan:landingTitle');
    }
  }

  const editScreens: Record<'HOME' | 'DEALER', keyof ScreenList> = {
    HOME: 'MyProfileView',
    DEALER: 'Retailer',
  };

  const pageTitle: string =
    mode == 'WORK'
      ? t('tripPlan:setWorkAddress')
      : tripID
        ? state.requiredTripName
        : t('tripSearch:trips');

  /**
   * Prepare the address for rendering on 2 lines
   */
  const addressLines: string[] = [];
  if (candidate) {
    const addressComponents: string[] = candidate.freeformAddress.split(',');
    addressLines.push(addressComponents.shift() || ''); // Street number + Street name
    addressLines.push(addressComponents.join(',').trim()); // City, state / province, Zip
  }

  /**
   * MGA-1949 If trip was deleted but we somehow landed here through the back button,
   * render MgaTripNotFound.
   */
  if (
    !state.saveTripSuccess &&
    tripID &&
    !allTrips?.data?.map(t => t.tripId).includes(tripID)
  ) {
    return <MgaTripNotFound />;
  }

  const id = testID('TripsDestinationSearch');

  return (
    <MgaPage
      noScroll
      stickyFooter={() => {
        return (
          <CsfWindowShade ref={destinationDetailPanel} title={windowShadeTitle}>
            <ScrollView style={{ maxHeight: 400 }}>
              {(!!candidate && (
                <CsfView
                  flexDirection="column"
                  gap={16}
                  p={16}
                  testID={id('footer')}>
                  <CsfView flexDirection="row" justify="space-between">
                    <CsfView flexDirection="column">
                      <CsfText variant="body2" testID={id('addressLines0')}>
                        {addressLines[0]}
                      </CsfText>
                      <CsfText variant="body2" testID={id('addressLines1')}>
                        {addressLines[1]}
                      </CsfText>

                      {!!candidate.mysPoiCategory &&
                        (primaryPOICategories.includes(
                          candidate.mysPoiCategory,
                        ) ? (
                          <CsfView
                            pv={12}
                            flexDirection="row"
                            justify="flex-start"
                            align="center">
                            <MgaButton
                              trackingId="DestinationSearchEdit"
                              variant="inlineLink"
                              title={t('common:edit')}
                              onPress={async () => {
                                if (candidate.mysPoiCategory == 'WORK') {
                                  setCandidate(null);
                                  /**
                                   * Set coordinates to user location before entering the edit Work location flow.
                                   * Otherwise, tomtom search results will use the old Work address coordinates to return results.
                                   */
                                  const gps = await pingCurrentLocation();
                                  if (gps?.position) {
                                    const { latitude, longitude } =
                                      gps.position.coords;
                                    const userCoordinates: Coordinates = {
                                      latitude,
                                      longitude,
                                    };
                                    setCoordinates(userCoordinates);
                                  }
                                  /**
                                   * Whether an actual user location is returned,
                                   * Or if no location coordinates are returned, i.e: if user does not allow location access to the app
                                   * Render the work address edit flow.
                                   */
                                  setMode('WORK');
                                  setShowLocationResults(true);
                                } else {
                                  const title: string = t('common:confirmation');
                                  const message: string = t(
                                    'tripPlan:wantNavigate',
                                  );
                                  const yes: string = t('common:yes');
                                  const no: string = t('common:cancel');
                                  const response = await promptAlert(
                                    title,
                                    message,
                                    [
                                      {
                                        title: yes,
                                        type: 'primary',
                                      },
                                      { title: no, type: 'secondary' },
                                    ],
                                  );
                                  if (response == yes) {
                                    const poiCategory = candidate.mysPoiCategory;
                                    if (
                                      poiCategory === 'HOME' ||
                                      poiCategory === 'DEALER'
                                    ) {
                                      const path = editScreens[poiCategory];
                                      if (path == editScreens.HOME) {
                                        navigation.navigate('MyProfileView');
                                      } else if (path == editScreens.DEALER) {
                                        navigation.navigate('Retailer', {});
                                      } else {
                                        console.error(
                                          'No valid route was found.',
                                        );
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </CsfView>
                        ) : (
                          <CsfView
                            pv={12}
                            flexDirection="row"
                            justify="flex-start"
                            align="center">
                            <MgaButton
                              trackingId="TripPlanEditName"
                              variant="inlineLink"
                              title={t('tripPlan:editName')}
                              onPress={() => {
                                setState({
                                  ...state,
                                  showEditPOINameModal: true,
                                });
                              }}
                            />
                          </CsfView>
                        ))}
                    </CsfView>

                    <CsfPressable
                      testID={id('favPoiCategory')}
                      onPress={async () => {
                        // Only pressable for `FAV` POI category.
                        if (
                          primaryPOICategories.includes(
                            candidate?.mysPoiCategory,
                          )
                        ) {
                          return;
                        }

                        const {
                          streetName: street,
                          position,
                          name,
                          freeformAddress,
                          city,
                          zip,
                          state,
                          streetNumber,
                          distance,
                          poiId,
                        } = candidate;
                        const POIRequestObject: POIRequest = {
                          name,
                          displayName: `${name}, ${freeformAddress}`,
                          mysPoiCategory: 'FAV',
                          mysPoiName: name,
                          tripPoiId: null,
                          poiId: null,
                          distanceText: `(${distance} miles)`,
                          city,
                          zip: Number(zip),
                          state,
                          street,
                          streetNumber: Number(streetNumber),
                          formattedAddress: freeformAddress,
                          latitude: position.lat,
                          longitude: position.lon,
                        };
                        if (getCandidatePoiState().status) {
                          // Un-mark as favorite
                          await store
                            .dispatch(
                              tripsApi.endpoints.deletePOI.initiate({
                                poiId: poiId,
                              }),
                            )
                            .unwrap()
                            .then(response => {
                              if (!response?.success) {
                                let message = t('tripPlan:POIsFailedDelete');
                                if (
                                  response.errorCode &&
                                  response.errorCode ==
                                  'DELETE_FAV_HAS_TRIP_ASSOCIATION'
                                ) {
                                  message = t('tripPlan:POIsFailedDeleteInUse');
                                }
                                navigation.push('Alert', {
                                  title: t('common:attention'),
                                  message,
                                  options: { type: 'information' },
                                  actions: [
                                    {
                                      title: t('common:ok'),
                                      type: 'primary',
                                    },
                                  ],
                                });
                              } else {
                                const updatedCandidate = {
                                  ...candidate,
                                  mysPoiCategory: null,
                                };
                                setCandidate(updatedCandidate);
                              }
                            })
                            .catch(console.error);
                        } else {
                          // Mark as favorite
                          await store
                            .dispatch(
                              tripsApi.endpoints.createFavoritePOI.initiate(
                                POIRequestObject,
                              ),
                            )
                            .unwrap()
                            .then(({ data }) => {
                              const updatedCandidate = {
                                ...candidate,
                                poiId: data?.poiId,
                                mysPoiName: data?.mysPoiName,
                                mysPoiCategory: data?.mysPoiCategory,
                              };
                              setCandidate(updatedCandidate);
                            })
                            .catch(console.error);
                        }

                        // Manually trigger a re-fetch
                        // To refresh the store / UI.
                        await store
                          .dispatch(
                            tripsApi.endpoints.retrieveFavoritePOIs.initiate(
                              vParams,
                            ),
                          )
                          .unwrap()
                          .catch(console.error);
                      }}>
                      <CsfAppIcon
                        size="lg"
                        color={getCandidatePoiState().color}
                        icon={getCandidatePoiState().icon}
                      />
                    </CsfPressable>
                  </CsfView>

                  {mode !== 'WORK' ? (
                    <CsfView
                      flexDirection="column"
                      gap={12}
                      justify="space-between">
                      <CsfView gap={12} flexDirection="column">
                        <MgaButton
                          trackingId="AddDestinationToTrip"
                          style={{ flex: 1 }}
                          title={t('tripPlan:addDestinationToTrip')}
                          variant="primary"
                          onPress={() => {
                            const updatedDestinations = [
                              ...destinations,
                              candidate,
                            ];
                            setDestinations(updatedDestinations);
                            const {
                              id,
                              position: { lon: longitude, lat: latitude },
                            } = candidate;
                            const candidateMarkerIndex: number =
                              markers.findIndex(m => m.type == 'candidate');
                            const newDestinationMarker: MgaMarker = {
                              latitude,
                              longitude,
                              id,
                              type: 'destination',
                            };
                            const hasExistingDestinationMarkers: boolean =
                              markers.some(m => m.type == 'destination');
                            let newDestinationMarkerLetterIndex = 0;
                            if (hasExistingDestinationMarkers) {
                              newDestinationMarkerLetterIndex = markers.filter(
                                m => m.type == 'destination',
                              ).length;
                            }
                            newDestinationMarker.symbolText =
                              numericIndexToUpperCaseLetter(
                                newDestinationMarkerLetterIndex,
                              );
                            const updatedMarkers: MgaMarker[] = [...markers];
                            updatedMarkers.splice(
                              candidateMarkerIndex,
                              1,
                              newDestinationMarker,
                            );
                            setMarkers(updatedMarkers);
                            setCandidate(null);
                            if (destinations.length > 1) {
                              setMode('TRIP');
                            }
                          }}
                        />
                        <MgaButton
                          trackingId="SendDestinationToVehicle"
                          style={{ flex: 1 }}
                          title={t('tripPlan:sendDestinationToVehicle')}
                          variant="secondary"
                          onPress={() => {
                            const poiCandidate = tripDestinationToPoi(candidate);
                            const params: RemoteSendPOIToVehicleRequest = {
                              pois: [poiCandidate],
                              pin: '',
                              vin: '',
                            };
                            //TODO:MN:20240425 Add persistent user facing error handling
                            sendPOIToVehicle(params).catch(console.error);
                          }}
                        />
                      </CsfView>

                      <MgaButton
                        trackingId="DestinationSearchCancel"
                        style={{ flexGrow: 1 }}
                        title={t('common:cancel')}
                        variant="link"
                        onPress={() => {
                          if (mode == 'FAVORITE' || mode == 'WORK') {
                            navigation.goBack();
                          }
                          setShowLocationResults(true);
                          const updatedMarkers: MgaMarker[] = markers.filter(
                            marker => marker.type !== 'candidate',
                          );
                          setCandidate(null);
                          setMarkers(updatedMarkers);
                          const userMarker: MgaMarker | undefined =
                            markers.find(marker => marker.type == 'user');
                          if (userMarker) {
                            const userCoordinates: Coordinates = {
                              latitude: userMarker.latitude,
                              longitude: userMarker.longitude,
                            };
                            setCoordinates(userCoordinates);
                          }
                        }}
                      />
                    </CsfView>
                  ) : (
                    <CsfView p={16} gap={12} justify="space-between">
                      <MgaButton
                        trackingId="DestinationSearchSaveAsWork"
                        style={{ flexGrow: 1 }}
                        title={t('tripPlan:saveAsWork')}
                        variant="primary"
                        onPress={async () => {
                          const work: POIRequest = tripDestinationToPoi(
                            candidate,
                            'WORK',
                          );

                          await store
                            .dispatch(
                              tripsApi.endpoints.saveHomeOrWorkPOI.initiate(
                                work,
                              ),
                            )
                            .unwrap()
                            .then(({ data }) => {
                              const updatedCandidate = {
                                ...candidate,
                                poiId: data?.poiId,
                                mysPoiName: data?.mysPoiName,
                                mysPoiCategory: data?.mysPoiCategory,
                              };
                              setCandidate(updatedCandidate);
                            })
                            .then(() => {
                              // Manually trigger a re-fetch
                              // To refresh the store / UI.
                              return store
                                .dispatch(
                                  tripsApi.endpoints.retrieveFavoritePOIs.initiate(
                                    vParams,
                                  ),
                                )
                                .unwrap()
                                .catch(e => {
                                  throw e;
                                });
                            })
                            .then(() => {
                              successNotice({
                                title: t('common:success'),
                                subtitle: t('tripPlan:workAddressSaveSuccess'),
                              });
                            })
                            .catch(error => {
                              console.error(error);
                              errorNotice({
                                title: t('common:failed'),
                                subtitle: t('tripPlan:workAddressSaveFailed'),
                              });
                            });
                        }}
                      />
                      <MgaButton
                        trackingId="DestinationSearchCancel"
                        style={{ flexGrow: 1 }}
                        title={t('common:cancel')}
                        variant="link"
                        onPress={() => {
                          setCandidate(null);
                          setShowLocationResults(true);
                        }}
                      />
                    </CsfView>
                  )}
                </CsfView>
              )) || (
                  <CsfTile>
                    <CsfRuleList>
                      {destinations.map((destination, destIndex) => {
                        const itemTestId = testID(id(`destination-${destIndex}`));
                        return (
                          <MgaDestinationItem
                            key={destIndex}
                            testID={itemTestId()}
                            index={destIndex}
                            title={destination.name}
                            onClose={() => {
                              // Trips need at least 1 destination.
                              if (destinations.length == 1) {
                                navigation.push('Alert', {
                                  title: t('common:attention'),
                                  message: t('tripPlan:minDestinationsReached'),
                                  options: { type: 'information' },
                                  actions: [
                                    {
                                      title: t('common:ok'),
                                      type: 'primary',
                                    },
                                  ],
                                });
                                return;
                              }

                              const updatedDestinations = [...destinations];
                              updatedDestinations.splice(destIndex, 1);

                              const updatedDestinationMarkers = markers.filter(
                                marker => marker.type == 'destination',
                              );
                              const updatedUserMarker = markers.find(
                                marker => marker.type == 'user',
                              );
                              updatedDestinationMarkers.splice(destIndex, 1);
                              // Re-calculate the symbol text for the remaining destination map markers.
                              updatedDestinationMarkers.forEach(
                                (marker, markerIndex) => {
                                  marker.symbolText =
                                    numericIndexToUpperCaseLetter(markerIndex);
                                },
                              );
                              const updatedMarkers: MgaMarker[] = [
                                ...updatedDestinationMarkers,
                              ];
                              if (updatedUserMarker) {
                                updatedMarkers.push(updatedUserMarker);
                              }

                              setDestinations(updatedDestinations);
                              setMarkers(updatedMarkers);
                            }}
                          />
                        );
                      })}
                    </CsfRuleList>
                    <CsfView>
                      {destinations.length < MAX_DESTINATION_COUNT && (
                        <CsfView>
                          <MgaLocationSelect
                            testID={id('enterDestination')}
                            label={t('tripPlan:enterDestination')}
                            idxSet="POI,Geo,PAD,Addr"
                            mode={mode}
                            show={showLocationResults}
                            onShowChange={show => setShowLocationResults(show)}
                            searchTerm={searchTerm}
                            onSearchTermChange={term => {
                              setSearchTerm(term);
                            }}
                            activeFilter={activeFilter ?? undefined}
                            onActiveFilterChange={(filter: FilterItem) =>
                              setActiveFilter(filter)
                            }
                            filterList={filters}
                            fullBleedModal
                            lat={coordinates.latitude}
                            lon={coordinates.longitude}
                            renderLocationCell={formatResults}
                            favoritePOIs={favoritePOISData}
                            TriggerComponent={
                              destinations.length
                                ? ({ onPress }) => {
                                  return (
                                    <MgaButton
                                      trackingId="TripPlanAddDestination"
                                      variant="link"
                                      icon="Plus"
                                      title={
                                        destinations.length >= 1
                                          ? t('tripPlan:addDestination')
                                          : t('tripPlan:addFirstDestination')
                                      }
                                      onPress={onPress as () => void}
                                    />
                                  );
                                }
                                : undefined
                            }
                            renderCellIcon={() => {
                              return (
                                <CsfAppIcon
                                  color={'button'}
                                  icon={'LocateVehicleFill'}
                                />
                              );
                            }}
                            renderCellTitle={(item: TripDestinationResult) => {
                              const { name, freeformAddress } = item;
                              const cellTitle: string =
                                name == freeformAddress
                                  ? freeformAddress
                                  : `${name}, ${freeformAddress}`;
                              return cellTitle;
                            }}
                            renderCellSubtitle={(item: TripDestinationResult) =>
                              `(${item.distance} Miles)`
                            }
                            onSelectResult={(result: TripDestinationResult) => {
                              const latitude: number = result.position.lat;
                              const longitude: number = result.position.lon;
                              const id: string = result.id;

                              setCoordinates({ latitude, longitude });
                              if (mode == 'WORK') {
                                setMarkers([
                                  {
                                    latitude,
                                    longitude,
                                    type: 'candidate',
                                    id,
                                  },
                                ]);
                              } else {
                                setMarkers([
                                  ...markers,
                                  {
                                    latitude,
                                    longitude,
                                    type: 'candidate',
                                    id,
                                  },
                                ]);
                              }
                              setCandidate(result);
                              setState({
                                ...state,
                                requiredPOIName: result?.mysPoiName,
                              });
                              setShowLocationResults(false);
                            }}
                          />
                        </CsfView>
                      )}
                      {destinations.length == MAX_DESTINATION_COUNT && (
                        <CsfView p={16}>
                          <CsfText
                            align="center"
                            variant="body2"
                            testID={id('maxDestinationMessage')}>
                            {t('tripPlan:maxDestinationMessage')}
                          </CsfText>
                        </CsfView>
                      )}
                    </CsfView>

                    {destinations.length > 0 && (
                      <CsfView p={16} gap={12} justify="space-between">
                        <MgaButton
                          trackingId="SendTripToVehicle"
                          style={{ flexGrow: 1 }}
                          title={t('tripPlan:sendTripToVehicle')}
                          variant="primary"
                          disabled={destinations.length == 0}
                          onPress={() => {
                            const poiCandidates = destinations.map(
                              (destination: TripDestinationResult) => {
                                return tripDestinationToPoi(destination);
                              },
                            );
                            const params: RemoteSendPOIToVehicleRequest = {
                              pois: poiCandidates,
                              pin: '',
                              vin: '',
                            };
                            sendPOIToVehicle(params).catch(console.error);
                          }}
                        />
                        <MgaButton
                          trackingId="DestinationSearchSaveTrip"
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{ flexGrow: 1 }}
                          title={t('tripPlan:saveTrip')}
                          variant="secondary"
                          disabled={destinations.length == 0}
                          onPress={() => {
                            setShowTripErrors(false);
                            setState({
                              ...state,
                              showSaveTripModal: true,
                              requiredTripName: state.savedTripName,
                            });
                          }}
                        />
                        <MgaButton
                          trackingId="ManageSavedTrips"
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{ flexGrow: 1 }}
                          title={t('tripPlan:manageSavedTrips')}
                          variant="link"
                          onPress={() => {
                            navigation.navigate('SavedTrips');
                          }}
                        />
                      </CsfView>
                    )}
                  </CsfTile>
                )}
            </ScrollView>
          </CsfWindowShade>
        );
      }}
      title={pageTitle}>
      <CsfView flex={1}>
        <MgaMarkerMap
          testID={id('mapMarker')}
          style={{ flexGrow: 1 }}
          center={
            initialMarkers.length || destinations.length ? null : coordinates
          }
          ref={mapRef}
          markers={markers}
          onMessage={action => {
            switch (action.type) {
              case 'map/ready':
                if (mode == 'FAVORITE') {
                  mapRef.current?.setWebRef({ zoom: FAV_ZOOM_LEVEL });
                }
                break;
            }
          }}
        />
      </CsfView>

      {state.showEditPOINameModal && (
        <CsfModal title={t('tripPlan:editName')}>
          <CsfView gap={16} p={16}>
            <CsfTextInput
              maxLength={50}
              testID={id('requiredPOIName')}
              keyboardType="default"
              value={state.requiredPOIName}
              errors={showPOIErrors && POIErrors.requiredPOIName}
              onChangeText={value => {
                setState({ ...state, requiredPOIName: value });
              }}
              label={t('tripPlan:editName')}
            />

            <CsfView flexDirection="column" gap={12}>
              <MgaButton
                trackingId="SaveDestinationName"
                variant="primary"
                title={t('tripPlan:saveDestinationName')}
                onPress={updatePOIName}
              />
              <MgaButton
                variant="link"
                trackingId="Cancel"
                onPress={() => {
                  setState({
                    ...state,
                    showEditPOINameModal: false,
                  });
                }}
                title={t('common:cancel')}
              />
            </CsfView>
            <CsfText
              variant="body2"
              align="center"
              testID={id('destinationNameCharLimit')}>
              {t('tripPlan:destinationNameCharLimit')}
            </CsfText>
          </CsfView>
        </CsfModal>
      )}

      {state.showSaveTripModal && (
        <CsfModal title={t('tripPlan:saveTrip')}>
          <CsfView gap={16} p={16}>
            {allTrips?.data?.length == MAX_TRIP_COUNT && !tripID ? (
              <CsfView flexDirection="column" gap={12}>
                <CsfText
                  variant="body2"
                  align="center"
                  testID={id('maxTripsReachedMessage')}>
                  {t('tripPlan:maxTripsReachedMessage')}
                </CsfText>
                <CsfText
                  variant="body2"
                  align="center"
                  testID={id('maxTripsMessage')}>
                  {t('tripPlan:maxTripsMessage', {
                    count: MAX_TRIP_COUNT,
                  })}
                </CsfText>
                <MgaButton
                  trackingId="DestinationSearchOk"
                  variant="primary"
                  title={t('common:ok')}
                  onPress={() => {
                    setState({ ...state, showSaveTripModal: false });
                  }}
                />
              </CsfView>
            ) : (
              <>
                <CsfTextInput
                  maxLength={50}
                  keyboardType="default"
                  testID={id('requiredTripName')}
                  value={state.requiredTripName}
                  errors={showTripErrors && tripErrors.requiredTripName}
                  onChangeText={value => {
                    setState({ ...state, requiredTripName: value });
                  }}
                  label={t('tripPlan:tripName')}
                />

                <CsfView flexDirection="column" gap={12}>
                  <MgaButton
                    trackingId="DestinationSearchSaveTrip"
                    variant="primary"
                    title={t('tripPlan:saveTrip')}
                    onPress={onTripAction}
                  />
                  <MgaButton
                    trackingId="DestinationSearchCancel"
                    variant="link"
                    onPress={() => {
                      setState({
                        ...state,
                        showSaveTripModal: false,
                      });
                    }}
                    title={t('common:cancel')}
                  />
                </CsfView>
                <CsfText
                  variant="body2"
                  align="center"
                  testID={id('maxTripsMessage')}>
                  {t('tripPlan:maxTripsMessage', {
                    count: MAX_TRIP_COUNT,
                  })}
                </CsfText>
              </>
            )}
          </CsfView>
        </CsfModal>
      )}
    </MgaPage>
  );
};

export default MgaTripsDestinationSearch;
