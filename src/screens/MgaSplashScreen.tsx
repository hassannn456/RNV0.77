/* eslint-disable eqeqeq */
import React, { useEffect } from 'react';

import { store, useAppLoading } from '../store';
import { loadLocalesFromS3 } from '../features/localization/localization.api';
import { adminApi } from '../features/admin/admin.api';
import { useTranslation } from 'react-i18next';
import { trackError } from '../components/useTracking';
import promptAlert from '../components/CsfAlert';
import mgaOpenURL from '../components/utils/linking';
import CsfView from '../components/CsfView';
// import MgaLogo from '../components/MgaLogo';
import MgaBadConnectionCard from '../components/MgaBadConnectionCard';
import CsfButton from '../components/CsfButton';
import CsfActivityIndicator from '../components/CsfActivityIndicator';

const MgaSplashScreen: React.FC = () => {
  const { t } = useTranslation();
  const [_isLoading, state, object] = useAppLoading();
  // During startup, grab mobile message if available
  // AppLoading will block until request completes
  // In case of endpoint failure, version blocking is ignored (this matches Cordova)
  const checkMobileMessage = async () => {
    const mobileMessageRequest =
      adminApi.endpoints.mobileMessage.initiate(undefined);
    const mobileMessageResponse = await store
      .dispatch(mobileMessageRequest)
      .unwrap();
    if (mobileMessageResponse.success && mobileMessageResponse.data) {
      const { fatal, message, clickUrl } = mobileMessageResponse.data;
      const update = t('common:update');
      const selection = await promptAlert(
        t('common:updateAvailable'),
        message,
        fatal
          ? [{ title: update, type: 'primary' }]
          : [
            { title: update, type: 'primary' },
            { title: t('common:continue'), type: 'secondary' },
          ],
      );
      if (selection == update) {
        await mgaOpenURL(clickUrl);
      }
      store.dispatch({
        type: fatal ? 'mobileMessage/error' : 'mobileMessage/complete',
      });
    } else {
      store.dispatch({
        type: 'mobileMessage/complete',
      });
    }
  };
  useEffect(() => {
    checkMobileMessage().then().catch(trackError('MgaSplashScreen.tsx'));
  }, []);

  return (
    <CsfView
      align="center"
      justify="center"
      height={'100%'}
      edgeInsets
      standardSpacing>
      {/* <MgaLogo /> */}
      {state == 'localization' && object?.state == 'error' && (
        <MgaBadConnectionCard
          onRetry={async () => {
            await loadLocalesFromS3();
          }}
        />
      )}
      {state == 'mobileMessage' && object?.state == 'error' && (
        <CsfButton title={t('common:retry')} onPress={checkMobileMessage} />
      )}
      {object?.state != 'error' && <CsfActivityIndicator />}
    </CsfView>
  );
};


export default MgaSplashScreen;