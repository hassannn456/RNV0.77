/* eslint-disable react/no-unstable-nested-components */

import React, { useLayoutEffect } from 'react';
import {
  MgaNavigationFunction,
  useAppNavigation,
  useAppRoute,
} from '../Controller';
import { getMenuChildren, getMenuItem, MenuItem } from '../utils/menu';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import {
  getCurrentVehicle,
  useCurrentVehicle,
} from '../features/auth/sessionSlice';
import { alertNotInDemo, canDemo } from '../features/demo/demo.slice';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { csfThemes } from '../components/useCsfColors';
import Chevron from '../../content/svg/mga/back_forward_arrow.svg';
import i18n from '../i18n';
import { mgaLoadShortcuts } from '../components/utils/shortcuts';
import { testID } from '../components/utils/testID';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfTableViewCell from '../components/CsfTableViewCell';
import CsfText from '../components/CsfText';
import { CsfThemeContext } from '../components/CsfThemeContext';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import useTracking from '../components/useTracking';
import mgaOpenURL from '../components/utils/linking';

export const MenuStyles = StyleSheet.create({
  myVehicleStyle: {
    marginBottom: 16, //  this may be the only place an actual margin is called for?
  },
});
const MgaMenus: React.FC = () => {
  const { trackButton } = useTracking();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const route = useAppRoute<'Menu'>();
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const isDemo = useAppSelector(s => s.demo);
  const items = getMenuChildren(route.params?.id, vehicle);
  const phMenu = 16;
  const isSubmenu = !!route.params?.id;
  const { width } = useWindowDimensions();
  const maxWidth = width - 140;

  useLayoutEffect(() => {
    const trackingId = 'Menu';
    const derivedTestID = testID(trackingId);
    // const submenu = !!route.params?.id
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerBackVisible: isSubmenu,
      headerRight: () => (
        <CsfThemeContext.Provider value="dark">
          <MgaButton
            trackingId="MenuCloseButton"
            icon="Close"
            onPress={closeMenu}
            size="lg"
            variant="inlineLink"
          />
        </CsfThemeContext.Provider>
      ),
      // Added this as to show the back arrow in android
      headerLeft: () => <CsfThemeContext.Provider value="dark" />,
      headerTitle: props => (
        <CsfView
          {...props}
          width={maxWidth}
          align="center"
          justify="center"
          testID={derivedTestID('heading')}>
          <CsfText color="light" variant="heading" numberOfLines={1}>
            {isSubmenu
              ? t(getMenuItem(route.params.id)?.i18n ?? 'Submenu')
              : 'Menu'}
          </CsfText>
        </CsfView>
      ),
      headerTitleStyle: isSubmenu
        ? { color: csfThemes.dark.copyPrimary }
        : { color: csfThemes.dark.clear },
    });
  }, []);
  const isDisabled = (item: MenuItem): boolean => {
    if (!isDemo) { return false; }
    if (item.type == 'screen') { return !canDemo(item.screen); }
    if (item.type == 'menu') {
      return !getMenuChildren(item.menu, vehicle).some(
        subitem => !isDisabled(subitem),
      );
    }
    return false;
  };
  /**
   * Fired from menu close button.
   *
   * Pop to first non-menu screen.
   **/
  const closeMenu = () => {
    const names = navigation.getState().routes.map(s => s.name);
    const index = (() => {
      for (let i = names.length - 1; i >= 0; i--) {
        const name = names[i];
        if (name != 'Menu') {
          return i;
        }
      }
      return -1;
    })();
    const count = names.length - index - 1;
    if (count <= 0) {
      return;
    }
    navigation.pop(count);
  };
  const onSelect = async (item: MenuItem) => {
    if (isDisabled(item)) {
      await alertNotInDemo();
      return;
    }
    switch (item.type) {
      case 'menu': {
        navigation.push('Menu', { id: item.menu });
        break;
      }
      case 'screen': {
        if (item.screen == 'Login') {
          dispatch({ type: 'demo/end' });
          dispatch({ type: 'session/setLogin', payload: false });
          dispatch({ type: 'keychain/clearSessionId' });
          mgaLoadShortcuts(null);
        }

        const routes = navigation.getState().routes;
        const firstMenuIndex = routes.findIndex(route => route.name === 'Menu');
        const menus = routes.length - firstMenuIndex;
        if (
          routes.length == 0 ||
          routes[firstMenuIndex - 1].name != item.screen
        ) {
          navigation.pop(menus);
          navigation.push(item.screen);
        } else {
          navigation.pop(menus);
        }

        break;
      }
      case 'url': {
        await mgaOpenURL(t(item.url));
        break;
      }
      case 'custom': {
        // TODO: Custom behavior
        break;
      }
    }
  };
  return (
    <CsfThemeContext.Provider value={'dark'}>
      <MgaPage bg={'backgroundSecondary'} style={{ padding: 0 }}>
        <CsfThemeContext.Provider value={isSubmenu ? 'system' : 'dark'}>
          <CsfView
            bg="backgroundSecondary"
            style={{ minHeight: '100%', paddingTop: isSubmenu ? 32 : 0 }}>
            {items
              .filter(item => item.displayMeta != 'footer')
              .map(item => {
                const title = item?.i18n ?? '';
                const disabled = isDisabled(item);
                const isMyVehicles =
                  item.type == 'screen' && item.screen == 'MyVehicles';
                const trackingId = `Menu-${title}`;
                const derivedTestID = testID(trackingId);
                return (
                  <CsfTableViewCell
                    testID={derivedTestID()}
                    key={title}
                    onPress={() => {
                      void trackButton({
                        trackingId,
                        title: t(title),
                      });
                      void onSelect(item);
                    }}
                    ph={phMenu}
                    pv={16}
                    bg={isMyVehicles ? 'rule' : 'backgroundSecondary'}
                    bgPressed={isMyVehicles ? 'backgroundSecondary' : 'rule'}
                    style={isMyVehicles ? { marginBottom: 16 } : undefined}>
                    {isMyVehicles ? (
                      <CsfView pv={12}>
                        <CsfText
                          variant="body2"
                          testID={derivedTestID('label')}>
                          {t('index:myVehicle')}
                        </CsfText>
                        <CsfText
                          color="copyPrimary"
                          variant="heading2"
                          testID={derivedTestID('nickname')}>
                          {vehicle
                            ? vehicle.nickname
                            : t('common:loadingVehicle')}
                        </CsfText>
                      </CsfView>
                    ) : (
                      <CsfView
                        flex={1}
                        testID={derivedTestID('myVehicleNickname')}>
                        <CsfText
                          testID={derivedTestID('label')}
                          color={disabled ? 'copySecondary' : 'copyPrimary'}
                          variant="display3"
                          numberOfLines={1}>
                          {t(title, { defaultValue: title })}
                        </CsfText>
                      </CsfView>
                    )}
                    {(item.type == 'menu' || isMyVehicles) && (
                      <Chevron
                        fill={csfThemes.dark.copySecondary}
                        width={24}
                        height={24}
                      />
                    )}
                  </CsfTableViewCell>
                );
              })}

            {!isSubmenu && <CsfView height={36} justify="center" />}

            {items
              .filter(item => {
                return item.displayMeta === 'footer';
              })
              .map(item => {
                const isExitDemo =
                  isDemo && item.type == 'screen' && item.screen == 'Login';
                const title = isExitDemo
                  ? 'home:exitDemoMode'
                  : item?.i18n ?? '';
                // const disabled = isDisabled(item) // new styles use former disabled colors
                const isMyVehicles =
                  item.type == 'screen' && item.screen == 'MyVehicles';

                const trackingId = `Menu-${title}`;
                const derivedTestID = testID(trackingId);
                return (
                  <CsfTableViewCell
                    key={title}
                    testID={derivedTestID()}
                    onPress={() => {
                      void trackButton({
                        trackingId,
                        title: t(title),
                      });

                      void onSelect(item);
                    }}
                    ph={phMenu}
                    bg={isMyVehicles ? 'rule' : 'backgroundSecondary'}
                    bgPressed={isMyVehicles ? 'backgroundSecondary' : 'rule'}>
                    <CsfText
                      color="copySecondary"
                      variant="body2"
                      numberOfLines={1}
                      testID={derivedTestID('label')}>
                      {t(title, { defaultValue: title })}
                    </CsfText>

                    {item.type == 'menu' && (
                      <Chevron
                        fill={csfThemes.dark.copySecondary}
                        width={24}
                        height={24}
                      />
                    )}
                  </CsfTableViewCell>
                );
              })}
          </CsfView>
        </CsfThemeContext.Provider>
      </MgaPage>
    </CsfThemeContext.Provider>
  );
};

/** Navigation redirect for vehicle not provisioned. */
export const alertIfVehicleNotProvisioned: MgaNavigationFunction = (
  ..._args
) => {
  const { t } = i18n;
  const vehicle = getCurrentVehicle();
  if (vehicle?.provisioned) {
    return false;
  } else {
    CsfSimpleAlert(
      t('common:alert'),
      t('home:functionUnexpected', {
        modelName: vehicle?.modelName,
      }),
      {
        type: 'warning',
      },
    );
    return true;
  }
};
/** Navigation redirect for vehicle stolen  */
export const alertIfVehicleStolen: MgaNavigationFunction = (..._args) => {
  const { t } = i18n;
  const vehicle = getCurrentVehicle();
  if (vehicle?.stolenVehicle) {
    CsfSimpleAlert(t('common:alert'), t('home:vehicleReportedStolen'), {
      type: 'warning',
    });
    return true;
  } else {
    return false;
  }
};

export default MgaMenus;
