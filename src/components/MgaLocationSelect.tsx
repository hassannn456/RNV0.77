/* eslint-disable eol-last */
//cSpell:ignore POIS
import React, { ReactNode, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import CsfPressable from './CsfPressable';
import CsfModal from './CsfModal';

import { getEditable } from './utils/props';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  tomTomSearch,
  tomtomCategorySearch,
  TomTomSearchResult,
} from '../features/geolocation/tomtom.api';
import { useAppNavigation } from '../Controller';
import { useTranslation } from 'react-i18next';
import { CsfDropdownProps } from './CsfSelect';
import { pingCurrentLocation } from '../features/geolocation/geolocation.slice';
import {
  TripDestinationResult,
  POIResponse,
  TripsDestinationScreenMode,
} from '../../@types';
import {
  PoiIconMap,
  prepareFavoriteLocations,
  Placeholder,
  isPOI,
  getPOIRenderDetails,
} from '../screens/MgaFavoriteDestinations';
import { poiToDestinationData } from '../screens/MgaTripsDestinationSearch';

export interface FilterItem {
  id: string
  title: string
  type: 'searchTerm' | 'favorites'
}

export const testIDForDropdownItem: (
  item: CsfDropdownItem,
) => string | undefined = item => {
  if (!item.value) return undefined;
  return `option-${item.value}`;
};

export type MgaLocationSelectProps = CsfDropdownProps & {
  onSelectPosition?: (position: TomTomSearchResult['position']) => void
  onSelectResult?: (result: TomTomSearchResult | TripDestinationResult) => void
  idxSet?: string
  filterList?: Array<FilterItem>
  fullBleedModal?: boolean
  renderCellTitle: (
    result: TripDestinationResult | TomTomSearchResult,
  ) => string
  renderCellSubtitle: (
    result: TripDestinationResult | TomTomSearchResult,
  ) => string | null
  renderCellIcon: () => ReactNode | null
  renderLocationCell: (
    results: TomTomSearchResult[],
  ) => Array<TripDestinationResult | TomTomSearchResult>
  lat?: number
  lon?: number
  favoritePOIs?: POIResponse[]
  TriggerComponent?: React.ComponentType<any>
  mode: TripsDestinationScreenMode
  show?: boolean
  onShowChange?: (show: boolean) => void
  searchTerm?: string
  onSearchTermChange?: (term: string) => void
  activeFilter?: FilterItem
  onActiveFilterChange?: (filter: FilterItem) => void
}

const defaultProps: Partial<MgaLocationSelectProps> = {
  idxSet: 'Geo,PAD,Addr',
  fullBleedModal: false,
  favoritePOIs: [],
  mode: 'EXPLORE',
};

