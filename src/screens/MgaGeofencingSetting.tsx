/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GeoFence,
  geoFenceEquals,
  geoFenceSaveAndSend,
} from '../features/alerts/boundaryAlert.api';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { translateErrors, validate } from '../utils/validate';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { store } from '../store';
import CsfSelect, { CsfDropdownItem } from '../components/CsfSelect';
import { TomTomSearchResult } from '../features/geolocation/tomtom.api';
import { formatLabel } from '../components/CsfForm/CsfForm';
import CsfModal from '../components/CsfModal';
import { CsfSegmentedButton } from '../components/CsfSegmentedButton';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaLocationSelect from '../components/MgaLocationSelect';
import MgaMarkerMap from '../components/MgaMarkerMap';
import MgaPage from '../components/MgaPage';

const defaultGeoFence: GeoFence = {
  name: '',
  active: true,
  exceedMinimumSeconds: '30',
  fenceType: '1',
  shapeType: 0,
  radius: 8025, // 8025 meters is 5.0 miles or 8.0 km
  center: { latitude: 42, longitude: -97 },
  topLeft: null,
  bottomRight: null,
};

const MgaGeofencingSetting: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'GeofencingSetting'>();
  const navigation = useAppNavigation();
  const alerts = route.params.alerts;
  const index = route.params.index;
  const [target, setTarget] = useState<GeoFence>(defaultGeoFence);
  const setCenter = (latitude: number, longitude: number): boolean => {
    // Some incoming data uses invalid LatLng values
    // TomTom cannot handle these
    if (latitude <= -90 || latitude >= 90) { return false; }
    if (longitude <= -180 || longitude >= 180) { return false; }
    setTarget({ ...target, center: { latitude, longitude } });
    return true;
  };
  const [showModal, setShowModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Load initial map center from gps or vehicle data
  useEffect(() => {
    if (route.params.target) {
      setTarget(route.params.target);
      return;
    }
    const state = store.getState();
    const customerPosition = state.geolocation?.position?.coords;
    if (customerPosition) {
      const latitude = customerPosition.latitude;
      const longitude = customerPosition.longitude;
      if (setCenter(latitude, longitude)) { return; }
    }
    const vehicle = getCurrentVehicle();
    if (vehicle?.vehicleGeoPosition) {
      const latitude = vehicle.vehicleGeoPosition.latitude;
      const longitude = vehicle.vehicleGeoPosition.longitude;
      if (setCenter(latitude, longitude)) { return; }
    }
  }, []);
  const exceedsMinimumSecondsOptions: CsfDropdownItem[] = [
    '30',
    '60',
    '90',
    '120',
  ].map(o => ({
    label: t('geofencingCreate:seconds', { count: o }),
    value: o,
  }));
  const errors = validate(target ?? {}, {
    name: {
      alphanumericSpace: true,
      nameAlreadyExists: alerts
        .map(alert => alert.name)
        .filter(name => name != route.params.target?.name),
      noSpaceEnd: true,
      noSpaceStart: true,
      required: true,
    },
  });
  const hasErrors = Object.keys(errors).length != 0;
  return (
    <MgaPage noScroll title={t('geofencingLanding:title')} focusedEdit>
      <CsfView flex={1}>
        <CsfView p={16} pt={24} gap={16}>
          <CsfTile>
            <MgaLocationSelect
              label={t('geofencingCreate:chooseBoundaryCenter')}
              renderCellTitle={(item: TomTomSearchResult) =>
                item?.address?.freeformAddress
              }
              renderCellSubtitle={() => null}
              renderCellIcon={() => null}
              renderLocationCell={item => item}
              onSelectPosition={position => {
                setCenter(position.lat, position.lon);
              }}
            />
            <CsfView flexDirection="row" gap={16}>
              <CsfView flex={1}>
                {/* <CsfText>{t('geofencingCreate:sendAlert')}</CsfText> */}

                <CsfSegmentedButton
                  value={target.fenceType}
                  options={[
                    { label: t('geofencingCreate:exitsArea'), value: '1' },
                    { label: t('geofencingCreate:entersArea'), value: '0' },
                  ]}
                  onChange={(v: string) =>
                    setTarget({
                      ...target,
                      fenceType: v as GeoFence['fenceType'],
                    })
                  }
                />
              </CsfView>

              <CsfView flex={1}>
                {/* <CsfText>{t('geofencingCreate:selectShape')}</CsfText> */}
                <CsfSegmentedButton
                  value={target.shapeType}
                  options={[
                    { label: t('geofencingCreate:circle'), value: 0 },
                    { label: t('geofencingCreate:square'), value: 1 },
                  ]}
                  onChange={(v: string) =>
                    setTarget({
                      ...target,
                      shapeType: v as GeoFence['shapeType'],
                    })
                  }
                />
              </CsfView>
            </CsfView>
          </CsfTile>
        </CsfView>
        <CsfView flex={1} ph={16}>
          <MgaMarkerMap
            center={target.center}
            geofence={target}
            onMessage={action => {
              switch (action.type) {
                case 'geofence/update':
                  if (!geoFenceEquals(action.payload, target)) {
                    setTarget(action.payload);
                  }
                  break;
              }
            }}
            style={{ height: '100%' }}
          />
        </CsfView>
      </CsfView>
      <CsfView p={16} gap={12} flexDirection="row" justify="space-between">
        <MgaButton
          style={{ flex: 1 }}
          title={t('common:cancel')}
          variant="secondary"
          trackingId="GeofencingSettingCancel"
          onPress={() => navigation.pop()}
        />
        <MgaButton
          style={{ flex: 1 }}
          disabled={isLoading}
          title={t('common:next')}
          onPress={() => setShowModal(true)}
          trackingId="GeofencingSettingNext"
        />
      </CsfView>
      {showModal && (
        <CsfModal>
          <CsfView gap={24} p={16}>
            <CsfView gap={12}>
              <CsfInput
                errors={
                  showErrors &&
                  translateErrors(
                    errors.name,
                    t,
                    'geofencingCreate:validation.name',
                    'validation',
                  )
                }
                label={formatLabel({
                  rules: { required: { message: '' } },
                  name: t('geofencingCreate:nameSetting'),
                  label: t('geofencingCreate:nameSetting'),
                })}
                value={target.name}
                maxLength={40}
                onChangeText={text => setTarget({ ...target, name: text })}
              />
              <CsfSelect
                label={t('geofencingCreate:timeUntilAlert')}
                value={target.exceedMinimumSeconds}
                onSelect={value =>
                  setTarget({
                    ...target,
                    exceedMinimumSeconds: value,
                  })
                }
                options={exceedsMinimumSecondsOptions}
              />
            </CsfView>
            <CsfView gap={12}>
              <MgaButton
                title={t('geofencingCreate:saveSetting')}
                onPress={async () => {
                  setShowErrors(true);
                  if (hasErrors) {
                    return;
                  }
                  setShowModal(false);
                  setIsLoading(true);
                  const response = await geoFenceSaveAndSend(alerts, index, {
                    ...target,
                    active: true,
                  });
                  setIsLoading(false);
                  if (response.success) {
                    popIfTop(navigation, 'GeofencingSetting');
                  }
                }}
                trackingId="GeofencingSaveSetting"
              />

              <MgaButton
                title={t('common:cancel')}
                variant="link"
                onPress={() => {
                  const initialName =
                    route.params.target?.name ?? defaultGeoFence.name;
                  const initialExceedMinimumSeconds =
                    route.params.target?.exceedMinimumSeconds ??
                    defaultGeoFence.exceedMinimumSeconds;
                  setTarget({
                    ...target,
                    name: initialName,
                    exceedMinimumSeconds: initialExceedMinimumSeconds,
                  });
                  setShowModal(false);
                }}
                trackingId="GeofencingCancel"
              />
            </CsfView>
          </CsfView>
        </CsfModal>
      )}
    </MgaPage>
  );
};

export default MgaGeofencingSetting;
