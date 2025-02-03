// cSpell:ignore pois
import React from 'react';
import { poiToDestinationData } from './MgaTripsDestinationSearch';
import * as CsfIcons from '../../core/res/assets/icons';
import { store } from '../store';
import {
  ClientSessionVehicle,
  POIResponse,
  POIcategory,
  TripsDestinationScreenMode,
} from '../../@types';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useTranslation } from 'react-i18next';
import { tripsApi, useRetrieveFavoritePOIsQuery } from '../api/trips.api';
import { ScreenList, useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice, errorNotice } from '../components/notice';

const MAX_FAVORITE_COUNT = 50;

export interface Placeholder {
  category: POIcategory
  targetScreen: keyof ScreenList
  navigationArgs?: unknown
  titleKey: string
  subtitleKey: string
  icon: keyof typeof CsfIcons
}

export const prepareFavoriteLocations = (
  POIs: POIResponse[],
  vehicle: ClientSessionVehicle | null,
  hidePlaceholders?: boolean,
): (Placeholder | POIResponse)[] => {
  const home: POIResponse | undefined = POIs.find(
    POI => POI.mysPoiCategory == 'HOME',
  );
  const work: POIResponse | undefined = POIs.find(
    POI => POI.mysPoiCategory == 'WORK',
  );

  // customer preferred dealer address
  const preferredDealer = vehicle?.preferredDealer;
  let dealer: POIResponse | null = null;

  if (preferredDealer) {
    dealer = {
      poiId: Number(preferredDealer.dealerCode),
      mysPoiName: preferredDealer.name,
      mysPoiCategory: 'DEALER',
      zip: Number(`${preferredDealer?.zip || ''}`),
      formattedAddress: preferredDealer.address,
      streetNumber: Number(preferredDealer.address.split(' ')[0]),
      city: preferredDealer?.city,
      street: preferredDealer.address.split(' ')[1],
      name: preferredDealer.name,
      state: preferredDealer.state,
      displayName: preferredDealer.name,
      distanceText: preferredDealer.distance
        ? `(${preferredDealer.distance} miles)`
        : '',
      longitude: preferredDealer.longDeg,
      latitude: preferredDealer.latDeg,
      accountId: 0,
      tripPoiId: '0', //todo null?
    };
  }

  const favoriteDestinations: POIResponse[] = POIs.filter(
    POI => POI.mysPoiCategory == 'FAV',
  );
  const output: (Placeholder | POIResponse)[] = [...favoriteDestinations];

  const dealerPlaceholder: Placeholder = {
    category: 'DEALER',
    targetScreen: 'Retailer',
    titleKey: 'tripPlan:retailer',
    subtitleKey: '',
    icon: 'Subaru',
  };

  const homePlaceholder: Placeholder = {
    category: 'HOME',
    targetScreen: 'MyProfileView',
    titleKey: 'tripPlan:home',
    subtitleKey: '',
    icon: 'Home',
  };

  const workNavigationArgs: { mode: TripsDestinationScreenMode } = {
    mode: 'WORK',
  };
  const workPlaceholder: Placeholder = {
    category: 'WORK',
    targetScreen: 'TripsDestinationSearch',
    titleKey: 'tripPlan:work',
    subtitleKey: '',
    icon: 'Work',
    navigationArgs: workNavigationArgs,
  };

  if (!dealer) {
    !hidePlaceholders && output.unshift(dealerPlaceholder);
  } else {
    output.unshift(dealer);
  }

  if (!work) {
    !hidePlaceholders && output.unshift(workPlaceholder);
  } else {
    output.unshift(work);
  }

  if (!home) {
    !hidePlaceholders && output.unshift(homePlaceholder);
  } else {
    output.unshift(home);
  }

  return output;
};

export const isPOI = (item: POIResponse | Placeholder): item is POIResponse => {
  return 'poiId' in item;
};

export const PoiIconMap: Record<POIcategory, keyof typeof CsfIcons> = {
  FAV: 'LocateVehicleFill',
  HOME: 'Home',
  WORK: 'Work',
  TOMTOM: 'LocateVehicleFill',
  DEALER: 'Subaru',
};

export const getPOIRenderDetails = (
  POI: POIResponse,
): {
  titleKey: string
  subtitleKey: string
} => {
  let titleKey = '';
  let subtitleKey = '';

  switch (POI.mysPoiCategory) {
    case 'HOME':
      titleKey = 'tripPlan:home';
      subtitleKey = POI.formattedAddress;
      break;
    case 'WORK':
      titleKey = 'tripPlan:work';
      subtitleKey = POI.formattedAddress;
      break;
    case 'DEALER':
      titleKey = POI.displayName;
      subtitleKey = 'branding:myRetailer';
      break;
    // the case below covers the 'FAV' category
    default:
      titleKey = POI.mysPoiName;
  }

  return {
    titleKey,
    subtitleKey,
  };
};

