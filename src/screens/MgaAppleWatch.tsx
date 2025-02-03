import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WatchInfo } from '../../@types/Communicator';
import { useAppNavigation } from '../Controller';
import i18n from '../i18n';
import {
  fetchWatchInfo,
  forgetWatchInfo,
  pairWithWatch,
} from '../features/watch/watch';
import { NormalResult } from '../../@types';
import { trackError } from '../components/useTracking';
import { cNetworkError } from '../api';
import { featureFlagEnabled } from '../features/menu/rules';
import CsfCard from '../components/CsfCard';
import { CsfAlertAction } from '../components';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaHeroPage from '../components/MgaHeroPage';
import mgaOpenURL from '../components/utils/linking';

/**
 * Show prompt after pairing.
 **/
export const promptAfterPair = async (
  response: NormalResult<WatchInfo>,
): Promise<boolean> => {
  const { t } = i18n;
  const ok = response.success;
  const title = ok ? t('common:success') : t('appleWatch:syncFailureTitle');
  const debugSuffix =
    featureFlagEnabled('mga.watch.errorCodes') && response.errorCode
      ? `\n\n[${response.errorCode}]`
      : '';
  const message: string = (() => {
    if (ok) {
      return t('appleWatch:syncSuccessMessage');
    } else {
      if (response.data) {
        trackError('promptAfterPair::error')(response.errorCode, response.data);
      } else {
        trackError('promptAfterPair::error')(response.errorCode);
      }
      switch (response.errorCode) {
        // Supported error codes, show message
        case 'EWC_NotReachable':
        case 'EWC_NotPaired':
        case 'EWC_NotSupported':
        case 'EWC_SendMessageFailed':
        case 'EWC_WatchAppNotInstalled':
          return t(`appleWatch:${response.errorCode}`);
        case cNetworkError:
        case 'NETWORK_ERROR':
          return t('message:notConnected');
        // Fallback to generic error
        default:
          return t('appleWatch:syncFailureMessage');
      }
    }
  })();
  const retry = t('appleWatch:retry');
  const type = ok ? 'success' : 'error';
  const actions: CsfAlertAction[] = ok
    ? [
      {
        title: t('common:ok'),
        type: 'primary',
      },
    ]
    : [
      {
        title: retry,
        type: 'primary',
      },
    ];
  const userResponse = await promptAlert(
    title,
    message + debugSuffix,
    actions,
    { type },
  );
  return userResponse == retry;
};

// Enumerated values for view state of the watch screen
const wsLoading = 1;
const wsPhoneNotSupported = 2;
const wsWatchNotFound = 3;
const wsWatchAppNotInstalled = 4;
const wsWatchNotReachable = 5;
const wsWatchGetStarted = 6;
const wsWatchComplete = 7;

