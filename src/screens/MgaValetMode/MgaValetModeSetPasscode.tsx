import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, ScreenList, useAppRoute } from '../../Controller';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfCard from '../../components/CsfCard';
import MgaButton from '../../components/MgaButton';
import CsfView from '../../components/CsfView';
import { CsfProgressDots } from '../../components/CsfProgressDots';


export interface ValetModeSetupParams {
  setupStepsCount: number
  currentStepIndex: number
  setupScreenKeys: Array<keyof ScreenList>
}

const MgaValetModeSetPasscode: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ValetModeSetPasscode'>();
  const valetSetupScreens = route.params.setupScreenKeys;

  return (
    <MgaPage noScroll showVehicleInfoBar title={t('valetMode:setPasscode')}>
      <MgaPageContent title={t('valetMode:setup.step1')}>
        <CsfCard
          gap={16}
          title={t('valetMode:setup.introTitle')}
          subtitle={t('valetMode:setup.introDescription')}>
          <MgaButton
            trackingId="ValetGoToResetButton"
            title={t('valetMode:setup.goToReset')}
            variant="secondary"
            onPress={() => {
              navigation.push('ValetPasscodeReset');
            }}
          />
        </CsfCard>

        <CsfView>
          <MgaButton
            trackingId="ValetGoToSpeedAlertsButton"
            title={t('valetMode:setup.goToSpeedAlerts')}
            variant="primary"
            onPress={() => {
              navigation.push('ValetModeSetSpeedAlerts', {
                setupStepsCount: 2,
                currentStepIndex: 1,
                setupScreenKeys: valetSetupScreens,
              });
            }}
          />
          <CsfProgressDots count={2} index={0} variant="classic" />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaValetModeSetPasscode;
