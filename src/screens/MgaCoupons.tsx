
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useCouponsQuery } from '../api/coupon.api';
import { formatFullDate } from '../utils/dates';
import { CouponDTO } from '../../@types';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import { MgaPhoneNumber } from '../components/CsfPhoneNumber';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaAddress, { getServiceAddressFromDealer } from '../components/MgaAddress';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

const MgaCoupons: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const couponsQuery = useCouponsQuery({ vin: vehicle?.vin });
  const coupons = couponsQuery.data?.data;
  const dealer = vehicle?.preferredDealer;
  const serviceAddress = getServiceAddressFromDealer(dealer);
  const couponList =
    coupons?.personalCoupons && coupons.personalCoupons.length !== 0
      ? coupons.personalCoupons
      : coupons?.dealerCoupons;
  const id = testID('Coupons');
  return (
    <MgaPage title={t('coupons:specialOffers')} showVehicleInfoBar>
      <MgaPageContent
        title={t('coupons:specialOffers')}
        isLoading={couponsQuery.isLoading}>
        {couponList && (
          <CsfView gap={12}>
            <CsfText
              variant="heading"
              align="center"
              testID={id('personalCoupons')}>
              {/**   TODO:UA:20231128 - move count to badge OR update to use i18n param instead of concatenating in string literal */}
              {coupons?.personalCoupons && coupons.personalCoupons.length !== 0
                ? t('coupons:personalCoupons')
                :
                `${dealer?.name || ''} ${t('coupons:offers')}`}
            </CsfText>
            <CsfAccordionList testID={id('list')}>
              {couponList.map((coupon: CouponDTO, i) => {
                const itemTestId = testID(id(`coupon-${i}`));
                return (
                  <MgaAccordionSection
                    trackingId={`CouponAccordion-${i}`}
                    testID={itemTestId('accordion')}
                    key={i}
                    title={
                      <CsfView>
                        <CsfText variant="heading" testID={itemTestId('value')}>
                          {coupon.value}
                        </CsfText>
                        <CsfText variant="heading" testID={itemTestId('name')}>
                          {coupon.name}
                        </CsfText>
                      </CsfView>
                    }
                    subtitle={formatFullDate(coupon.expiration)}
                    renderBody={() => (
                      <CsfView p={16}>
                        <CsfView gap={12}>
                          <CsfView>
                            <CsfText
                              variant="subheading"
                              testID={itemTestId(
                                'nameSubheading',
                              )}>{`${coupon.name}`}</CsfText>
                            <CsfText
                              testID={itemTestId(
                                'body',
                              )}>{`${coupon.body}`}</CsfText>
                          </CsfView>

                          {dealer && coupons?.dealerCoupons && (
                            <CsfView gap={8}>
                              {serviceAddress && (
                                <MgaAddress
                                  textVariant="body2"
                                  title={dealer.name}
                                  {...serviceAddress}
                                  testID={itemTestId('dealerAddress')}
                                />
                              )}

                              {dealer && (
                                <CsfView align="flex-start">
                                  <MgaPhoneNumber
                                    trackingId={itemTestId(
                                      'DealerServicePhoneButton',
                                    )}
                                    variant="inlineLink"
                                    style={{ alignItems: 'flex-start' }}
                                    phone={`${dealer?.servicePhoneNumberOriginal
                                      ? dealer.servicePhoneNumberOriginal
                                      : dealer?.phoneNumberOriginal
                                      }`}
                                  />
                                </CsfView>
                              )}
                            </CsfView>
                          )}

                          <CsfRule />

                          <CsfView gap={8} color="copySecondary">
                            <CsfText
                              variant="caption"
                              testID={itemTestId(
                                'details',
                              )}>{`${coupon.details}`}</CsfText>
                            <CsfText
                              variant="caption"
                              testID={itemTestId('offerExpires')}>
                              {t('coupons:offerExpires')}{' '}
                              {formatFullDate(coupon.expiration)}
                            </CsfText>
                            <CsfText
                              variant="caption"
                              testID={itemTestId('personalCoupons')}>
                              {t('coupons:source')}{' '}
                              {t(
                                coupons?.personalCoupons
                                  ? 'coupons:pcc'
                                  : 'coupons:cc',
                              )}
                            </CsfText>
                          </CsfView>
                        </CsfView>
                      </CsfView>
                    )}
                  />
                );
              })}
            </CsfAccordionList>
          </CsfView>
        )}
        {coupons?.nationalCoupons && coupons.nationalCoupons.length !== 0 && (
          <CsfView gap={12}>
            {/* TODO:UA:20230915: National / Tire */}
            <CsfText
              variant="heading"
              align={'center'}
              testID={id('tirePromotions')}>
              {t('coupons:tirePromotions')}
            </CsfText>
            <CsfAccordionList>
              {coupons.nationalCoupons.map((coupon, i) => {
                const itemTestId = testID(id(`nationalCoupon-${i}`));
                return (
                  <MgaAccordionSection
                    trackingId={`NationalCouponAccordion-${i}`}
                    testID={itemTestId('accordion')}
                    key={coupon.id}
                    title={`${coupon.manufacturer}/${coupon.title}`}
                    titleTextVariant="heading"
                    renderBody={() => (
                      <CsfView edgeInsets standardSpacing>
                        <CsfView>
                          <CsfText bold testID={itemTestId('offerExpires')}>
                            {t('coupons:offerExpires')}
                          </CsfText>
                          <CsfText testID={itemTestId('endDate')}>
                            {formatFullDate(coupon.endDate)}
                          </CsfText>
                          <CsfText testID={itemTestId('source')}>
                            {t('coupons:source')}
                            {t('coupons:tc')}
                          </CsfText>
                        </CsfView>
                        <MgaButton
                          trackingId={itemTestId('LearnMoreButton')}
                          title={t('coupons:learnMore')}
                          onPress={() => {
                            navigation.navigate('CouponDetail', {
                              coupon,
                            });
                          }}
                        />
                        {coupon.redemptionFormUrl && (
                          <MgaButton
                            trackingId={itemTestId('RedemptionButton')}
                            title={t('coupons:redemption')}
                            variant="secondary"
                            onPress={() =>
                              navigation.navigate('CouponDetail', {
                                coupon,
                              })
                            }
                          />
                        )}
                      </CsfView>
                    )}
                  />
                );
              })}
            </CsfAccordionList>
          </CsfView>
        )}
        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaCoupons;