const MgaFavoriteDestinations: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const { data: allFavPOIs } = useRetrieveFavoritePOIsQuery(vParams);
  const favoritePOIs = allFavPOIs?.data || [];

  let favoriteLocations: (POIResponse | Placeholder)[] = [];
  favoriteLocations = prepareFavoriteLocations(favoritePOIs, vehicle);

  const id = testID('FavoriteDestinations');

  return (
    <MgaPage title={t('tripPlan:favoriteDestinations')} showVehicleInfoBar>
      <MgaPageContent title={t('tripPlan:favoriteDestinations')}>
        <CsfView gap={12}>
          <CsfTile p={0}>
            <CsfRuleList testID={id('list')}>
              {favoriteLocations.map((item, index) => {
                return (
                  <CsfListItem
                    key={index}
                    testID={id(`location-${index}`)}
                    onPress={() => {
                      if (isPOI(item)) {
                        navigation.push('TripsDestinationSearch', {
                          destination: poiToDestinationData(item),
                          mode: 'FAVORITE',
                        });
                      } else {
                        navigation.push(item.targetScreen, item?.navigationArgs);
                      }
                    }}
                    icon={
                      isPOI(item) ? (
                        <CsfAppIcon
                          icon={PoiIconMap[item.mysPoiCategory || 'FAV']}
                        />
                      ) : (
                        <CsfAppIcon icon={item.icon} />
                      )
                    }
                    action={
                      /*
                       * TODO:MN:20240429 Add accessibility ARIA label
                       */
                      <CsfAppIcon
                        icon={isPOI(item) ? 'BackForwardArrow' : 'Plus'}
                      />
                    }
                    title={
                      isPOI(item)
                        ? t(getPOIRenderDetails(item).titleKey)
                        : t(item.titleKey)
                    }
                    subtitle={
                      isPOI(item)
                        ? t(getPOIRenderDetails(item).subtitleKey)
                        : t(item.subtitleKey)
                    }
                  />
                );
              })}
            </CsfRuleList>
          </CsfTile>
        </CsfView>
        {favoriteLocations.some(
          item => isPOI(item) && item.mysPoiCategory == 'FAV',
        ) && (
            <CsfView>
              <MgaButton
                trackingId="TripsDeleteAllButton"
                variant="link"
                icon="Delete"
                title={t('tripPlan:deleteAll')}
                onPress={async () => {
                  const title: string = t('tripPlan:deletePOIs');
                  const message: string = t('tripPlan:wantDeleteAllPOIs');
                  const yes: string = t('common:delete');
                  const no: string = t('common:cancel');
                  const response = await promptAlert(title, message, [
                    {
                      title: yes,
                      type: 'primary',
                    },
                    { title: no, type: 'secondary' },
                  ]);
                  if (response == yes) {
                    await store
                      .dispatch(
                        tripsApi.endpoints.deleteAllFavoritePOIs.initiate(
                          vParams,
                        ),
                      )
                      .unwrap()
                      .then(response => {
                        if (response?.success) {
                          successNotice({
                            title: t('common:success'),
                            subtitle: t('tripPlan:POIsDeletedSuccessfully'),
                          });
                        } else {
                          let message = t('tripPlan:errorDeletingPOIs');
                          if (
                            response.errorCode &&
                            response.errorCode ==
                            'DELETE_ALL_FAV_HAS_TRIP_ASSOCIATION'
                          ) {
                            if (Array.isArray(response?.data)) {
                              const POINamesInUse: string = response.data
                                ?.map(poi => poi.mysPoiName)
                                .join(', ');
                              message = t(
                                'tripPlan:POIsFailedDeleteAllInUseWithPOIs',
                                { pois: POINamesInUse },
                              );
                            } else {
                              message = t('tripPlan:POIsFailedDeleteAllInUse');
                            }
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
                        }
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
                          .unwrap();
                      })
                      .catch(e => {
                        console.error(e);
                        errorNotice({
                          title: t('common:failed'),
                          subtitle: t('tripPlan:errorDeletingPOIs'),
                        });
                      });
                  }
                }}
              />
            </CsfView>
          )}
        <CsfText variant="body2" align="center" testID={id('maxPOIMessage')}>
          {t('tripPlan:maxPOIMessage', { count: MAX_FAVORITE_COUNT })}
        </CsfText>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaFavoriteDestinations;
