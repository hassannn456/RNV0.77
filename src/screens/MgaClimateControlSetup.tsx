import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaHeroPage from '../components/MgaHeroPage';

const MgaClimateControlSetup: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  const id = testID('ClimateControlPreset');

  return (
    <MgaHeroPage
      theme="dark"
      showVehicleInfoBar={true}
      heroSource={require('../../content/png/res-bg.png')}
      title={t('resPresets:resPresets')}>
      <CsfView ph={16} pv={40}>
        <CsfView gap={4} pv={8}>
          <CsfText
            align="center"
            variant="title2"
            testID={id('welcomeToClimateControl')}>
            {t('resPresets:welcomeToClimateControl')}
          </CsfText>
        </CsfView>
        <CsfView gap={16}>
          <CsfText
            align="center"
            variant="body2"
            testID={id('climateControlText')}>
            {t('resPresets:climateControlText')}
          </CsfText>
          <MgaButton
            title={t('resPresets:enterClimateControl')}
            trackingId="EnterClimateControl"
            variant="primary"
            onPress={() => {
              navigation.navigate('ClimateControl', {
                skipSetup: true,
              });
            }}
          />
        </CsfView>
      </CsfView>
    </MgaHeroPage>
  );
};

export default MgaClimateControlSetup;