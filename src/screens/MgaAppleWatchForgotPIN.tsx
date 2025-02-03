import React from 'react';
import { useAppNavigation, useAppRoute } from '../Controller';
import { useTranslation } from 'react-i18next';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaHeroPage from '../components/MgaHeroPage';

const trackingId = 'ResetPin';

const MgaAppleWatchForgotPIN: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const route = useAppRoute<'AppleWatchForgotPIN'>();
  const PINChangeComplete: boolean | undefined = route.params?.success;

  return (
    <MgaHeroPage
      showVehicleInfoBar={true}
      heroSource={require('../../content/png/watch-sync-landing-hero.png')} /* TODO:MN:20240712 Replace with better quality asset */
      title={t('appleWatch:title')}>
      <CsfView ph={8} pv={16}>
        <CsfView gap={4} pv={8}>
          <CsfText align="center" color="light" variant="title2">
            {PINChangeComplete
              ? t('appleWatch:pinResetSuccessLandingTitle')
              : t('appleWatch:pinResetLandingTitle')}
          </CsfText>
        </CsfView>
        <CsfView pv={16}>
          <CsfText align="center" color="light">
            {PINChangeComplete
              ? t('appleWatch:pinResetSuccessLandingDescription')
              : t('appleWatch:pinResetLandingDescription')}
          </CsfText>
        </CsfView>

        <CsfView standardSpacing gap={8}>
          {!PINChangeComplete && (
            <MgaButton
              trackingId={trackingId}
              title={t('forgotPin:title')}
              onPress={() => {
                navigation.push('ResetPin', {
                  nextScreen: 'AppleWatchForgotPIN',
                });
              }}
            />
          )}
          <MgaButton
            variant="link"
            trackingId={trackingId}
            title={t('common:dismiss')}
            onPress={() => navigation.pop()}
          />
        </CsfView>
      </CsfView>
    </MgaHeroPage>
  );
};


export default MgaAppleWatchForgotPIN;
