/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation } from '../Controller';
import { profileApi } from '../api/profile.api';
import { store } from '../store';
import { trackError } from '../components/useTracking';
import MgaLanguageSelect, { setAppLanguage } from '../components/MgaLanguageSelect';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

interface MgaLanguagePreferencesState {
  isLoading?: boolean
  isSaving?: boolean
  appLanguage: string
  communicationLanguage: string
}

const defaultState: MgaLanguagePreferencesState = {
  appLanguage: 'en',
  communicationLanguage: 'ENU',
};

const MgaLanguagePreferences: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [state, setState] = useState<MgaLanguagePreferencesState>(defaultState);
  const onLoad = async () => {
    setState({ ...state, isLoading: true });
    const request =
      profileApi.endpoints.getLanguagePreferences.initiate(undefined);
    const response = await store.dispatch(request).unwrap();
    if (response.success) {
      const communicationLanguage =
        response.data?.preferences?.find(
          p => p.preferenceName == 'Language - Communication',
        )?.preferenceValue ?? defaultState.communicationLanguage;
      const appLanguage =
        store.getState().preferences?.language ?? defaultState.appLanguage;
      setState({
        ...state,
        appLanguage,
        communicationLanguage,
        isLoading: false,
      });
    } else {
      void promptAlert(
        t('starlinkNotifications:preferenceSettingsError'),
        t('starlinkNotifications:unableToDisplayYourPreferences'),
      );
    }
  };
  const popIfNeeded = () => {
    popIfTop(navigation, 'LanguagePreferences');
  };
  const onSave = async () => {
    setState({ ...state, isSaving: true });
    const body = { communicationLanguage: state.communicationLanguage };
    const request =
      profileApi.endpoints.updateLanguagePreferences.initiate(body);
    const response = await store.dispatch(request).unwrap();
    if (response.success) {
      await promptAlert(
        t('common:success'),
        t('starlinkNotifications:changesHaveBeenSaved'),
      );
      popIfNeeded();
    }
    await setAppLanguage(state.appLanguage);
    setState({ ...state, isSaving: false });
  };
  useEffect(() => {
    onLoad().then().catch(trackError('MgaLanguagePreferences::onLoad'));
  }, []);

  const id = testID('LanguagePreference');
  return (
    <MgaPage title={t('languagePreferences:title')} showVehicleInfoBar>
      <MgaPageContent
        isLoading={state.isLoading}
        title={t('languagePreferences:title')}>
        <CsfText variant="body" testID={id('pageDescription')}>
          {t('languagePreferences:pageDescription')}
        </CsfText>
        <CsfTile>
          <CsfText variant="subheading" testID={id('starlinkComm')}>
            {t('languagePreferences:starlinkComm')}
          </CsfText>
          <CsfText variant="body" testID={id('starlinkCommDescription')}>
            {t('languagePreferences:starlinkCommDescription')}
          </CsfText>
          <MgaLanguageSelect
            value={state.communicationLanguage}
            inVehicle
            onSelect={lng => setState({ ...state, communicationLanguage: lng })}
            testID={id('communicationLanguage')}
          />
        </CsfTile>
        <CsfTile>
          <CsfText variant="subheading" testID={id('deviceSettings')}>
            {t('languagePreferences:deviceSettings')}
          </CsfText>
          <CsfText variant="body" testID={id('deviceSettingsDescription')}>
            {t('languagePreferences:deviceSettingsDescription')}
          </CsfText>
          <MgaLanguageSelect
            value={state.appLanguage}
            onSelect={lng => setState({ ...state, appLanguage: lng })}
            testID={id('appLanguage')}
          />
        </CsfTile>
        <CsfView p={16} gap={12} flexDirection="row" justify="space-between">
          <MgaButton
            style={{ flex: 1 }}
            title={t('common:cancel')}
            variant="secondary"
            trackingId="LanguagePreferencesCancel"
            onPress={popIfNeeded}
          />
          <MgaButton
            style={{ flex: 1 }}
            disabled={state.isSaving}
            title={t('common:save')}
            onPress={onSave}
            trackingId="LanguagePreferencesSave"
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaLanguagePreferences;
