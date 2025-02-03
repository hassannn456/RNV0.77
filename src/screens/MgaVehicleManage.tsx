import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { navigate } from '../Controller';
import { CsfLandingMenuList } from '../components/CsfListItemLanding';
import { testID } from '../components/utils/testID';
import { featureFlagEnabled } from '../features/menu/rules';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
/** My Vehicles Screen */
const MgaVehicleManage: React.FC = () => {
  const { t } = useTranslation();
  const vehicles = useAppSelector(state => state.session?.vehicles ?? []);
  const id = testID('ManageVehicle');
  return (
    <MgaPage title={t('index:myVehicles')} bg="background" showVehicleInfoBar>
      <MgaPageContent
        title={t('index:myVehicles')}
        description={t('manageVehicle:introText')}>
        <CsfView gap={40} testID={id('listContainer')}>
          <CsfLandingMenuList
            testID={id('list')}
            items={vehicles.map(vehicle => ({
              title: vehicle.nickname,
              onPress: () => navigate('VehicleDetail', { vehicle }),
            }))}
          />
          {featureFlagEnabled('mga.myVehicle.addVin') && (
            <MgaButton
              title={t('manageVehicle:addNewVehicle')}
              onPress={() => navigate('VehicleEdit', { action: 'add' })}
              trackingId="manageVehicle:addNewVehicle"
            />
          )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaVehicleManage;
