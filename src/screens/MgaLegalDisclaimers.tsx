/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import mgaOpenURL from '../components/utils/linking';

interface LegalDisclaimerStructure {
  title: string
  linkURL: string
}

const legalDisclaimerList: LegalDisclaimerStructure[] = [
  {
    title: 'legalDisclaimers:title',
    linkURL: 'urls:legalDisclaimers',
  },
  {
    title: 'legalDisclaimers:privacyPolicy',
    linkURL: 'urls:privacyPolicy',
  },
  {
    title: 'legalDisclaimers:mySubaruTermsConditions',
    linkURL: 'urls:mySubaruTermsConditions',
  },
  {
    title: 'legalDisclaimers:starlinkTermsConditions',
    linkURL: 'urls:starlinkTermsConditions',
  },
  {
    title: 'legalDisclaimers:personalInformationPolicy',
    linkURL: 'urls:personalInformationPolicy',
  },
  {
    title: 'legalDisclaimers:sensitivePersonalInfo',
    linkURL: 'urls:sensitivePersonalInfo',
  },
  {
    title: 'legalDisclaimers:californiaPrivacyPolicy',
    linkURL: 'urls:californiaPrivacyPolicy',
  },
];

/** TODO:UA:20230202: Legal Disclaimer screen */
const MgaLegalDisclaimers: React.FC = () => {
  const { t, i18n } = useTranslation();

  const id = testID('LegalDisclaimer');
  return (
    <MgaPage title={t('legalDisclaimers:title')} showVehicleInfoBar>
      <FlatList
        data={legalDisclaimerList}
        ListHeaderComponent={
          <CsfView standardSpacing edgeInsets testID={id()}>
            <CsfText variant="title2" align="center" testID={id('title')}>
              {t('legalDisclaimers:title')}
            </CsfText>
            <CsfText variant="heading" testID={id('openInNewPage')}>
              {t('legalDisclaimers:openInNewPage')}
            </CsfText>
          </CsfView>
        }
        renderItem={({ item }) => (
          <MgaButton
            trackingId="LegalDisclaimerButton"
            variant="link"
            // icon={'OutboundLink'}
            title={t(item.title)}
            style={{
              alignSelf: 'flex-start',
            }}
            onPress={() =>
              mgaOpenURL(t(item.linkURL, { context: i18n.language }))
            }
          />
        )}
      />
    </MgaPage>
  );
};

export default MgaLegalDisclaimers;
