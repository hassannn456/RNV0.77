import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSasInfoQuery } from '../api/vehicle.api';
import { useAppNavigation } from '../Controller';

import { testID } from '../components/utils/testID';
import CsfDetail from '../components/CsfDetail';
import CsfListItem from '../components/CsfListItem';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaWarranty: React.FC = () => {
  const { t } = useTranslation();
  const sasInfo = useSasInfoQuery({});
  const sasData = sasInfo?.data?.data;
  const navigation = useAppNavigation();
  const id = testID('Warranty');
  const warrantyInfoList = [
    {
      title: t('warranty:agreementNumber'),
      value: `${sasData?.contractNumber || '--'}`,
    },
    {
      title: t('warranty:agreementType'),
      value: `${sasData?.contractType || '--'}`,
    },
    {
      title: t('warranty:agreementStatus'),
      value: `${sasData?.status || '--'}`,
    },
    {
      title: t('warranty:agreementDescription'),
      value: `${sasData?.planDescription || '--'}`,
    },
    {
      title: t('warranty:agreementStartDate'),
      value: `${sasData?.contractStartDate || '--'}`,
    },
    {
      title: t('warranty:agreementExpirationDate'),
      value: `${sasData?.contractExpirationDate || '--'}`,
    },
  ];
  interface warrantyList {
    title?: string
    subtitle?: string
    describe?: string
  }
  const warrantyCoverageList: warrantyList[] = t(
    'warrantyCoverage:warrantyCoverageData',
    {
      returnObjects: true,
    },
  );
  return (
    <MgaPage title={t('index:warrantyExtended')} showVehicleInfoBar>
      <MgaPageContent
        title={t('index:warrantyExtended')}
        isLoading={sasInfo.isFetching}>
        {sasInfo?.data && sasInfo?.data?.success && sasInfo?.data?.data && (
          <>
            <CsfView testID={id('addedSecurityPlans')}>
              <CsfText>{t('warranty:addedSecurityPlans')}</CsfText>
            </CsfView>
            <CsfRuleList testID={id('warrantyList')}>
              {warrantyInfoList?.map((warrantyInfo, i) => (
                <CsfDetail
                  key={i}
                  label={warrantyInfo.title}
                  value={`${warrantyInfo.value}`}
                  testID={id(`info-${i}`)}
                  stacked
                />
              ))}
              <CsfDetail
                testID={id('disclaimer')}
                label={t('warranty:disclaimer')}
                value={t('warranty:disclaimerInfo')}
                stacked
              />
            </CsfRuleList>
          </>
        )}
        <CsfText align="center" testID={id('summary')}>
          {t('warranty:summary')}
        </CsfText>
        <CsfRuleList testID={id('coverageList')}>
          {warrantyCoverageList?.map((coverage, i) => {
            const itemTestId = testID(id(`coverage-${i}`));
            return (
              <CsfListItem
                key={i}
                testID={itemTestId()}
                title={coverage.title}
                subtitle={
                  <CsfView>
                    <CsfText
                      variant="subheading"
                      testID={itemTestId('subtitle')}>
                      {coverage.subtitle}
                    </CsfText>
                    <CsfText
                      color="copySecondary"
                      testID={itemTestId('describe')}>
                      {coverage.describe}{' '}
                    </CsfText>
                  </CsfView>
                }
              />
            );
          })}
        </CsfRuleList>

        <MgaButton
          trackingId="WarrantyFaqsButton"
          title={t('warranty:warrantyFaqs')}
          onPress={() => {
            navigation.push('WarrantyFaq');
          }}
          variant="link"
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaWarranty;
