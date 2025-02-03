/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCustomerProfileQuery } from '../features/profile/contact/contactApi';
import { useAppNavigation, useAppRoute } from '../Controller';
import {
  TomTomSearchResult,
  tomTomFindByPostalCode,
} from '../features/geolocation/tomtom.api';
import { useNearestDealerQuery } from '../api/account.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { testID } from '../components/utils/testID';
import CsfPressable from '../components/CsfPressable';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaAddress from '../components/MgaAddress';
import MgaLocationSelect from '../components/MgaLocationSelect';
import MgaMarkerMap from '../components/MgaMarkerMap';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaRetailerSearch: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();

  const { data: profileData } = useCustomerProfileQuery({
    vin: vehicle?.vin || '',
    oemCustId: vehicle?.oemCustId || '',
  });

  const route = useAppRoute<'RetailerSearch'>();
  const [location, setLocation] = useState({
    latitude: route.params?.latitude ?? 0,
    longitude: route.params?.longitude ?? 0,
  });

  const { data, isLoading } = useNearestDealerQuery(location);
  const dealers = data?.data ?? [];

  const mapZipToCoords = async () => {
    if (location.latitude == 0) {
      let zipCode = route.params?.zip;
      //if no preferred retailer selected , zip code will be undefined
      if (!zipCode) {
        //take location from current user's address to show near by retailer
        const { data: responseData } = profileData || {};

        const customerProfile = responseData?.customerProfile;

        zipCode = customerProfile?.zip5Digits || '';
      }
      const location = await tomTomFindByPostalCode(zipCode);
      if (location?.position) {
        if (location.position?.lat && location.position?.lon) {
          setLocation({
            latitude: location.position.lat,
            longitude: location.position.lon,
          });
        }
      }
    }
  };
  useEffect(() => {
    mapZipToCoords().then().catch(console.error);
  }, [location, profileData]);

  const id = testID('RetailerSearch');

  return (
    <MgaPage title={t('common:findRetailer')} showVehicleInfoBar>
      <MgaPageContent title={t('branding:myRetailer')} isLoading={isLoading}>
        <CsfView standardSpacing testID={id()}>
          <CsfText
            variant="subheading"
            align="center"
            testID={id('findRetailer')}>
            {t('common:findRetailer')}
          </CsfText>
          <CsfText testID={id('findASubaruRetailer')}>
            {t('searchForRetailer:findASubaruRetailer')}
          </CsfText>
          <MgaLocationSelect
            label={t('searchForRetailer:enterZipCode')}
            outsideLabel
            onSelectPosition={position =>
              setLocation({ latitude: position.lat, longitude: position.lon })
            }
            renderCellTitle={(item: TomTomSearchResult) =>
              item?.address?.freeformAddress
            }
            renderCellSubtitle={() => null}
            renderCellIcon={() => null}
            renderLocationCell={item => item}
          />
          <CsfView height={300}>
            <MgaMarkerMap
              style={{ height: 300, width: '100%' }}
              markers={dealers.map((dealer, index) => ({
                latitude: parseFloat(dealer.latDeg),
                longitude: parseFloat(dealer.longDeg),
                symbolText: String(index + 1),
              }))}
            />
          </CsfView>
          {dealers.map((dealer, index) => {
            const itemTestId = testID(id(`dealer-${index}`));
            return (
              <CsfPressable
                key={dealer.dealerCode}
                testID={itemTestId('dealer')}
                onPress={() => {
                  navigation.push('Retailer', {
                    dealerCode: dealer.dealerCode,
                  });
                }}>
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText variant="subheading" testID={itemTestId('name')}>
                    {index + 1}. {dealer.name}
                  </CsfText>
                  <CsfText variant="subheading" testID={itemTestId('distance')}>
                    {dealer.distance}
                  </CsfText>
                </CsfView>
                <MgaAddress
                  {...dealer}
                  textVariant="body2"
                  testID={itemTestId('address')}
                />
                <CsfRule />
              </CsfPressable>
            );
          })}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaRetailerSearch;
