import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useTextOptOutMutation } from '../api/profile.api';
import { formatPhone } from '../utils/phone';
import promptAlert from '../components/CsfAlert';
import { CsfCheckBox } from '../components/CsfCheckbox';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaTextOptOut: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [disclaimer, setDisclaimer] = useState(false);
  const cellularPhone =
    useCurrentVehicle()?.customer.sessionCustomer?.cellularPhone;
  const [textOptOut, networkStatus] = useTextOptOutMutation();
  return (
    <MgaPage title={t('textOptOut:title')} showVehicleInfoBar>
      {cellularPhone ? (
        <MgaPageContent title={t('textOptOut:title')}>
          <CsfText>{t('textOptOut:advisory')}</CsfText>

          <CsfTile>
            <CsfText>{t('textOptOut:phoneNumber')}</CsfText>
            <CsfText>{formatPhone(cellularPhone)}</CsfText>
          </CsfTile>

          <CsfCheckBox
            label={t('textOptOut:disclaimer')}
            checked={disclaimer}
            onChangeValue={setDisclaimer}
          />
          <MgaButton
            isLoading={networkStatus.isLoading}
            title={t('common:submit')}
            disabled={!disclaimer}
            onPress={async () => {
              const response = await textOptOut(undefined).unwrap();
              if (response.success) {
                const _ = await promptAlert(
                  t('common:success'),
                  t('textOptOut:processCompletedSuccessfully'),
                );
                popIfTop(navigation, 'TextOptOut');
              } else {
                await promptAlert(
                  t('common:error'),
                  t('textOptOut:processingError'),
                );
              }
            }}
          />
        </MgaPageContent>
      ) : (
        <MgaPageContent title={t('textOptOut:title')}>
          <CsfText>{t('textOptOut:noPhone')}</CsfText>
        </MgaPageContent>
      )}
    </MgaPage>
  );
};

export default MgaTextOptOut;
