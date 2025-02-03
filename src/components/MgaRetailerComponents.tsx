/* eslint-disable react/no-unstable-nested-components */
// cSpell:ignore LPCOMM, LPGOLD, PARTSSTORE
import React from 'react';
import {
  ClientSessionVehicle,
  DealerInfo,
  TripDestinationResult,
} from '../../@types';
import { useTranslation } from 'react-i18next';
import { has, capRPOIActive } from '../features/menu/rules';
import { useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { CsfButtonProps, CsfButtonType } from './CsfButton';

import SesLogo from '../../content/svg/subaru-express-service.svg';
import {
  accountApi,
  cNoVehicle,
  useAssignAsPreferredDealerMutation,
  useDealerAmenitiesQuery,
  usePreferredDealerQuery,
} from '../api/account.api';
import { pushSchedulerScreen } from '../screens/scheduler/MgaScheduler';
import { alertNotInDemo, canDemo } from '../features/demo/demo.slice';
import { testID } from './utils/testID';
import MgaAddress, { getServiceAddressFromDealer } from './MgaAddress';
import MgaButton from './MgaButton';
import mgaOpenURL from './utils/linking';
import CsfSimpleAlert from './CsfSimpleAlert';
import CsfView from './CsfView';
import { CsfRuleList } from './CsfRuleList';
import CsfDetail from './CsfDetail';
import { MgaPhoneNumber } from './CsfPhoneNumber';
import CsfText from './CsfText';
import CsfBulletedList from './CsfBulletedList';
import CsfAccordionList from './CsfAccordionList';
import { CsfAccordionSectionProps, MgaAccordionSection } from './CsfAccordionSection';
import CsfAppIcon from './CsfAppIcon';
import { CsfLinkToMapApp } from './CsfMapLink';
import CsfPressable from './CsfPressable';
import CsfRule from './CsfRule';
import MgaAnalyticsContainer from './MgaAnalyticsContainer';
import useTracking from './useTracking';

export const dealerCoords = (
  dealer: DealerInfo,
): { latitude: number; longitude: number } => ({
  latitude: dealer.latDeg,
  longitude: dealer.longDeg,
});

export const RetailerLink: React.FC<
  CsfButtonProps & {
    dealer: DealerInfo
  }
> = ({ dealer, ...buttonProps }) => {
  const { t } = useTranslation();
  return (
    <MgaButton
      trackingId="RetailerLink"
      title={t('retailerCenter:visitRetailerWebsite')}
      onPress={() =>
        mgaOpenURL(
          dealer.url.startsWith('http:') || dealer.url.startsWith('https:')
            ? dealer.url
            : 'http://' + dealer.url,
        )
      }
      {...buttonProps}
    />
  );
};

export const RetailerDetails: React.FC<
  CsfButtonProps & {
    dealer: DealerInfo
  }
> = ({ dealer, ...buttonProps }) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  return (
    <MgaButton
      trackingId="RetailerDetails"
      title={t('retailerCenter:retailerDetails')}
      onPress={() =>
        navigation.navigate('Retailer', {
          dealerCode: dealer?.dealerCode,
        })
      }
      {...buttonProps}
    />
  );
};

export const RetailerScheduleService: React.FC<{
  vehicle: ClientSessionVehicle | null
  dealer: DealerInfo
}> = ({ vehicle, dealer }) => {
  const { t } = useTranslation();
  return (
    dealer?.dealerKey == vehicle?.preferredDealer?.dealerKey && (
      <MgaButton
        trackingId="RetailerScheduleService"
        onPress={() => pushSchedulerScreen()}
        title={t('common:scheduleAppointment')}
      />
    )
  );
};

export const RetailerSetPreferred: React.FC<{
  dealer?: DealerInfo | null
  vehicle?: ClientSessionVehicle | null
}> = ({ dealer, vehicle }) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const [assign, _assignStatus] = useAssignAsPreferredDealerMutation();
  return (
    <MgaButton
      trackingId="RetailerSetPreferred"
      onPress={async () => {
        try {
          if (!vehicle) {
            throw new Error(cNoVehicle);
          }
          const response = await assign({
            dealerCode: dealer.dealerCode,
          }).unwrap();
          if (!response.success) {
            throw new Error('assignFailed');
          }
          await dispatch(
            accountApi.endpoints.preferredDealer.initiate({
              vin: vehicle.vin,
            }),
          );
          navigation.popToTop();
          navigation.navigate('Retailer', {
            dealerCode: dealer?.dealerCode,
          });
        } catch {
          CsfSimpleAlert(
            t('common:error'),
            t('retailerCenter:unableToUpdateRetailer'),
            { type: 'error' },
          );
        }
      }}
      title={t('retailerCenter:makeRetailer')}
    />
  );
};

