/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ViewProps } from 'react-native';
import { WebView } from 'react-native-webview';
import CsfView from './CsfView';
// import { MgaMarkerMapHtml } from '../../build/html'
import { useAppSelector } from '../store';
import { GeoFence } from '../features/alerts/boundaryAlert.api';
import { LocateResponseData } from '../../@types';
import { useTranslation } from 'react-i18next';
import { convertUnits } from '../utils/units';

export interface MgaMarker {
  symbolText?: string
  symbolTextFontSize?: number
  symbolBackgroundColor?: string
  type?: 'car' | 'user' | 'candidate' | 'destination'
  id?: number
  latitude: number
  longitude: number
}

interface MgaMarkerMapActionGeofenceUpdate {
  type: 'geofence/update'
  payload: GeoFence
}

interface MgaMarkerMapActionLog {
  type: 'webView/log'
  payload: {
    level: 'log' | 'warn' | 'error'
    message: string
  }
}

interface MgaMarkerMapWebViewReady {
  type: 'webView/ready'
  payload: any
}

interface MgaMarkerMapReady {
  type: 'map/ready'
  payload: any
}

interface MgaMarkerMapMarkerPressed {
  type: 'marker/pressed'
  payload: { index: number }
}

type MgaMarkerMapAction =
  | MgaMarkerMapActionGeofenceUpdate
  | MgaMarkerMapActionLog
  | MgaMarkerMapReady
  | MgaMarkerMapWebViewReady
  | MgaMarkerMapMarkerPressed

interface MgaMarkerMapProps extends ViewProps {
  markers?: MgaMarker[]
  center?: { latitude: number; longitude: number } | null
  geofence?: GeoFence
  route?: LocateResponseData[]
  /**
   * Show Street | Satellite toggle over map.
   *
   * Defaults to true (visible).
   **/
  showLayerSwitch?: boolean
  /**
   * Set explicit zoom.
   *
   * This will overwrite bounding box calcs based on markers.
   **/
  zoom?: number
  onMessage?: (message: MgaMarkerMapAction) => void
}

const isBadMarker = (marker: MgaMarker | null): boolean => {
  return !marker || !marker.latitude || !marker.longitude;
};

export interface MgaMarkerMapRef {
  setWebRef: (payload: object) => void
  fitMapBounds: (markers: MgaMarker[], animate: boolean) => void
}

/** Map view with props for location and markers */
const MgaMarkerMap = forwardRef<MgaMarkerMapRef, MgaMarkerMapProps>(
  (
    {
      markers,
      center,
      geofence,
      route,
      showLayerSwitch,
      zoom,
      onMessage,
      ...viewProps
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const tomtomKey = useAppSelector(s => s.session?.tomtomKey);
    const webRef = useRef<WebView>(null);
    const [webViewKey, setWebViewKey] = useState(0);
    const [webViewReady, setWebViewReady] = useState(false);
    const userUnits = t('units:distance');
    const distanceUnits = {
      label: `{{value}} ${userUnits}`,
      meters: convertUnits(1, userUnits, 'm'),
    };
    useEffect(() => {
      if (markers && markers.length > 0) {
        reloadWebView();
      }
    }, [markers]);

    // Function to reload the webview to show updated markers
    const reloadWebView = () => {
      setWebViewKey(prevKey => prevKey + 1);
    };

    const setWebRef = (payload: object & Partial<MgaMarkerMapProps>) => {
      if (webRef.current && webViewReady) {
        let _payload = payload;

        if (_payload.markers) {
          if (_payload.markers.find(isBadMarker)) {
            _payload = {
              ..._payload,
              markers: _payload.markers.filter(m => !isBadMarker(m)),
            };
          }
        }

        webRef.current.injectJavaScript(
          `set && set(${JSON.stringify(_payload)})`,
        );
      } else {
        setTimeout(() => {
          setWebRef(payload);
        }, 1);
      }
    };
    const fitMapBounds = (markers: MgaMarker[], animate: boolean) => {
      if (webRef.current) {
        webRef.current.injectJavaScript(
          `fitMapBounds && fitMapBounds(${JSON.stringify(
            markers,
          )}, ${JSON.stringify(animate)})`,
        );
      } else {
        setTimeout(() => {
          fitMapBounds(markers, animate);
        }, 1);
      }
    };
    useImperativeHandle(ref, () => ({
      setWebRef,
      fitMapBounds,
    }));
    // Re-send data to map on shape / fence change
    useEffect(() => {
      setWebRef({
        key: tomtomKey,
        center: center,
        markers: markers ?? [],
        geofence: geofence,
        route: route,
        showLayerSwitch,
        distanceUnits,
        zoom: zoom,
      });
    }, [center, geofence, markers, route, zoom, setWebRef, tomtomKey]);
    return (
      <CsfView
        {...viewProps}
        style={[
          {
            alignSelf: 'stretch',
            alignItems: 'stretch',
            borderRadius: 8,
            overflow: 'hidden',
          },
          viewProps.style,
        ]}>
        <WebView
          containerStyle={{ margin: 0 }}
          originWhitelist={['*']}
          ref={webRef}
          key={webViewKey}
          onLoad={_ => {
            if (tomtomKey) {
              setWebRef({
                key: tomtomKey,
                center: center,
                markers: markers ?? [],
                geofence: geofence,
                distanceUnits,
                route,
                showLayerSwitch,
                zoom,
              });
            }
          }}
          onMessage={event => {
            // MGA-1500 - persist() is not guaranteed to be defined on Android
            if (event.persist) event.persist();
            try {
              const action = JSON.parse(
                event.nativeEvent.data,
              ) as MgaMarkerMapAction;
              switch (action.type) {
                case 'webView/log':
                  // eslint-disable-next-line
                  const logger =
                    (action.payload.level == 'error' && console.error) ||
                    (action.payload.level == 'warn' && console.warn) ||
                    console.log;
                  logger(
                    `[map ${action.payload.level}] :: ${action.payload.message}`,
                  );
                  break;
                case 'webView/ready':
                  setWebViewReady(true);
                  break;
              }
              if (onMessage) {
                onMessage(action);
              }
            } catch {
              console.error(
                `WebView returned ${event.nativeEvent.data} which cannot be parsed.`,
              );
            }
          }}
        // source={{
        //   html: MgaMarkerMapHtml,
        //   baseUrl: '',
        // }}
        />
      </CsfView>
    );
  },
);

export default MgaMarkerMap;