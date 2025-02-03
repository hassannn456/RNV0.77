/* eslint-disable eol-last */
/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
// cSpell:ignore valetmodePwReset1, toresetValetPasscode, valetmodePwResetGuide, valetmodePwResetEnterNewPass
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import PasscodeBackground from '../../../content/jpg/valet-mode-bg.jpg'
import { ImageBackground } from 'react-native';
import { currentVehicleReducer } from '../../features/auth/sessionSlice';
import { store } from '../../store';
import { valetPasscode } from '../../features/profile/securitysettings/valetPasscodeReset/valetPasscodeResetApi';
import { vehicleApi } from '../../api/vehicle.api';
import { disableValetMode } from '../../features/remoteService/valetMode';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaVehicleInfoBar from '../../components/MgaVehicleInfoBar';
import MgaValetPasscode from './MgaValetPasscode';

const MgaValetPasscodeReset: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('1');
  const valetPasscodeReset = async (pin?: string) => {
    const vin = currentVehicleReducer(store.getState())?.vin || '';
    if (!pin) {
      return;
    }
    const valetStatusResult = vehicleApi.endpoints.vehicleValetStatus.select({
      vin: vin,
    })(store.getState());
    const valetStatus = valetStatusResult.data?.data ?? 'NO_RECORDS';
    if (valetStatus == 'VAL_ON') {
      await disableValetMode({ valetOn: false, pin, vin: vin });
    }
    const response = await valetPasscode({ pin, vin: vin });
    if (response.data?.success) {
      setCurrentScreen('5');
    } else {
      setCurrentScreen('3');
    }
  };

  const { t } = useTranslation();
  const id = testID('ValetPasscodeReset');
  return (
    <MgaPage noScroll={true} title={t('valetMode:valetModeSetup')}>
      <MgaVehicleInfoBar />
      {currentScreen == '1' && (
        <ImageBackground
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // source={PasscodeBackground}
          style={{ width: '100%', height: '100%' }}>
          <MgaValetPasscode
            screen="1"
            testID={id('resetValetPasscode')}
            onConfirm={() => setCurrentScreen('2')}
            title={t('valetMode:valetModeReset.valetmodePwReset1')}
            buttonLabel={t('valetMode:valetModeReset.getStarted')}
            subTitle={t('valetMode:valetModeReset.toresetValetPasscode')}
            showConfirmButton={true}
          />
        </ImageBackground>
      )}
      {currentScreen == '2' && (
        <MgaValetPasscode
          screen="2"
          testID={id('readyToSendCommand')}
          onConfirm={() => setCurrentScreen('3')}
          onCancel={() => setCurrentScreen('1')}
          showCancelButton={true}
          showConfirmButton={true}
          title={t('valetMode:valetModeReset.valetmodePwReset1')}
          subTitle={t('valetMode:valetModeReset.readyToSendCommand')}
          buttonLabel={t('common:continue')}
        />
      )}
      {currentScreen == '3' && (
        <MgaValetPasscode
          screen="3"
          testID={id('enterYourPin')}
          onConfirm={async (pin?: string) => {
            setCurrentScreen('4'), await valetPasscodeReset(pin);
          }}
          onCancel={() => setCurrentScreen('1')}
          showCancelButton={true}
          showConfirmButton={true}
          title={t('valetMode:valetModeReset.valetmodePwReset1')}
          subTitle={t('valetMode:valetModeReset.valetmodePwResetGuide')}
          buttonLabel={t('valetMode:valetModeReset.enterYourPin')}
        />
      )}
      {currentScreen == '4' && (
        <MgaValetPasscode
          screen="4"
          testID={id('passwordInfo')}
          title={t('valetMode:valetModeReset.valetmodePwReset1')}
          subTitle={t('valetMode:valetModeReset.valetmodePwResetGuide')}
        />
      )}
      {currentScreen == '5' && (
        <MgaValetPasscode
          screen="5"
          testID={id('finished')}
          title={t('valetMode:valetModeReset.valetmodePwReset1')}
          subTitle={t('valetMode:valetModeReset.valetmodePwResetEnterNewPass')}
          buttonLabel={t('valetMode:valetModeReset.finished')}
          showConfirmButton={true}
        />
      )}
    </MgaPage>
  );
};


export default MgaValetPasscodeReset;