export const RetailerContact: React.FC<{
  dealer: DealerInfo
}> = ({ dealer }) => {
  const { t } = useTranslation();
  const id = testID('RetailerContact');
  // TODO:AG:20231107
  return (
    <CsfView testID={id()}>
      <CsfRuleList testID={id('list')}>
        {(dealer.servicePhoneNumber || dealer.servicePhoneNumberOriginal) && (
          <CsfDetail
            label={t('common:service')}
            testID={id('service')}
            value={
              <MgaPhoneNumber
                trackingId="DealerServicePhoneButton"
                variant="inlineLink"
                phone={
                  dealer.servicePhoneNumber
                    ? dealer.servicePhoneNumber
                    : dealer.servicePhoneNumberOriginal
                }
              />
            }
          />
        )}
        {(dealer.partsPhoneNumber || dealer.partsPhoneNumberOriginal) && (
          <CsfDetail
            label={t('common:parts')}
            testID={id('parts')}
            value={
              <MgaPhoneNumber
                trackingId="DealerPartsPhoneButton"
                variant="inlineLink"
                phone={
                  dealer.partsPhoneNumber
                    ? dealer.partsPhoneNumber
                    : dealer.partsPhoneNumberOriginal
                }
              />
            }
          />
        )}
        {dealer.phoneNumber && (
          <CsfDetail
            label={t('common:sales')}
            testID={id('sales')}
            value={
              <MgaPhoneNumber
                trackingId="DealerSalesPhoneButton"
                phone={dealer.phoneNumber}
                variant="inlineLink"
              />
            }
          />
        )}
      </CsfRuleList>
    </CsfView>
  );
};
export const RetailerFeatures: React.FC<{
  dealer: DealerInfo
}> = ({ dealer }) => {
  const { t } = useTranslation();
  const id = testID('RetailerFeatures');
  const dealerCode = dealer.dealerCode;
  const amenities = useDealerAmenitiesQuery({ dealerCode }).data?.data
    ?.serviceAmenities;
  const certs = dealer.flags
    .map(flag => {
      switch (flag.dealerFlagCode) {
        case 'EXPRESS':
        case 'CPO':
        case 'SCHEDULE':
        case 'PARTSSTORE':
          return t(`retailerCenter:dealerFlags.${flag.dealerFlagCode}`);
        case 'CERTIFICATION':
          switch (flag.dealerFlagSubCode) {
            case 'ECO':
            case 'STELLAR':
            case 'LPCOMM':
            case 'LPGOLD':
              return t(
                `retailerCenter:dealerFlags.CERTIFICATION.${flag.dealerFlagSubCode}`,
              );
            default:
              return null;
          }
        default:
          return null;
      }
    })
    .filter(text => text != null)
    .sort();
  return certs.length > 0 ? (
    <CsfView gap={8} testID={id()}>
      <CsfText variant="heading" testID={id('certificationsAmenities')}>
        {t('retailerCenter:certificationsAmenities')}
      </CsfText>
      <CsfBulletedList
        bullet={_i => <CsfAppIcon icon="Success" size="sm" />}
        testID={id('bulletList')}>
        {certs.map((cert, index) => (
          <CsfText key={cert} testID={id(`cert-${index}`)}>
            {cert}
          </CsfText>
        ))}
        {amenities?.map((amenity, index) => (
          <CsfText key={amenity} testID={id(`amenity-${index}`)}>
            {amenity}
          </CsfText>
        ))}
      </CsfBulletedList>
    </CsfView>
  ) : null;
};
export const RetailerLocation: React.FC<{
  dealer: DealerInfo
}> = ({ dealer }) => {
  const { t } = useTranslation();
  const id = testID('RetailerLocation');
  const serviceAddress = getServiceAddressFromDealer(dealer);
  return (
    <CsfView testID={id()}>
      {serviceAddress && dealer.address != serviceAddress.address ? (
        <CsfView testID={id('serviceContainer')}>
          <CsfText testID={id('service')}>{t('common:service')}</CsfText>
          <MgaAddress {...serviceAddress} testID={id('serviceAddress')} />
          <RetailerMapLinks dealer={dealer} service testID={id('mapLinks')} />
          <CsfText testID={id('sales')}>{t('common:sales')}</CsfText>
          <MgaAddress {...dealer} testID={id('address')} />
          <RetailerMapLinks dealer={dealer} testID={id('mapLinks')} />
        </CsfView>
      ) : (
        <CsfView testID={id('addressContainer')}>
          <MgaAddress {...dealer} testID={id('address')} />
          <RetailerMapLinks dealer={dealer} testID={id('mapLinks')} />
        </CsfView>
      )}
    </CsfView>
  );
};

