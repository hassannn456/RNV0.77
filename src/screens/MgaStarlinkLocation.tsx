import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { pingCurrentLocation } from '../features/geolocation/geolocation.slice';
import { useCsfColors } from '../components/useCsfColors';
import { GeolocationResponse } from '@react-native-community/geolocation';
import { MgaMarker, MgaMarkerMapRef } from '../components';
import { CsfLinkToMapApp } from '../components/CsfMapLink';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaMarkerMap from '../components/MgaMarkerMap';
import MgaPage from '../components/MgaPage';
import MgaVehicleInfoBar from '../components/MgaVehicleInfoBar';

const MgaStarlinkLocation: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const [fitBounds, setFitBounds] = useState<boolean>(false);
  const [gpsPosition, setGPSPosition] = useState<GeolocationResponse | null>(
    null,
  );
  const markers: MgaMarker[] = [];
  const carPosition = vehicle?.vehicleGeoPosition;
  if (carPosition) {
    markers.push({
      latitude: carPosition.latitude,
      longitude: carPosition.longitude,
      symbolText: '\u{E939}',
      type: 'car',
    });
  }
  if (gpsPosition) {
    markers.push({
      latitude: gpsPosition.coords.latitude,
      longitude: gpsPosition.coords.longitude,
      symbolText: '\u{E94c}',
      type: 'user',
      symbolBackgroundColor: colors.success,
    });
  }
  const mapRef = useRef<MgaMarkerMapRef>(null);
  return (
    <MgaPage noScroll title={t('starlinkLocation:title')}>
      <MgaVehicleInfoBar />
      <MgaMarkerMap
        markers={markers}
        ref={mapRef}
        center={carPosition && !fitBounds ? carPosition : null}
        style={{ flex: 1, borderRadius: 0 }}
      />
      <CsfView
        flexDirection="column"
        gap={8}
        style={{ zIndex: 1, position: 'absolute', bottom: 40, right: 16 }}>
        <MgaButton
          aria-label="Get Current Location"
          trackingId="LocateVehiclePingCurrentLocationButton"
          width={44}
          icon="Male"
          onPress={async () => {
            const gps = await pingCurrentLocation();
            if (gps?.position) {
              setGPSPosition(gps.position);
              setFitBounds(true);
              mapRef.current?.fitMapBounds(markers, true);
            } else {
              setGPSPosition(null);
            }
            if (gps?.error) {
              CsfSimpleAlert(
                t('starlinkLocation:unableToLocate'),
                t('starlinkLocation:unableToGetYourCurrentLocation'),
                { type: 'error' },
              );
            }
          }}
        />
        <MgaButton
          trackingId="LocateVehicleButton"
          width={44}
          icon="SendToVehicle"
          onPress={() => {
            setFitBounds(false);
          }}
        />
        {carPosition && (
          <MgaButton
            trackingId="LocateVehicleSendToMapsButton"
            width={44}
            icon="BackForwardArrow"
            onPress={() => {
              const ok = CsfLinkToMapApp(
                carPosition,
                gpsPosition,
                vehicle?.nickname,
              );
              if (!ok) {
                CsfSimpleAlert(
                  t('common:error'),
                  t('starlinkLocation:unableToLaunchNavigation'),
                  { type: 'error' },
                );
              }
            }}
          />
        )}
      </CsfView>
    </MgaPage>
  );
};

export default MgaStarlinkLocation;
