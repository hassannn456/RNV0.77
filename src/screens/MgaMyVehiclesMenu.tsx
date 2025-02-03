// cSpell:ignore VEHICLESETUPERROR
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { NormalResult } from '../../@types';
import { executeConditionalPromptChain } from '../utils/controlFlow';
import {
  setPinPromptReturningUser,
  setPinPromptSwitchVehicle,
} from './MgaSetPin';
import { selectVehicle } from '../api/account.api';
import { useAppNavigation } from '../Controller';
import { CsfRadioButtonRing } from '../components/CsfRadioButton';
import { testID } from '../components/utils/testID';
import { loadVehicleAccountAttributes } from '../api/userAttributes.api';
import { ConditionalPrompt } from '../utils/controlFlow';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import CsfRule from '../components/CsfRule';
import CsfTableViewCell from '../components/CsfTableViewCell';
import CsfText from '../components/CsfText';
import { CsfThemeContext } from '../components/CsfThemeContext';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

/** A list of conditional prompts that trigger post-login  */
const conditionalPrompts: Array<ConditionalPrompt> = [
  //TODO:UA:20241211 Add non-auth related prompts i.e: Emergency Contact and T&C
  // PIN set up prompt for New Vehicle User
  setPinPromptSwitchVehicle,
  // PIN set up prompt for Returning Vehicle User
  setPinPromptReturningUser,
];

/** My Vehicles Screen */
const MgaMyVehicles: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicles = useAppSelector(state => state.session?.vehicles ?? []);
  const selected = useAppSelector(
    state => state.session?.currentVehicleIndex ?? -1,
  );
  const [loading, setLoading] = useState('');
  const selectRequest = async (vin: string) => {
    if (loading) {
      return;
    }
    const previousVin = vehicles[selected].vin;
    if (vin != previousVin) {
      setLoading(vin); // Show spinner

      const response = await selectVehicle({ vin });
      if (response.success) {
        void (await loadVehicleAccountAttributes());
        try {
          await executeConditionalPromptChain(conditionalPrompts);
          // Execute prompts succeeded.
        } catch (error: any) {
          const errorResponse = error as NormalResult<any>;
          // Execute prompts threw. Override `response` with `error` so the caller redirects back to the Login screen.
          if (errorResponse.errorCode == 'cancelled') {
            // revert back to the old vin
            await selectVehicle({ vin: previousVin });
          }
        }
        navigation.popToTop();
      } else {
        if (response.errorCode == 'VEHICLESETUPERROR') {
          navigation.popToTop();
        }
      }
    }
    setLoading(''); // Hide spinner
  };
  const id = testID('Vehicles');
  return (
    <MgaPage title={t('index:myVehicles')}>
      <CsfThemeContext.Provider value={'system'}>
        <CsfTableViewCell
          ph={24}
          pv={32}
          key="updateInfo"
          testID={id('updateMyVehicle')}
          onPress={() => {
            navigation.push('ManageVehicle');
          }}>
          <CsfText variant="display3" numberOfLines={1} testID={id('title')}>
            {t('manageVehicle:title')}
          </CsfText>
        </CsfTableViewCell>
        <CsfRule inset={24} />
        <CsfView pt={8}>
          {vehicles.map((vehicle, index) => (
            <CsfTableViewCell
              ph={24}
              pv={16}
              testID={id(`vehicle-${index}`)}
              key={vehicle.vin}
              onPress={() => selectRequest(vehicle.vin)}>
              <CsfView flexDirection="row" gap={16}>
                {loading == vehicle.vin ? (
                  <CsfActivityIndicator size={24} />
                ) : selected == index ? (
                  <CsfRadioButtonRing checked={true} />
                ) : (
                  <CsfRadioButtonRing checked={false} />
                )}

                <CsfText
                  variant="display3"
                  numberOfLines={1}
                  testID={id('nicknameLabel')}
                  ellipsizeMode="tail">
                  {vehicle.nickname?.trim()}
                </CsfText>
              </CsfView>
            </CsfTableViewCell>
          ))}
        </CsfView>
      </CsfThemeContext.Provider>
    </MgaPage>
  );
};

export default MgaMyVehicles;
