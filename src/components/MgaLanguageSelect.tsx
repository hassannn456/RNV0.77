import React from 'react';
import { useTranslation } from 'react-i18next';
import { store, useAppSelector } from '../store';
import CsfSelect, { CsfDropdownItem, CsfDropdownProps } from './CsfSelect';
import { getLanguages } from '../features/localization/environment';
import i18n from '../i18n';

/** Set language for app and update preferences. */
export const setAppLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);
  store.dispatch({
    type: 'preferences/set',
    payload: { key: 'language', value: language },
  });
};

/** In Vehicle messages use different language codes */
const mapLanguageCodeToInVehicleCode = (code: string): string => {
  return { en: 'ENU', fr: 'FRA' }[code] ?? code;
};

export interface MgaLanguageSelectProps extends CsfDropdownProps {
  /** In Vehicle messages use different language codes */
  inVehicle?: boolean
}

const MgaLanguageSelect: React.FC<MgaLanguageSelectProps> = props => {
  const { t } = useTranslation();
  const current = useAppSelector(state => state.preferences?.language);
  const { inVehicle, label, onSelect, options, value, ...selectProps } = props;
  const languages: CsfDropdownItem[] = getLanguages().map(lng => ({
    label: t('language:language', { lng: lng }),
    value: inVehicle ? mapLanguageCodeToInVehicleCode(lng) : lng,
  }));
  return (
    <CsfSelect
      {...selectProps}
      options={options ?? languages}
      value={value ?? current}
      label={label ?? t('common:language')}
      onSelect={onSelect ?? setAppLanguage}
    />
  );
};

export default MgaLanguageSelect;
