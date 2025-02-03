import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRoadsideAssistanceQuery,
  roadsideAssistanceInfo,
} from '../api/roadsideAssistance.api';
import { useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { has } from '../features/menu/rules';
import { formatFullDateTime } from '../utils/dates';
import {
  MgaVehicleInformationCard,
  MgaVehicleWarrantyInfo,
} from './MgaVehicleInformation';
import { testID } from '../components/utils/testID';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfDetail from '../components/CsfDetail';
import { MgaPhoneNumber } from '../components/CsfPhoneNumber';
import CsfRule from '../components/CsfRule';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaRoadsideAssistance: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const isHawaii = has('reg:HI', vehicle);
  const roadsideQuery = useRoadsideAssistanceQuery(undefined);
  const { data: response } = roadsideQuery;
  const roadsideAssistanceInfoData: roadsideAssistanceInfo[] =
    response?.data || [];
  const navigation = useAppNavigation();
  const featuresList = [
    t('roadsideAssistance:listItem1'),
    t('roadsideAssistance:listItem2'),
    t('roadsideAssistance:listItem3'),
    t('roadsideAssistance:listItem4'),
    t('roadsideAssistance:listItem5'),
    t('roadsideAssistance:listItem6'),
  ];
  const id = testID('RoadsideAssistance');
  return (
    <MgaPage title={t('branding:roadsideAssistance')} showVehicleInfoBar>
      <MgaPageContent
        title={t('branding:roadsideAssistance')}
        isLoading={roadsideQuery.isLoading || roadsideQuery.isFetching}>
        {!isHawaii && has('flg:mga.roadsideAssistance.onlineRequest') && (
          <MgaButton
            testID={id('submitOnlineRequest')}
            trackingId="RoadsideAssistanceSubmitOnlineRequestButton"
            title={t('roadsideAssistance:submitOnlineRequest')}
            onPress={() => {
              navigation.push('RoadsideAssistanceRequestForm');
            }}
          />
        )}
        <MgaPhoneNumber
          testID={id('callCta')}
          trackingId="RoadsideAssistancePhoneButton"
          phone={t('contact:roadsideAssistanceSupport')}
          title={t('roadsideAssistance:callCta')}
          variant="inlineLink"
        />
        <CsfView pt={16}>
          <CsfAccordionList testID={id('accordion')}>
            {roadsideAssistanceInfoData?.map((assistance, i) => (
              <MgaAccordionSection
                trackingId={`RoadsideAssistanceAccordion-${i}`}
                key={i}
                title={assistance.reasonCodeDisplay}
                subtitle={formatFullDateTime(assistance.timeSubmitted)}
                renderBody={() => (
                  <CsfView gap={16} p={16} testID={id('accordionBody')}>
                    <CsfRuleList testID={id('accordionBodyList')}>
                      <CsfDetail
                        label={t('roadsideAssistance:name')}
                        testID={id('name')}
                        value={`${assistance.firstName} ${assistance.lastName}`}
                      />
                      <CsfDetail
                        label={t('roadsideAssistance:requestId')}
                        testID={id('requestId')}
                        value={assistance.roadsideAssistanceId}
                      />
                      <CsfDetail
                        label={t('roadsideAssistance:status')}
                        testID={id('status')}
                        value={assistance.ageroStatus}
                      />
                    </CsfRuleList>
                    <MgaButton
                      trackingId="RoadsideAssistanceHistoryButton"
                      variant="secondary"
                      onPress={() => {
                        const rsaId: number = assistance.roadsideAssistanceId;
                        const vin: string = assistance.vin;
                        navigation.push('RoadsideAssistanceHistory', {
                          rsaId,
                          vin,
                          reason: assistance.reasonCodeDisplay,
                        });
                      }}
                      title={t('roadsideAssistance:getStatusHistory')}
                    />
                    <CsfText
                      align="center"
                      color="copySecondary"
                      testID={id('supportNumber')}>
                      {t('roadsideAssistance:callToCancel')}{' '}
                      {t('contact:roadsideAssistanceSupportNumber')}
                    </CsfText>
                  </CsfView>
                )}
              />
            ))}
          </CsfAccordionList>
        </CsfView>
        <MgaVehicleInformationCard
          vehicle={vehicle}
          testID={id('vehicleInformation')}
        />
        <MgaVehicleWarrantyInfo testID={id('warrantyInfo')} />
        <CsfView gap={8} testID={id('featuresContainer')}>
          <CsfText variant="heading" testID={id('features')}>
            {t('roadsideAssistance:features')}
          </CsfText>
          {featuresList.map((feature, i) => (
            <CsfBulletedList key={i}>
              <CsfText testID={id(`feature-${i}`)}>{feature}</CsfText>
            </CsfBulletedList>
          ))}
          <CsfView testID={id('coverageContainer')}>
            <CsfText variant="heading" testID={id('coverage')}>
              {t('roadsideAssistance:coverage')}
            </CsfText>
            <CsfText testID={id('coverageDescription')}>
              {t('roadsideAssistance:coverageDescription')}
            </CsfText>
            <CsfText
              color="copySecondary"
              testID={id('roadsideAssistanceSupportNumber')}>
              {t('contact:roadsideAssistanceSupportNumber')}
            </CsfText>
          </CsfView>
          <CsfView testID={id('exclusionsContainer')}>
            <CsfText variant="heading" testID={id('exclusions')}>
              {t('roadsideAssistance:exclusions')}
            </CsfText>
            <CsfText testID={id('exclusionsDescription')}>
              {t('roadsideAssistance:exclusionsDescription')}
            </CsfText>
          </CsfView>
          <CsfText testID={id('contactYourRetailer')}>
            {t('roadsideAssistance:contactYourRetailer')}
          </CsfText>
          <CsfRule />
          <CsfText variant="caption" testID={id('description')}>
            {t('roadsideAssistance:description')}
          </CsfText>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaRoadsideAssistance;
