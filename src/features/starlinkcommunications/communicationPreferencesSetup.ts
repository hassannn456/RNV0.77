import { selectVehicleAccountAttribute } from '../../api/userAttributes.api';
import { MgaNavigationFunction, navigationRef } from '../../Controller';
import { getStartupProperty } from '../admin/admin.api';
import { getCurrentVehicle } from '../auth/sessionSlice';
import { has } from '../menu/rules';

export const redirectIfPreferenceNotConfigured: MgaNavigationFunction = (
  ...args
) => {
  // TODO:AG:20240911 remove this check after 3.0.6 release
  const c25Preferences = getStartupProperty('c25Preferences');

  if (!c25Preferences) {return false;}
  if (args[1] && args[1].skipSetup === true) {
    navigationRef.navigate(...args);
    return true;
  }

  const firstTimeCompleted = selectVehicleAccountAttribute(
    'communicationPreferences.firstTime',
  );

  if (firstTimeCompleted) {
    return false; // move along
  }

  const vehicle = getCurrentVehicle();
  if (vehicle) {
    if (has('cap:g1', vehicle)) {return false;} // CVCON-2538
    // add code to check user attributes for first time experience
    // also check flag
    const introPreference = true;
    if (introPreference) {
      // First time experience
      navigationRef.navigate('CommunicationPreferencesIntro');
      return true;
    } else {
      return false;
    }
  }
  return false;
};
