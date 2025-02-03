import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useAppRoute } from '../../Controller';
import { getS3BucketUrl } from '../../features/localization/localization.api';
import { useTranslation } from 'react-i18next';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaAnalyticsContainer from '../../components/MgaAnalyticsContainer';
import CsfBottomModal from '../../components/CsfBottomModal';
import { CsfPager } from '../../components/CsfPager';

interface Campaign {
  slides?: Slide[]
}

interface Slide {
  step: string
  imageURL: string
}

const styles = StyleSheet.create({
  pageContainer: { height: 400 },
  imageStyle: { height: '100%', width: '100%' },
});

const MgaOTAHowToUpdate: React.FC = () => {
  const route = useAppRoute();
  const { t } = useTranslation();
  const campaign: Campaign = route.params as Campaign;
  const s3BucketUrl = getS3BucketUrl();

  const getPanel = (item: Slide, index: number) => {
    const imageURL = `${s3BucketUrl}/assets/OTACampaigns${item.imageURL}`;
    return (
      <CsfView key={index} align="center">
        <CsfView height={330} width={'100%'} align="center">
          <Image
            style={styles.imageStyle}
            resizeMode="contain"
            source={{
              uri: imageURL,
            }}
          />
        </CsfView>
        <CsfView pv={4} width={'100%'}>
          <CsfText align="left">{t(`OTACampaignSlides:${item.step}`)}</CsfText>
        </CsfView>
      </CsfView>
    );
  };

  const panels = campaign?.slides?.map(getPanel) ?? [];

  return (
    <MgaAnalyticsContainer trackingId="alpha">
      <CsfBottomModal closeIcon title={t('OTASoftwareUpdate:howToUpdateDescription')}>
        <CsfView>
          <CsfPager style={styles.pageContainer}>{panels}</CsfPager>
        </CsfView>
      </CsfBottomModal>
    </MgaAnalyticsContainer>
  );
};

export default MgaOTAHowToUpdate;