const MgaLocationSelect: React.FC<MgaLocationSelectProps> = (
  props: MgaLocationSelectProps,
) => {
  const {
    onSelectPosition,
    onSelectResult,
    idxSet,
    filterList,
    fullBleedModal,
    lat,
    lon,
    renderCellTitle,
    renderCellSubtitle,
    renderCellIcon,
    renderLocationCell,
    favoritePOIs,
    TriggerComponent,
    mode,
    show,
    onShowChange,
    searchTerm,
    onSearchTermChange,
    activeFilter,
    onActiveFilterChange,
    ...inputProps
  } = {
    ...defaultProps,
    ...props,
  };

  const navigation = useAppNavigation();
  const [state, setState] = useState({
    show: show,
    value: '',
    results: [] as TomTomSearchResult[],
    loading: false,
    lat: lat || 0,
    lon: lon || 0,
  });
  const [showFavorites, setShowFavorites] = useState<boolean>(
    (activeFilter && activeFilter.type == 'favorites') || false,
  );
  const [search, setSearch] = useState<string>(searchTerm ?? '');
  const [filter, setFilter] = useState<FilterItem | null>(activeFilter || null);
  const editable = getEditable(inputProps);
  const onPress = () => editable && setState({ ...state, show: !state.show });
  const { t } = useTranslation();

  const vehicle = useCurrentVehicle();
  const renderPOIs: (POIResponse | Placeholder)[] = prepareFavoriteLocations(
    favoritePOIs || [],
    vehicle,
    true,
  );

  useEffect(() => {
    if (filter) {
      if (onActiveFilterChange) {
        onActiveFilterChange(filter);
      }
      if (filter.type == 'searchTerm') {
        void runCategorySearch(filter.id);
      }
    }
  }, [filter]);

  useEffect(() => {
    setState({ ...state, show });
  }, [show]);

  useEffect(() => {
    if (onShowChange) {
      onShowChange(state.show);
    }
  }, [state.show]);

  useEffect(() => {
    if (!!lat && !!lon) {
      setState({ ...state, lat, lon });
    }
  }, [lat, lon]);

  useEffect(() => {
    if (onSearchTermChange) {
      onSearchTermChange(search);
    }

    // If a Filter was selected by the user, do not run keyword location search.
    if (filterList && filterList.map(f => f.title).includes(search)) {
      return;
    }

    runSearch().then().catch(console.error);
  }, [search]);

  const runSearch = async () => {
    if (search.length == 0) {
      setState({ ...state, results: [], loading: false });
    } else {
      setState({ ...state, loading: true });
      const response = await tomTomSearch(search, {
        limit: '10',
        countrySet: t('geography:tomtomCountrySet'),
        idxSet,
        lat: String(state.lat),
        lon: String(state.lon),
      });
      if (!response.errorText) {
        setState({ ...state, results: response.results ?? [], loading: false });
      }
    }
  };

  const runCategorySearch = async (categorySet: string) => {
    setState({ ...state, loading: true });
    const response = await tomtomCategorySearch({
      categorySet,
      limit: '10',
      countrySet: t('geography:tomtomCountrySet'),
      lat: String(state.lat),
      lon: String(state.lon),
    });
    if (!response.errorText) {
      setState({ ...state, results: response.results ?? [], loading: false });
    }
  };

  return (
    <>
      {TriggerComponent ? (
        <TriggerComponent onPress={onPress} />
      ) : (
        <CsfPressable onPress={onPress}>
          <CsfTextInput
            outsideLabel={props.outsideLabel}
            label={props.label || t('common:search')}
            pointerEvents="none"
            interactionEnabled={false}
            trailingAccessory={
              <CsfAppIcon color="button" icon="LocateVehicle" />
            }
            trailingAccessoryOnPress={async () => {
              if (onSelectPosition) {
                const gps = await pingCurrentLocation();
                if (gps?.position) {
                  onSelectPosition({
                    lat: gps.position.coords.latitude,
                    lon: gps.position.coords.longitude,
                  });
                  setState({ ...state, value: t('common:currentLocation') });
                }
              }
            }}
            {...inputProps}
            value={state.value}
            errors={props.errors}
          />
        </CsfPressable>
      )}

      {state.show && (
        <CsfModal
          fullBleed={fullBleedModal}
          title={props.label}
          trailingAccessoryView={
            <CsfButton
              variant="inlineLink"
              icon="Close"
              onPress={() => {
                if (mode == 'WORK') {
                  navigation.goBack();
                } else {
                  setState({ ...state, show: false });
                }
              }}
            />
          }>
          <CsfView gap={12} p={16}>
            <CsfTextInput
              inputMode="search"
              returnKeyType="search"
              {...inputProps}
              editable
              onChangeText={v => {
                setShowFavorites(false);
                setSearch(v);
                setFilter(null);
              }}
              label="Search"
              value={showFavorites ? t('tripPlan:favorites') : search}
              trailingAccessory={
                state.loading ? (
                  <CsfActivityIndicator size={24} />
                ) : (
                  <CsfAppIcon color={'button'} icon={'LocateVehicle'} />
                )
              }
            />

            {mode == 'WORK' ? (
              <CsfAlertBar
                subtitle={t('tripPlan:searchWorkAddressPrompt')}
                type="information"
                flat
              />
            ) : (
              <CsfRule />
            )}

            {filterList && mode !== 'WORK' && (
              <CsfView gap={8} mt={8} flexDirection="row">
                <FlatList
                  data={filterList}
                  renderItem={({ item }) => (
                    <CsfView mr={8}>
                      <CsfChip
                        active={filter?.title == item.title}
                        onPress={() => {
                          setFilter(item);
                          if (item.type == 'searchTerm') {
                            setState({ ...state, show: true });
                            setSearch(item.title);
                            setShowFavorites(false);
                          } else if (item.type == 'favorites') {
                            setSearch('');
                            setShowFavorites(true);
                            setState({ ...state, show: true });
                          }
                        }}
                        label={item.title}
                        value={item.title}
                      />
                    </CsfView>
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}></FlatList>
              </CsfView>
            )}
          </CsfView>

          {showFavorites ? (
            <FlatList
              data={renderPOIs}
              scrollEnabled
              renderItem={({ item }) => {
                const title: string = isPOI(item) ? item.name : t(item.titleKey);
                return (
                  <CsfListItem
                    key={isPOI(item) ? item.poiId : item.category}
                    icon={
                      isPOI(item) ? (
                        <CsfAppIcon
                          icon={PoiIconMap[item.mysPoiCategory || 'FAV']}
                        />
                      ) : (
                        <CsfAppIcon icon={item.icon} />
                      )
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
                    onPress={() => {
                      if (isPOI(item)) {
                        const destination = poiToDestinationData(item);
                        onSelectPosition &&
                          onSelectPosition(destination.position);
                        onSelectResult && onSelectResult(destination);
                        setState({
                          ...state,
                          show: false,
                          value: title,
                        });
                        setSearch(title);
                      } else {
                        navigation.push(item.targetScreen);
                      }
                    }}
                  />
                );
              }}
            />
          ) : (
            <FlatList
              data={renderLocationCell(state.results)}
              scrollEnabled
              renderItem={({ item }) => {
                const title = renderCellTitle(item);
                const subtitle = renderCellSubtitle(item);
                const icon = renderCellIcon();
                return (
                  <CsfListItem
                    key={item.id}
                    icon={icon}
                    title={title}
                    subtitle={subtitle}
                    onPress={() => {
                      onSelectPosition && onSelectPosition(item.position);
                      onSelectResult && onSelectResult(item);
                      setState({
                        ...state,
                        show: false,
                        value: title,
                      });
                    }}
                  />
                );
              }}
            />
          )}
        </CsfModal>
      )}
    </>
  );
};


export default MgaLocationSelect;