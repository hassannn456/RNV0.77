import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCouponsQuery } from '../api/coupon.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppNavigation } from '../Controller';
import { has } from '../features/menu/rules';
import { tradeUpAdvantageProgram } from '../utils/tradeUpAdvantage';
import {
  CsfLandingMenuList,
  CsfLandingMenuListItem,
} from '../components/CsfListItemLanding';
import { usePreferredDealerQuery } from '../api/account.api';
import { testID } from '../components/utils/testID';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaMessageCenterLanding: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const { data, isFetching } = useCouponsQuery({ vin: vehicle?.vin });
  const coupons = data?.data;
  const dealer = usePreferredDealerQuery({
    vin: vehicle?.vin ?? '',
  }).data?.data?.preferredDealer;

  const couponCount =
    (coupons?.dealerCoupons?.length ?? 0) +
    (coupons?.personalCoupons?.length ?? 0) +
    (coupons?.nationalCoupons?.length ?? 0);
  const isHawaii = has('reg:HI', vehicle);
  const tradeUpAdvantage = tradeUpAdvantageProgram(dealer, isHawaii);
  // TODO:UA:20231128 - move count to badge OR update to use i18n param instead of concatenating in string literal

  const specialOffersButtonText = `${t(
    'messageCenterLanding:specialOffers',
  )} (${couponCount})`;

  const id = testID('Offers');
  return (
    <MgaPage
      title={t('messageCenterLanding:subaruMessageCenter')}
      showVehicleInfoBar>
      <MgaPageContent
        isLoading={isFetching}
        title={t('messageCenterLanding:subaruMessageCenter')}>
        <CsfLandingMenuList>
          <CsfLandingMenuListItem
            icon="SpecialOffers"
            title={specialOffersButtonText}
            onPress={() => navigation.push('Coupons')}
            testID={id('specialOffersButtonText')}
          />

          <CsfLandingMenuListItem
            icon="SubaruEvents"
            title={t('messageCenterLanding:subaruEvents')}
            onPress={() => navigation.push('Events')}
            testID={id('subaruEvents')}
          />

          {/* // has('usr:primary', vehicle) && */}
          {tradeUpAdvantage && (
            <CsfLandingMenuListItem
              icon="TradeUpAdvantage"
              title={t('messageCenterLanding:tradeUpProgram')}
              onPress={() => navigation.push('TradeUpAdvantage')}
              testID={id('tradeUpProgram')}
            />
          )}
        </CsfLandingMenuList>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaMessageCenterLanding;
