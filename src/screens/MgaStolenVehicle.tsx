import React from 'react';
import { useTranslation } from 'react-i18next';
import { testID } from '../components/utils/testID';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfCard from '../components/CsfCard';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaStolenVehicle: React.FC = () => {
  const { t } = useTranslation();
  const recoverySteps = [
    t('stolenVehicle:fileAReport'),
    t('stolenVehicle:verifyYourIdentity'),
    t('stolenVehicle:verifyWithLocalAuthorities'),
    t('stolenVehicle:vehiclePlacedInStolenMode'),
  ];

  const id = testID('StolenVehicle');
  return (
    <MgaPage title={t('stolenVehicle:stolenVehicleRecoveryMode')}>
      <MgaPageContent title={t('stolenVehicle:stolenVehicleRecoveryMode')}>
        <CsfCard gap={16} pr={20}>
          <CsfText testID={id('stepsToLocateVehicle')}>
            {t('stolenVehicle:stepsToLocateVehicle')}
          </CsfText>

          <CsfBulletedList
            bullet={({ index }) => <CsfText>{index + 1}. </CsfText>}>
            {recoverySteps.map((step, i) => (
              <CsfText
                variant="body2"
                key={i}
                testID={id(`recoverySteps-${i}`)}>
                {step}
              </CsfText>
            ))}
          </CsfBulletedList>
        </CsfCard>

        <CsfView gap={16}>
          <CsfText bold testID={id('remoteServicesSuspended')}>
            {t('stolenVehicle:remoteServicesSuspended')}
          </CsfText>
          <CsfText variant="caption" testID={id('stolenVehicleLocationInfo')}>
            {t('stolenVehicle:stolenVehicleLocationInfo')}
          </CsfText>
          <CsfText variant="caption" testID={id('stolenVehicleNote')}>
            {t('stolenVehicle:stolenVehicleNote')}
          </CsfText>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaStolenVehicle;