const MgaAppleWatch: React.FC = () => {
  const navigation = useAppNavigation();
  const [watchInfo, setWatchInfo] = useState<
    NormalResult<WatchInfo> | undefined
  >(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    fetchWatchInfo()
      .then(setWatchInfo)
      .catch(trackError('MgaAppleWatch::onLoad'));
    // CVCON25-3785 - Watch state can update without notifying phone
    const timer = setInterval(() => {
      fetchWatchInfo()
        .then(setWatchInfo)
        .catch(trackError('MgaAppleWatch::onTimer'));
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const watchState: number = (() => {
    if (!watchInfo) { return wsLoading; }
    if (watchInfo.errorCode == 'EWC_NotSupported') { return wsPhoneNotSupported; }
    if (!watchInfo.data?.isPaired) { return wsWatchNotFound; }
    if (!watchInfo.data?.isWatchAppInstalled) { return wsWatchAppNotInstalled; }
    if (!watchInfo.data?.isReachable) { return wsWatchNotReachable; }
    if (!watchInfo.data?.watchName) { return wsWatchGetStarted; }
    return wsWatchComplete;
  })();
  const [title, subtitle, copy]: (string | undefined)[] = (() => {
    switch (watchState) {
      case wsLoading:
        return [];
      case wsPhoneNotSupported:
        return [
          t('appleWatch:syncFailureTitle'),
          undefined,
          t('appleWatch:EWC_NotSupported'),
        ];
      case wsWatchNotFound:
        return [
          t('appleWatch:syncFailureTitle'),
          undefined,
          t('appleWatch:EWC_NotPaired'),
        ];
      case wsWatchAppNotInstalled:
        return [
          t('appleWatch:syncFailureTitle'),
          undefined,
          t('appleWatch:EWC_WatchAppNotInstalled'),
        ];
      case wsWatchNotReachable:
        return [
          t('appleWatch:syncFailureTitle'),
          undefined,
          t('appleWatch:EWC_NotReachable'),
        ];
      case wsWatchGetStarted:
        return [
          t('appleWatch:welcome'),
          t('appleWatch:syncingYourAppleWatch'),
          t('appleWatch:pleaseStayOnScreen'),
        ];
      case wsWatchComplete:
        return [t('appleWatch:welcome'), undefined, t('appleWatch:watchPaired')];
      default:
        return [];
    }
  })();
  const openWatchAppUrl = t('appleWatch:openWatchAppUrl');
  const pair = async () => {
    setIsSyncing(true);
    const pairResponse = await pairWithWatch();
    setIsSyncing(false);
    const retry = await promptAfterPair(pairResponse);
    if (retry) {
      await pair();
    } else if (pairResponse.success) {
      dismiss();
    }
  };
  const forget = async () => {
    await forgetWatchInfo();
    fetchWatchInfo()
      .then(setWatchInfo)
      .catch(trackError('MgaAppleWatch::forget'));
  };
  const dismiss = () => {
    navigation.pop();
  };

  return (
    <MgaHeroPage
      showVehicleInfoBar={true}

      heroSource={require('../../content/png/watch-sync-landing-hero.png')}
      title={t('appleWatch:title')}>
      <CsfView p={8} pv={16} gap={8} flexDirection="column" justify="center">
        {title && (
          <CsfText align="center" color="light" variant="title2">
            {title}
          </CsfText>
        )}
        {subtitle && (
          <CsfText align="center" variant="heading">
            {subtitle}
          </CsfText>
        )}
        {copy && (
          <CsfText align="center" variant="body2" color="copySecondary">
            {copy}
          </CsfText>
        )}
        {watchState == wsLoading && (
          <CsfView height={240} flexDirection="column" justify="center">
            <CsfActivityIndicator
              size="large"
              accessibilityLabel={t('appleWatch:holdTight')}
            />
          </CsfView>
        )}
        {watchState == wsWatchAppNotInstalled && openWatchAppUrl && (
          <MgaButton
            trackingId="AppleWatch.DeeplinkWatchApp"
            title={t('appleWatch:openWatchAppCTA')}
            onPress={() => mgaOpenURL(openWatchAppUrl)}
          />
        )}
        {watchState == wsWatchGetStarted && (
          <MgaButton
            trackingId="AppleWatch.GetStarted"
            title={t('appleWatch:getStarted')}
            onPress={pair}
            isLoading={isSyncing}
          />
        )}
        {watchState == wsWatchComplete && watchInfo?.data?.watchName && (
          <CsfView theme="light">
            <CsfCard>
              <CsfView flexDirection="row" justify="space-between">
                <CsfView>
                  <CsfText variant="heading">{t('appleWatch:myWatch')}</CsfText>
                  <CsfText variant="body2" color="copySecondary">
                    {watchInfo.data.watchName}
                  </CsfText>
                </CsfView>
                <MgaButton
                  variant="link"
                  trackingId="AppleWatch.Forget"
                  title={t('appleWatch:forget')}
                  onPress={forget}
                />
              </CsfView>
            </CsfCard>
          </CsfView>
        )}
        {!isSyncing && watchState != wsLoading && (
          <MgaButton
            variant="link"
            trackingId="AppleWatch.Dismiss"
            title={t('common:dismiss')}
            onPress={dismiss}
          />
        )}
      </CsfView>
    </MgaHeroPage>
  );
};


export default MgaAppleWatch;
