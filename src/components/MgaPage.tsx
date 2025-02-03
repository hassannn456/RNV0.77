/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable eol-last */
import React, { useEffect } from 'react';
import { ScreenList, useAppNavigation, useAppRoute } from '../Controller';
import { BackHandler } from 'react-native';
import CsfFocusedEdit from './CsfFocusedEdit';
import MgaVehicleInfoBar from './MgaVehicleInfoBar';
import CsfPage, { CsfPageProps } from './CsfPage';

export interface MgaPageProps extends CsfPageProps {
  trackingId?: keyof ScreenList
  showVehicleInfoBar?: boolean
  focusedEdit?: boolean
  disableHardwareBack?: boolean
}

const MgaPage: React.FC<MgaPageProps> = ({
  focusedEdit,
  showVehicleInfoBar,
  disableHardwareBack,
  ...csfPageProps
}): JSX.Element => {
  const navigation = useAppNavigation();
  const route = useAppRoute();
  const routeName = route.name;

  useEffect(() => {
    const backAction = () => {
      return disableHardwareBack;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: csfPageProps.title,
    });
  }, [csfPageProps.title, navigation]);
  return focusedEdit ? (
    <CsfFocusedEdit {...csfPageProps} testID={routeName} />
  ) : (
    <CsfPage
      {...csfPageProps}
      testID={routeName}
      bg={csfPageProps.bg || 'background'}
      stickyHeader={
        showVehicleInfoBar
          ? () => <MgaVehicleInfoBar />
          : csfPageProps.stickyHeader
      }
      title={csfPageProps.title}
    />
  );
};


export default MgaPage;