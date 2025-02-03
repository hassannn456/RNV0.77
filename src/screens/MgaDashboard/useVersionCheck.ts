// check + handle version change
import {
  getPreference,
  setPreference,
} from '../../features/preferences/preferences.slice';
import {highestVersion} from '../../utils/version';
import {InteractionManager, Platform} from 'react-native';
// import revisionJson from '../../../build/revision.json'
import {navigate} from '../../Controller';
import {useTranslation} from 'react-i18next';
import {AppHistoryItem} from '../../../@types';
import {has} from '../../features/menu/rules';

export const useVersionCheck = (): (() => void) => {
  // Per request from management, disable this logic entirely
  // TODO:AG:20240923: Re-enable after October 1.
  return () => {};
  const {t} = useTranslation();
  return (): void => {
    const oldVersion = getPreference('mgaVersion') ?? '0.0.0';
    // const currentVersion = revisionJson.version

    const history = t('appVersion:history', {returnObjects: true}) as [
      AppHistoryItem,
    ];
    // CVCON25-3798: When content is not populated 'appVersion:history' will just be 'history'.
    if (!Array.isArray(history)) {
      return;
    }

    const currentHistoryItem = history.find(h => h.version == currentVersion);

    const upgradeAlert = async () => {
      const os = Platform.OS as 'ios' | 'android';

      const message =
        currentHistoryItem?.[`changes-${os}`] ||
        currentHistoryItem?.changes ||
        t('appVersion:alertMessageDefault', {version: currentVersion});

      const learnMore = t('appVersion:learnMore');
      const result = await promptAlert(
        t('appVersion:alertTitle'),
        message,
        [
          {
            title: learnMore,
          },
          {
            title: t('common:dismiss'),
            type: 'link',
          },
        ],
        {type: 'success'},
      );

      if (result == learnMore) navigate('VersionNotice');
    };

    // update preference if version has changes
    if (oldVersion != currentVersion) {
      setPreference('mgaVersion', currentVersion);
    }
    // show alert if new version is newer than old version
    if (highestVersion(oldVersion, currentVersion) != oldVersion) {
      // wait for interactions to finish before showing alert
      // to deal w/ quirk of react navigation
      if (has('env:qa')) {
        void InteractionManager.runAfterInteractions(() => {
          void upgradeAlert();
        });
      }
    }
  };
};