export const RetailerMapLinks: React.FC<{
  dealer: DealerInfo
  vehicle?: ClientSessionVehicle
  service?: boolean
  testID?: string
}> = ({ dealer, vehicle, service, ...props }) => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const isDemo = useAppSelector(s => s.demo);
  const gpsCoords = useAppSelector(s => s.geolocation?.position?.coords);

  const name: string = dealer.name;
  const latitude: number = service ? dealer.serviceLatDeg : dealer.latDeg;
  const longitude: number = service ? dealer.serviceLongDeg : dealer.longDeg;
  const freeformAddress: string = service
    ? dealer.serviceAddress
    : dealer.address;
  const city: string = service ? dealer.serviceCity : dealer.city;
  const state: string = service ? dealer.serviceState : dealer.state;
  const zip: string = service ? dealer.serviceZip : dealer.zip;
  const addressArray: string[] = freeformAddress
    ? freeformAddress.split(' ')
    : ['', ''];
  const streetNumber: string = addressArray[0];
  const streetName: string = addressArray.splice(1).join(' ');

  const destination: TripDestinationResult = {
    position: {
      lat: latitude,
      lon: longitude,
    },
    name,
    streetName,
    streetNumber,
    zip,
    freeformAddress,
    city,
    state,
    distance: '',
  };

  return (
    latitude &&
    longitude && (
      <CsfView
        align="center"
        flexDirection="row"
        style={{ alignItems: 'center' }}
        justify="flex-start"
        gap={24}
        minHeight={56}
        testID={props.testID}>
        {has(capRPOIActive, vehicle) && (
          <MgaButton
            trackingId="RetailerTripLogs"
            icon="TripLogs"
            onPress={() =>
              !isDemo || canDemo('TripsDestinationSearch')
                ? navigation.push('TripsDestinationSearch', { destination })
                : alertNotInDemo()
            }
            title={t('tripSearch:addToTrip')}
            variant="inlineLink"
          />
        )}
        <MgaButton
          trackingId="RetailerTripTracker"
          icon="TripTracker"
          onPress={() => {
            CsfLinkToMapApp(
              {
                latitude,
                longitude,
              },
              gpsCoords,
              dealer.name,
            );
          }}
          title={t('common:getDirectionsLink')}
          variant="inlineLink"
        />
      </CsfView>
    )
  );
};
export const MgaRetailerAccordion: React.FC<
  { dealer?: DealerInfo } & Pick<
    CsfAccordionSectionProps,
    'renderBody' | 'open' | 'subtitle' | 'title'
  >
> = ({ dealer, renderBody, open, subtitle, title }) => {
  const id = testID('RetailerAccordion');
  return (
    <CsfAccordionList testID={id()}>
      <MgaAccordionSection
        trackingId="RetailerAccordion"
        open={open}
        icon={<CsfAppIcon icon="LocateVehicleFill" color="button" size="lg" />}
        title={title || dealer?.name}
        titleTextVariant="heading"
        subtitleTextVariant="subheading"
        subtitle={subtitle}
        renderBody={renderBody}
        headerTheme={'dark'}
        renderBodyBg="backgroundSecondary"
      />
    </CsfAccordionList>
  );
};

export const RetailerSearchButton: React.FC<{
  vehicle?: ClientSessionVehicle | null
  title?: string
  variant?: CsfButtonType
}> = ({ vehicle, title, variant }) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  return (
    <MgaButton
      trackingId="RetailerSearchButton"
      onPress={() => {
        if (
          vehicle?.vehicleGeoPosition?.latitude &&
          vehicle.vehicleGeoPosition.longitude
        ) {
          navigation.push('RetailerSearch', {
            latitude: vehicle.vehicleGeoPosition.latitude,
            longitude: vehicle.vehicleGeoPosition.longitude,
          });
        } else if (vehicle?.zip) {
          navigation.push('RetailerSearch', { zip: vehicle.zip });
        } else {
          navigation.push('RetailerSearch', {
            latitude: 0,
            longitude: 0,
          });
        }
      }}
      variant={variant || 'primary'}
      title={title || t('common:selectRetailer')}
    />
  );
};

