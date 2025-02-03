import React from 'react';
import { useAppRoute } from '../Controller';
import { useTranslation } from 'react-i18next';
import { formatFullDate } from '../utils/dates';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaCouponDetail: React.FC = () => {
  const route = useAppRoute<'CouponDetail'>();
  const { coupon } = route.params;
  const { t } = useTranslation();

  const id = testID('CouponDetail');
  return (
    <MgaPage title={`${coupon.manufacturer}/${coupon.title}`} focusedEdit>
      <MgaPageContent title={`${coupon.manufacturer}/${coupon.title}`}>
        <CsfCard gap={8}>
          <CsfView standardSpacing>
            <CsfView>
              <CsfText bold testID={id('offerExpires')}>
                {t('coupons:offerExpires')}
              </CsfText>
              <CsfText testID={id('endDate')}>
                {formatFullDate(coupon.endDate)}
              </CsfText>
              <CsfText testID={id('source')}>
                {t('coupons:source')}
                {t('coupons:tc')}
              </CsfText>
            </CsfView>
            <CsfRule />

            <CsfText testID={id('termsAndConditions')}>
              {coupon?.termsAndConditions}
            </CsfText>
            {coupon.redemptionFormUrl && (
              <CsfText testID={id('printRedemptionDescription')}>
                {t('coupons:printRedemptionDescription')}
              </CsfText>
            )}
          </CsfView>
        </CsfCard>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaCouponDetail;
