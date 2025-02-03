import React from 'react';
import { useTranslation } from 'react-i18next';
import { testID } from '../components/utils/testID';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaWarrantyFaq: React.FC = () => {
  const { t } = useTranslation();
  const id = testID('WarrantyInfo');
  const warrantyFaqList = [
    {
      faqTitle: t('warranty:whatsCovered'),
      faqAnswer: [t('warranty:basicWarrantyInfo')],
      faqTextList: [
        t('warranty:basicWarrantyInfoListItem1'),
        t('warranty:basicWarrantyInfoListItem2'),
      ],
    },
    {
      faqTitle: t('warranty:warrantyPeriodBegin'),
      faqAnswer: [t('warranty:warrantyPeriodBeginInfo')],
    },
    {
      faqTitle: t('warranty:whenDoTheseWarrantiesApply'),
      faqAnswer: [t('warranty:warrantiesInfo1'), t('warranty:warrantiesInfo2')],
    },
  ];
  return (
    <MgaPage title={t('warranty:warrantyFaqsTitle')} showVehicleInfoBar>
      <MgaPageContent title={t('warranty:warrantyFaqsTitle')}>
        <CsfAccordionList testID={id()}>
          {warrantyFaqList.map((warrantyFaq, i) => (
            <MgaAccordionSection
              trackingId={`WarrantyFaqAccordion-${i}`}
              key={i}
              title={warrantyFaq.faqTitle}
              renderBody={() => (
                <CsfView edgeInsets standardSpacing testID={id(`body-${i}`)}>
                  {warrantyFaq?.faqAnswer?.map((answer, i) => (
                    <CsfText key={i} testID={id(`answer-${i}`)}>
                      {answer}
                    </CsfText>
                  ))}
                  {warrantyFaq?.faqTextList?.map((listItem, i) => (
                    <CsfBulletedList key={i} testID={id(`list-${i}`)}>
                      <CsfText testID={id(`listItem-${i}`)}>{listItem}</CsfText>
                    </CsfBulletedList>
                  ))}
                </CsfView>
              )}
            />
          ))}
        </CsfAccordionList>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaWarrantyFaq;
