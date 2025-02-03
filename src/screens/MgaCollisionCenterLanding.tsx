/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground } from 'react-native';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
// import CollisionBackground from '../../content/img/collision-center-bg.jpg'
import { testID } from '../components/utils/testID';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import mgaOpenURL from '../components/utils/linking';

const MgaCollisionCenterLanding: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = getCurrentVehicle();
  const whySubaruContent: Record<string, string>[] = [
    {
      title: t('certifiedCollisionCenters:originalFitAndAppearance'),
      description1: t('certifiedCollisionCenters:fitDescription1'),
      description2: t('certifiedCollisionCenters:fitDescription2'),
    },
    {
      title: t('certifiedCollisionCenters:safetyTested'),
      description1: t('certifiedCollisionCenters:safetyDescription1'),
      description2: t('certifiedCollisionCenters:safetyDescription2'),
      description3: t('certifiedCollisionCenters:safetyDescription3'),
    },
    {
      title: t('certifiedCollisionCenters:builtToLast'),
      description1: t('certifiedCollisionCenters:builtDescription'),
    },
  ];

  const id = testID('CollisionCenter');
  return (
    <MgaPage title={t('certifiedCollisionCenters:title')} showVehicleInfoBar>
      { }
      <ImageBackground
        // source={CollisionBackground}
        style={{ width: '100%' }}>
        <CsfView theme="dark" edgeInsets standardSpacing>
          <CsfText
            variant="title2"
            align="center"
            testID={id('subaruCollisionCenter')}>
            {t('certifiedCollisionCenters:subaruCollisionCenter')}
          </CsfText>
          <CsfText
            align="center"
            color="copyPrimary"
            variant="heading2"
            testID={id('bannerContent')}>
            {t('certifiedCollisionCenters:bannerContent')}
          </CsfText>
          <MgaButton
            trackingId="CollisionCenterFindButton"
            title={t('certifiedCollisionCenters:findACollisionCenter')}
            onPress={() =>
              mgaOpenURL(
                t('certifiedCollisionCenters:collisionCenterUrl', {
                  when: vehicle?.customer?.zip,
                }),
              )
            }
          />
        </CsfView>
      </ImageBackground>
      <CsfView edgeInsets standardSpacing>
        <CsfText testID={id('mainContent')}>
          {t('certifiedCollisionCenters:mainContent')}
        </CsfText>
      </CsfView>
      {/* Light Gray Panel */}
      <CsfView edgeInsets standardSpacing>
        <CsfText variant="title3" align="center" testID={id('whySubaruParts')}>
          {t('certifiedCollisionCenters:whySubaruParts')}
        </CsfText>
        <CsfText testID={id('whySubaruPartsDescription')}>
          {t('certifiedCollisionCenters:whySubaruPartsDescription')}
        </CsfText>
        {whySubaruContent?.map((whySubaru, i) => {
          const itemTestID = testID(id(`whySubaru-${i}`));
          return (
            <MgaAccordionSection
              trackingId={`CollisionCenterAccordion-${i}`}
              testID={itemTestID('accordion')}
              key={i}
              title={whySubaru.title}
              renderBody={() => (
                <CsfView edgeInsets standardSpacing>
                  <CsfView>
                    <CsfText testID={itemTestID('description1')}>
                      {whySubaru.description1}
                    </CsfText>
                    {whySubaru?.description2 && (
                      <CsfView>
                        <CsfText testID={itemTestID('description2')}>
                          {whySubaru.description2}
                        </CsfText>
                      </CsfView>
                    )}
                    {whySubaru?.description3 && (
                      <CsfText testID={itemTestID('description3')}>
                        {whySubaru.description3}
                      </CsfText>
                    )}
                  </CsfView>
                </CsfView>
              )}
            />
          );
        })}
      </CsfView>
    </MgaPage>
  );
};

export default MgaCollisionCenterLanding;
