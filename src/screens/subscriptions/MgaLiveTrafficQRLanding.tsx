// cSpell:ignore Doesnt
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { ScreenList, useAppNavigation } from '../../Controller';
import {
  manageEnrollmentApi,
  useGetTrafficConnectPricingNoTrialQuery,
} from '../../api/manageEnrollment.api';
import { canAccessScreen } from '../../utils/menu';
import { formatCurrencyForBilling } from '../../utils/subscriptions';
import { has } from '../../features/menu/rules';
import { ClientSessionVehicle } from '../../../@types';
import { store } from '../../store';
import { testID } from '../../components/utils/testID';
import MgaHeroPage from '../../components/MgaHeroPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaButton from '../../components/MgaButton';

/**
 * Because screen is pushed from QR code,
 * Check access on load and push proper screen instead
 * If vehicle doesn't have live traffic capability
 * return `null`, which will navigate to Dashboard and show an Error message
 **/
export const validateTomTomNavigation = async (
  vehicle: ClientSessionVehicle,
): Promise<keyof ScreenList | null> => {
  if (!canAccessScreen('LiveTrafficQRLanding', vehicle)) {
    return null;
  }
  const hasTrafficSubscription = has('sub:TRAFFIC_CONNECT', vehicle);
  if (hasTrafficSubscription) {
    return 'LiveTrafficManage';
  }
  const request =
    manageEnrollmentApi.endpoints.getTrafficConnectAccountTypeTrialStatusMonthlyCost.initiate(
      { vin: vehicle.vin },
    );
  const response = await store.dispatch(request).unwrap();
  if (response.success && response.data?.isTrialEligible) {
    return 'LiveTrafficQRLanding';
  } else {
    return 'SubscriptionServicesLanding';
  }
};

const MgaLiveTrafficQRLanding: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const rateSchedules =
    useGetTrafficConnectPricingNoTrialQuery({ vin: vehicle?.vin }).data?.data ??
    [];
  const tcMonthlyFee =
    rateSchedules.length > 0 ? rateSchedules[0].price : undefined;

  const id = testID('LiveTrafficQRLanding');
  return (
    <MgaHeroPage
      heroSource={require('../../../content/img/tomtom_TrafficImage.png')}
      showVehicleInfoBar
      title={t('subscriptionServices:trafficConnectSubscribeHeader')}>
      <CsfView standardSpacing edgeInsets>
        <CsfText align="center" variant="title3" testID={id('welcomeQr')}>
          {t('tomtomQR:welcomeQr')}
        </CsfText>
        <CsfText align="center" testID={id('tomtomMessage1')}>
          {t('tomtomQR:tomtomMessage1', {
            model: vehicle?.modelName ?? '--',
            tcMonthlyFee: formatCurrencyForBilling(tcMonthlyFee),
          })}
        </CsfText>
        <MgaButton
          trackingId="LiveTrafficQRGetStartedButton"
          title={t('tomtomQR:getStarted')}
          onPress={() => navigation.replace('LiveTrafficSubscription')}
        />
      </CsfView>
    </MgaHeroPage>
  );
};

export default MgaLiveTrafficQRLanding;
