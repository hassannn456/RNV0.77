/* eslint-disable eol-last */
import React from 'react';
import { store, useAppDispatch, useAppSelector } from '../store';
import {
  getEnvironmentConfig,
  getEnvironmentList,
  getLanguages,
} from '../features/localization/environment';
import CsfSelect, { CsfDropdownProps } from './CsfSelect';
import { loadLocalesFromS3 } from '../features/localization/localization.api';
import { setAppLanguage } from './MgaLanguageSelect';

const MgaEnvironmentSelect: React.FC<CsfDropdownProps> = props => {
  const environmentId = useAppSelector(state => state.preferences?.environment);
  const dispatch = useAppDispatch();
  const environmentConfig = getEnvironmentConfig(environmentId);
  const options = getEnvironmentList().map(e => ({
    label: e.id,
    value: e.id,
  }));
  return (
    <CsfSelect
      {...props}
      options={options}
      value={environmentConfig?.id}
      onSelect={environment => {
        dispatch({
          type: 'preferences/set',
          payload: { key: 'environment', value: environment },
        });
        // After environment change...
        setTimeout(() => {
          // If new language list does not have old language, default to first
          const currentLanguage = store.getState().preferences?.language;
          const newLanguages = getLanguages();
          if (newLanguages.length > 0) {
            if (!currentLanguage || !newLanguages.includes(currentLanguage)) {
              void setAppLanguage(newLanguages[0]);
            }
          }
          // Reload content data
          void loadLocalesFromS3();
        }, 1);
      }}
    />
  );
};


export default MgaEnvironmentSelect;