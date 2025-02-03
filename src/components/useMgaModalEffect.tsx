import React, { useEffect } from 'react';
import CsfPressable from './CsfPressable';
import CsfAppIcon from './CsfAppIcon';
import { useTranslation } from 'react-i18next';

export const useMgaModalEffect = (navigation: AppNavigation): void => {
  const { t } = useTranslation();
  useEffect(() => {
    navigation.setOptions({
      presentation: 'modal',
      headerRight: () => (
        <CsfPressable
          onPress={() => navigation.goBack()}
          accessibilityLabel={t('common:close')}>
          <CsfAppIcon icon="Close" />
        </CsfPressable>
      ),
    });
  }, []);
};
