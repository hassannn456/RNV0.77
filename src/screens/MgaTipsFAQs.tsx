/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { AccessRule, has } from '../features/menu/rules';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { testID } from '../components/utils/testID';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

const MgaTipsFAQs: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  let sectionHeader = '';

  interface list {
    question: string
    answer: string
    section: string
    accessRule: AccessRule | undefined
  }

  const faqsList: list[] = t('tipFaqs:faqs', {
    returnObjects: true,
  });

  const visibleFaqs = faqsList.filter(
    faq => !faq.accessRule || has(faq.accessRule, vehicle),
  );

  const id = testID('TripsFAQ');

  const RenderFaq = ({
    item,
    trackingId,
    itemTestID = '',
  }: {
    item: list
    trackingId: string
    itemTestID: string | undefined
  }) => {
    return (
      <MgaAccordionSection
        key={item.question}
        title={<CsfText variant="body">{item.question}</CsfText>}
        renderBody={() => (
          <CsfView edgeInsets standardSpacing>
            <CsfText testID={itemTestID}>{item.answer}</CsfText>
          </CsfView>
        )}
        trackingId={trackingId}
      />
    );
  };

  const RenderSectionHeader = ({
    item,
    itemTestID = '',
  }: {
    item: string
    itemTestID: string | undefined
  }) => {
    return (
      <CsfView mv={20} gap={24}>
        <CsfText variant="heading2" testID={itemTestID}>
          {item}
        </CsfText>
      </CsfView>
    );
  };

  return (
    <MgaPage title={'FAQs'} showVehicleInfoBar>
      <CsfView pv={20} ph={16}>
        <CsfView mb={24}>
          <CsfText variant="title2" align="center" testID={id('title')}>
            {t('tipFaqs:title')}
          </CsfText>
        </CsfView>

        {visibleFaqs?.map((faq, i) => {
          const itemTestID = testID(id(`faq-${i}`));
          if (faq.section !== sectionHeader) {
            sectionHeader = faq.section;
            return (
              // Render both the section and the FAQ if a new section is discovered.
              <CsfView key={faq.question}>
                <RenderSectionHeader
                  item={sectionHeader}
                  itemTestID={itemTestID('header')}
                />
                <RenderFaq
                  item={faq}
                  trackingId={`FaqAccordion-${i}`}
                  itemTestID={itemTestID()}
                />
              </CsfView>
            );
          } else {
            // In case of same section, render only Faq
            return (
              <RenderFaq
                item={faq}
                key={faq.question}
                trackingId={`Faq-Accordion-${i}`}
                itemTestID={itemTestID()}
              />
            );
          }
        })}
      </CsfView>
    </MgaPage>
  );
};

export default MgaTipsFAQs;
