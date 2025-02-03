import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useCouponsQuery } from '../api/coupon.api';
import { DealerInfo } from '../../@types';
import {
  MgaExpressService,
  MgaRetailerAccordion,
  RetailerContact,
  RetailerFeatures,
  RetailerLink,
  RetailerLocation,
  RetailerScheduleService,
  RetailerSetPreferred,
  dealerCoords,
} from '../components/MgaRetailerComponents';
import { useAppSelector } from '../store';
import { has } from '../features/menu/rules';
import {
  useAssignAsPreferredDealerMutation,
  useDealerInfoQuery,
  usePreferredDealerQuery,
} from '../api/account.api';
import { testID } from '../components/utils/testID';
import { canAccessScreen } from '../utils/menu';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaAnalyticsContainer from '../components/MgaAnalyticsContainer';
import MgaButton from '../components/MgaButton';
import MgaMarkerMap from '../components/MgaMarkerMap';
import MgaPage from '../components/MgaPage';
import mgaOpenURL from '../components/utils/linking';

export const MgaRetailer: React.FC<DealerInfo> = dealer => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const [_assign, assignStatus] = useAssignAsPreferredDealerMutation();
  const gpsCoords = useAppSelector(s => s.geolocation?.position?.coords);
  const coupons = useCouponsQuery({ vin: vehicle?.vin ?? '' }).data?.data;
  const couponCount =
    (coupons?.dealerCoupons?.length ?? 0) +
    (coupons?.personalCoupons?.length ?? 0) +
    (coupons?.nationalCoupons?.length ?? 0);
  const id = testID('Retailer');
  /** MGAS-116: Since neither mga.retailer.amenities nor mga.retailer.expressService cover parts shopping, I'm handling this via a regional URL. */
  const partsUrl = t('urls:partsRedirect', { defaultValue: '' });
  return (
    <CsfView p={16} pv={24} gap={16} testID={id()}>
      {dealer.dealerKey == vehicle?.preferredDealer?.dealerKey ? (
        <CsfText variant="title2" align="center" testID={id('myRetailer')}>
          {t('branding:myRetailer')}
        </CsfText>
      ) : (
        <CsfText
          variant="title2"
          align="center"
          testID={id('authorizedRetailer')}>
          {t('retailerCenter:authorizedRetailer')}
        </CsfText>
      )}

      <CsfView
        isLoading={assignStatus.isLoading}
        gap={16}
        testID={id('accordion')}>
        <MgaRetailerAccordion
          open={true}
          dealer={dealer}
          subtitle={
            <CsfView
              minHeight={24}
              justify="center"
              align="flex-start"
              testID={id('subtitle')}>
              <RetailerLink dealer={dealer} variant="inlineLink" />
            </CsfView>
          }
          renderBody={() => (
            <CsfView p={16} gap={16} testID={id('locationContainer')}>
              <CsfView testID={id('locationInnerContainer')}>
                <RetailerLocation dealer={dealer} />
              </CsfView>
              <RetailerScheduleService dealer={dealer} vehicle={vehicle} />

              {/** parts/accessories button */}
              {partsUrl && (
                <MgaButton
                  trackingId="RetailerPartsAndAccessoriesButton"
                  onPress={async () => {
                    let url = partsUrl;
                    if (vehicle?.vin) {
                      url = `${url}&vin=${vehicle.vin}`;
                    }
                    if (vehicle?.modelCode) {
                      url = `${url}&modelCode=${vehicle.modelCode}`;
                    }
                    if (dealer.dealerCode) {
                      url = `${url}&dealerCode=${dealer.dealerCode}`;
                    }
                    await mgaOpenURL(url);
                  }}
                  title={t('common:shopPartsAccessories')}
                  variant="link"
                />
              )}
              {/** end parts/accessories button */}

              {has('flg:mga.retailer.expressService') && (
                <MgaExpressService dealer={dealer} />
              )}
              <RetailerContact dealer={dealer} />

              {has('flg:mga.retailer.amenities') && (
                <RetailerFeatures dealer={dealer} />
              )}

              {canAccessScreen('Coupons') &&
                couponCount > 0 &&
                dealer.dealerKey == vehicle?.preferredDealer?.dealerKey && (
                  <CsfView standardSpacing>
                    <MgaButton
                      trackingId="RetailerCouponsButton"
                      onPress={() => navigation.push('Coupons')}
                      title={t('retailerCenter:viewSpecialOffers')}
                      variant="secondary"
                    />
                  </CsfView>
                )}

              {dealer.dealerKey != vehicle?.preferredDealer?.dealerKey &&
                has('usr:primary') && (
                  <RetailerSetPreferred vehicle={vehicle} dealer={dealer} />
                )}
            </CsfView>
          )}
        />

        <MgaMarkerMap
          markers={[]}
          center={dealerCoords(dealer)}
          style={{ height: 300 }}
          testID={id('map')}
        />
        {dealer.dealerKey == vehicle?.preferredDealer?.dealerKey && (
          <CsfView>
            <MgaButton
              trackingId="RetailerSearchButton"
              onPress={() => {
                navigation.push(
                  'RetailerSearch',
                  gpsCoords?.latitude && gpsCoords?.longitude
                    ? gpsCoords
                    : dealerCoords(dealer),
                );
              }}
              title={t('common:findADifferentRetailer')}
              variant="link"
            />
          </CsfView>
        )}
      </CsfView>
    </CsfView>
  );
};

const MgaRetailerLandingDealerInfo: React.FC<{
  dealerCode: string
  testID?: string
}> = ({ dealerCode, ...props }) => {
  const { data, isLoading } = useDealerInfoQuery({ dealerCode: dealerCode });
  const dealer = data?.data;
  return (
    <CsfView isLoading={isLoading} testID={props.testID}>
      {dealer && <MgaRetailer {...dealer} />}
    </CsfView>
  );
};

const MgaRetailerLandingPreferredDealer: React.FC<{
  testID?: string
}> = props => {
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const { data, isLoading } = usePreferredDealerQuery({
    vin: vehicle?.vin ?? '',
  });
  const dealer = data?.data?.preferredDealer;
  const id = testID(props.testID);

  return (
    <CsfView isLoading={isLoading} testID={id()}>
      {dealer ? (
        <MgaRetailer {...dealer} />
      ) : (
        <MgaAnalyticsContainer trackingId="NoRetailerSelected">
          <CsfView p={16} testID={id('searchContainer')}>
            <MgaButton
              trackingId="RetailerSearchButton"
              onPress={() => {
                navigation.push('RetailerSearch', {});
              }}
              title={t('common:selectRetailer')}
            />
          </CsfView>
        </MgaAnalyticsContainer>
      )}
    </CsfView>
  );
};

const MgaRetailerLanding: React.FC = () => {
  const { t } = useTranslation();
  const dealerCode = useAppRoute<'Retailer'>().params?.dealerCode;
  const id = testID('RetailerLanding');
  return (
    <MgaPage
      title={t('branding:myRetailer')}
      bg="background"
      showVehicleInfoBar>
      {dealerCode ? (
        <MgaRetailerLandingDealerInfo
          dealerCode={dealerCode}
          testID={id('dealerInfo')}
        />
      ) : (
        <MgaRetailerLandingPreferredDealer testID={id('preferredDealer')} />
      )}
    </MgaPage>
  );
};


export default MgaRetailerLanding;
