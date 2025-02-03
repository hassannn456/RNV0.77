import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { CsfRadioButtonRing } from '../components/CsfRadioButton';
import { getLanguages } from '../features/localization/environment';
import { useAppDispatch, useAppSelector } from '../store';
import { testID } from '../components/utils/testID';
import i18n from '../i18n';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfPressable from '../components/CsfPressable';
import CsfTableViewCell from '../components/CsfTableViewCell';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const id = testID('MgaLanguages');

/** Languages Screen */
const MgaLanguages: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const current = useAppSelector(state => state.preferences?.language);
  const dispatch = useAppDispatch();
  return (
    <MgaPage title={t('common:language')}>
      <MgaPageContent title={t('common:language')}>
        <CsfPressable
          testID={id('languagePreferences')}
          onPress={() => navigation.push('LanguagePreferences')}>
          <CsfTile>
            <CsfView flexDirection="row" align="center" justify="space-between">
              <CsfText variant="subheading" testID={id('title')}>
                {t('languagePreferences:title')}
              </CsfText>
              <CsfAppIcon icon="BackForwardArrow" color="button" />
            </CsfView>
          </CsfTile>
        </CsfPressable>
        <CsfView>
          {getLanguages().map(lng => (
            <CsfTableViewCell
              ph={24}
              pv={16}
              testID={id(`lng-${lng}`)}
              key={lng}
              onPress={async () => {
                await i18n.changeLanguage(lng);
                dispatch({
                  type: 'preferences/set',
                  payload: { key: 'language', value: lng },
                });
              }}>
              <CsfView flexDirection="row" gap={16}>
                <CsfRadioButtonRing checked={current == lng} />
                <CsfText>{t('language:language', { lng: lng })}</CsfText>
              </CsfView>
            </CsfTableViewCell>
          ))}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaLanguages;