const HawaiiEmbed: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  //To show express service logo
  const vehicle = useCurrentVehicle();
  const { data } = usePreferredDealerQuery({
    vin: vehicle?.vin ?? '',
  });
  const { trackButton } = useTracking();
  const dealer = vehicle?.preferredDealer || data?.data?.preferredDealer;
  const id = testID('HawaiiEmbed');

  return (
    <MgaAnalyticsContainer
      title="RetailerEmbedHawaii"
      id="Retailer Embed - Hawaii">
      <CsfView gap={16} testID={id()}>
        <CsfText variant="title3" align="center" testID={id('myRetailer')}>
          {t('branding:myRetailer')}
        </CsfText>
        <MgaRetailerAccordion
          title={t('common:subaruHawaii')}
          subtitle={
            <CsfPressable
              testID={id('scheduleService')}
              onPress={() => {
                trackButton({
                  title: t('common:subaruHawaii'),
                  trackingId: 'SubaruHawaiiScheduler',
                });
                pushSchedulerScreen();
              }}>
              <CsfText color="button" variant="subheading" testID={id('title')}>
                {t('scheduleService:title')}
              </CsfText>
            </CsfPressable>
          }
          renderBody={() => (
            <CsfView p={16} testID={id('scheduleAppointment')}>
              <MgaButton
                trackingId="RetailerScheduleHawaii"
                title={t('common:scheduleAppointment')}
                onPress={() => navigation.push('RetailerHawaii')}
              />
            </CsfView>
          )}
        />
        {dealer ? <MgaExpressService dealer={dealer} /> : null}
      </CsfView>
    </MgaAnalyticsContainer>
  );
};

export const MgaExpressService: React.FC<{
  dealer?: DealerInfo
}> = ({ dealer }) => {
  const { t } = useTranslation();
  const hasExpress = dealer?.flags.some(
    item => item.dealerFlagCode == 'EXPRESS',
  );
  const { trackButton } = useTracking();
  const id = testID('ExpressService');

  return hasExpress ? (
    <CsfPressable
      testID={id()}
      onPress={() => {
        trackButton({
          trackingId: 'ExpressServiceButton',
          title: 'SES Logo SVG',
        });

        void CsfSimpleAlert(
          t('scheduler:expressServiceTitle'),
          t('scheduler:subaruExpressService'),
          { type: 'information' },
        );
      }}>
      <CsfView align="center" testID={id('container')}>
        <CsfView
          borderColor="rule"
          bg="background"
          borderRadius={4}
          borderWidth={1}
          testID={id('logo')}
          p={4}
          width={108}>
          <SesLogo height={42} width={100} />
        </CsfView>
      </CsfView>
    </CsfPressable>
  ) : null;
};
export const MgaRetailerEmbed: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const { data, isLoading } = usePreferredDealerQuery({
    vin: vehicle?.vin ?? '',
  });
  const { trackButton } = useTracking();
  const dealer = vehicle?.preferredDealer || data?.data?.preferredDealer;
  const id = testID('RetailerEmbed');

  if (has('reg:HI')) return <HawaiiEmbed />;
  return (
    <MgaAnalyticsContainer trackingId="RetailerEmbed" name="Retailer Embed">
      <CsfView isLoading={isLoading} gap={16} testID={id()}>
        <CsfText variant="title3" align="center" testID={id('myRetailer')}>
          {t('branding:myRetailer')}
        </CsfText>

        {dealer ? (
          <MgaRetailerAccordion
            dealer={dealer}
            subtitle={
              <CsfPressable
                testID={id('scheduleServiceButton')}
                onPress={() => {
                  trackButton({
                    title: t('common:scheduleService'),
                    trackingId: 'ScheduleServiceHeaderButton',
                  });
                  pushSchedulerScreen();
                }}>
                <CsfText
                  color="button"
                  variant="subheading"
                  testID={id('scheduleService')}>
                  {t('common:scheduleService')}
                </CsfText>
              </CsfPressable>
            }
            renderBody={() => (
              <CsfView p={24} gap={16}>
                <RetailerLocation dealer={dealer} />
                <RetailerScheduleService dealer={dealer} vehicle={vehicle} />
                <MgaExpressService dealer={dealer} />
                <RetailerContact dealer={dealer} />
                <RetailerDetails dealer={dealer} variant="secondary" />
                <CsfRule />
                <RetailerSearchButton
                  variant="link"
                  title={t('common:findADifferentRetailer')}
                  vehicle={vehicle}
                />
              </CsfView>
            )}
          />
        ) : (
          <RetailerSearchButton vehicle={vehicle} />
        )}
      </CsfView>
    </MgaAnalyticsContainer>
  );
};
