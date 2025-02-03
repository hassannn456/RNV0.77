import React from 'react';
import { useTranslation } from 'react-i18next';
import { pushIfNotTop, useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import CsfAppIcon from './CsfAppIcon';
import CsfPressable from './CsfPressable';
import CsfText from './CsfText';
import CsfView from './CsfView';
import useTracking from './useTracking';
import { testID } from './utils/testID';

const MgaVehicleInfoBar: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { trackButton } = useTracking();

  const id = testID('VehicleInfoBar');
  return (
    <CsfPressable
      onPress={() => {
        trackButton({
          title: 'Vehicle Info Bar',
          trackingId: 'VehicleInfoBarButton',
        });
        pushIfNotTop(navigation, 'VehicleInformation');
      }}>
      <CsfView
        testID={id()}
        bg="backgroundSecondary"
        theme="dark"
        ph={16}
        minHeight={44}
        align="center"
        flexDirection="row"
        justify="space-between">
        <CsfText color="copyPrimary" variant="heading2" testID={id('label')}>
          {vehicle ? vehicle.nickname : t('common:loadingVehicle')}
        </CsfText>
        <CsfAppIcon color="button" icon="Information" />
      </CsfView>
    </CsfPressable>
  );
};

export default MgaVehicleInfoBar;
