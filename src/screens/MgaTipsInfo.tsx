import React from 'react';
import { useTranslation } from 'react-i18next';
import { CsfLandingMenuListItem } from '../components/CsfListItemLanding';
import { useAppNavigation } from '../Controller';
import { has, gen1Plus } from '../features/menu/rules';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { testID } from '../components/utils/testID';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

const MgaTipsInfo: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = getCurrentVehicle();
  const id = testID('TripsInfo');
  return (
    <MgaPage title={t('tipsInfo:title')} showVehicleInfoBar>
      <CsfView pv={24} ph={16} gap={24}>
        <CsfTile pv={0}>
          <CsfRuleList>
            <CsfLandingMenuListItem
              testID={id('howToVideos')}
              title={t('tipVideos:howToVideos')}
              onPress={() => navigation.push('HowToVideosLanding')}
            />
            <CsfLandingMenuListItem
              title={t('tipFaqs:title')}
              testID={id('title')}
              onPress={() => navigation.push('TipsFAQs')}
            />
            {has('flg:mga.bluetoothCompatibility', vehicle) && (
              <CsfLandingMenuListItem
                testID={id('bluetoothCompatibility')}
                title={t('bluetoothCompatibility:bluetoothCompatibility')}
                onPress={() => navigation.push('BluetoothCompatibility')}
              />
            )}
            {has([gen1Plus, 'sub:SAFETY']) && (
              <CsfLandingMenuListItem
                testID={id('stolenVehicleRecoveryMode')}
                title={t('stolenVehicle:stolenVehicleRecoveryMode')}
                onPress={() => navigation.push('StolenVehicle')}
              />
            )}
          </CsfRuleList>
        </CsfTile>
      </CsfView>
    </MgaPage>
  );
};

export default MgaTipsInfo;
