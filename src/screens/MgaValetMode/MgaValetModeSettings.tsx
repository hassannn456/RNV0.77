/* eslint-disable eol-last */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../../Controller';
import { testID } from '../../components/utils/testID';
import MgaHeroPage from '../../components/MgaHeroPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaButton from '../../components/MgaButton';

const MgaValetModeSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ValetModeSettings'>();
  const valetSetupScreens = route.params.setupScreenKeys;

  const id = testID('ValetModeSettings');
  return (
    <MgaHeroPage
      showVehicleInfoBar={true}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      heroSource={require('../../../content/png/valet-mode-setting-hero.png')}
      title={t('valetMode:valetMode')}>
      <CsfView ph={16} pv={40}>
        <CsfView gap={4} pv={8}>
          <CsfText
            align="center"
            variant="subheading"
            color="copySecondary"
            testID={id('welcome')}>
            {t('valetMode:welcome')}
          </CsfText>
          <CsfText align="center" variant="title2" testID={id('valetMode')}>
            {t('valetMode:valetMode')}
          </CsfText>
        </CsfView>
        <CsfView gap={8}>
          <CsfText align="center" variant="body2" testID={id('introduction')}>
            {t('valetMode:introduction')}
          </CsfText>
          <MgaButton
            trackingId="ValetGoToSetupButton"
            title={t('valetMode:goToSetUp')}
            variant="primary"
            onPress={() => {
              navigation.push('ValetModeSetPasscode', {
                setupStepsCount: 2,
                currentStepIndex: 1,
                setupScreenKeys: valetSetupScreens,
              });
            }}
          />
        </CsfView>
      </CsfView>
    </MgaHeroPage>
  );
};

export default MgaValetModeSettings;