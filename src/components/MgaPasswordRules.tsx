import React from 'react';
import { useTranslation } from 'react-i18next';
import CsfText from './CsfText';
import CsfBulletedList from './CsfBulletedList';
import CsfView from './CsfView';
import { testID } from './utils/testID';

/** List of password rules */
const MgaPasswordRules: React.FC<{ testID?: string }> = props => {
  const { t } = useTranslation();
  const id = testID(props.testID || 'PasswordRules');
  return (
    <CsfView testID={id()}>
      <CsfText variant="bold" testID={id('passwordRule')}>
        {t('passwordRules:passwordRule')}
      </CsfText>
      <CsfBulletedList gap={0}>
        <CsfText testID={id('charactersLength')}>
          {t('passwordRules:charactersLength')}
        </CsfText>
        <CsfText testID={id('uppercaseCharacters')}>
          {t('passwordRules:uppercaseCharacters')}
        </CsfText>
        <CsfText testID={id('lowercaseCharacters')}>
          {t('passwordRules:lowercaseCharacters')}
        </CsfText>
        <CsfText testID={id('numberRules')}>
          {t('passwordRules:numberRules')}
        </CsfText>
        <CsfText testID={id('noSpacesAllowed')}>
          {t('passwordRules:noSpacesAllowed')}
        </CsfText>
        <CsfText testID={id('specialCharacterRules')}>
          {t('passwordRules:specialCharacterRules')}
        </CsfText>
        <CsfText testID={id('notExistingPassword')}>
          {t('passwordRules:notExistingPassword')}
        </CsfText>
      </CsfBulletedList>
    </CsfView>
  );
};

export default MgaPasswordRules;
