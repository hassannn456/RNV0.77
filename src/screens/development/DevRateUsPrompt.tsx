import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  adminApi,
  useStartupPropertiesQuery,
} from '../../features/admin/admin.api';
import { store } from '../../store';
import { requestReview } from 'react-native-store-review';
import { RateUsPrompt } from '../../features/appReview/appRateUsPrompt';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfCard from '../../components/CsfCard';
import CsfText from '../../components/CsfText';
import CsfButton from '../../components/CsfButton';
import CsfRule from '../../components/CsfRule';
import CsfView from '../../components/CsfView';
import promptAlert from '../../components/CsfAlert';

const DevRateUsPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const startupProperties = useStartupPropertiesQuery(undefined);
  const startupPropertiesResult = adminApi.endpoints.startupProperties.select(
    undefined,
  )(store.getState());

  const rateUsEnabledFlag1 =
    startupProperties?.data?.data?.rateUsEnabled ?? false;
  const rateUsEnabledFlag2 =
    startupPropertiesResult?.data?.data?.rateUsEnabled ?? false;

  let inAppReview = {
    interactionTrigger: {
      remoteRccResCount: 0,
      lockCommandCount: 0,
      serviceAppointmentCount: 0,
    },
    promptDate: {
      alertCount: 0,
      currentYear: new Date().getFullYear(),
      nextAlertDate: new Date(),
      foreseeSurvey: '',
    },
    showAppReviewPrompt: false,
  } as RateUsPrompt;

  const storeAppReviewData = store.getState().preferences?.inAppReview;
  if (storeAppReviewData) {
    inAppReview = JSON.parse(storeAppReviewData) as RateUsPrompt;
  }

  const { interactionTrigger, promptDate } = inAppReview;

  return (
    <MgaPage
      title={t('appRating:mySubaruAppFeedback')}
      trackingId={'dev-controls'}
      bg="background">
      <MgaPageContent>
        <CsfCard gap={16} edgeInsets>
          <CsfText variant="heading2">Increment Prompt Triggers : </CsfText>
          <CsfButton
            variant="primary"
            title={'Remote RCC RES Count +'}
            onPress={() => {
              store.dispatch({
                type: 'preferences/triggerAppReview',
                payload: {
                  key: 'appRating',
                  value: 'remoteRccResCount',
                },
              });
              setCount(count + 1);
            }}
          />
          <CsfButton
            variant="primary"
            title={'Lock Command Count +'}
            onPress={() => {
              store.dispatch({
                type: 'preferences/triggerAppReview',
                payload: {
                  key: 'appRating',
                  value: 'lockCommandCount',
                },
              });
              setCount(count + 1);
            }}
          />
          <CsfButton
            variant="primary"
            title={'Service Appointment Count +'}
            onPress={() => {
              store.dispatch({
                type: 'preferences/triggerAppReview',
                payload: {
                  key: 'appRating',
                  value: 'serviceAppointmentCount',
                },
              });
              setCount(count + 1);
            }}
          />
          <CsfRule />

          <CsfText variant="heading2">Data : </CsfText>
          <CsfView>
            <CsfText>{`${interactionTrigger.remoteRccResCount} : Remote RCC RES count`}</CsfText>
            <CsfText>{`${interactionTrigger.lockCommandCount} : Lock command count`}</CsfText>
            <CsfText>{`${interactionTrigger.serviceAppointmentCount} : Service Appointment count`}</CsfText>
            <CsfText>{'\nNext Alert Date: '}</CsfText>
            <CsfText>{`${promptDate.nextAlertDate.toString()}`}</CsfText>
          </CsfView>
          <CsfRule />

          <CsfText variant="heading2">Prompts : </CsfText>
          <CsfButton
            variant="secondary"
            title={'Internal prompt :'}
            onPress={async () => {
              const title: string = t('appRating:mySubaruAppFeedback');
              const message: string = t('appRating:enjoyingMySubaruApp');
              const yes: string = t('common:yes');
              const no: string = t('appRating:notReally');
              await promptAlert(title, message, [
                { title: yes, type: 'primary' },
                { title: no, type: 'secondary' },
              ]);
            }}
          />
          <CsfButton
            variant="secondary"
            title={'App / Play Store prompt :'}
            onPress={() => {
              requestReview();
            }}
          />
          <CsfRule />

          <CsfText variant="heading2">Rate Us Enabled Flag : </CsfText>
          <CsfView>
            <CsfText>{`Startup property method 1 : ${rateUsEnabledFlag1.toString()}`}</CsfText>
            <CsfText>{`Startup property method 2 : ${rateUsEnabledFlag2.toString()}`}</CsfText>
          </CsfView>
          <CsfButton
            variant="secondary"
            title={'Reset all data'}
            onPress={() => {
              inAppReview = {
                interactionTrigger: {
                  remoteRccResCount: 0,
                  lockCommandCount: 0,
                  serviceAppointmentCount: 0,
                },
                promptDate: {
                  alertCount: 0,
                  currentYear: new Date().getFullYear(),
                  nextAlertDate: new Date(),
                  foreseeSurvey: '',
                },
                showAppReviewPrompt: false,
              } as RateUsPrompt;
              store.dispatch({
                type: 'preferences/set',
                payload: {
                  key: 'inAppReview',
                  value: JSON.stringify(inAppReview),
                },
              });
              setCount(0);
            }}
          />
        </CsfCard>
      </MgaPageContent>
    </MgaPage>
  );
};

export default DevRateUsPrompt;
