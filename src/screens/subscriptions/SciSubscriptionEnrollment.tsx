/* eslint-disable eol-last */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canadaInitialEnrollmentApi,
  useCanadaPriceCheckMutation,
  useCanadaRateSchedulesQuery,
} from '../../api/caInitialEnrollment.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { formatFullDate, parseDateObject } from '../../utils/dates';
import MgaSubscriptionFeatureListSafety from './MgaSubscriptionFeatureListSafety';
import MgaSubscriptionFeatureListRemote from './MgaSubscriptionFeatureListRemote';
import MgaSubscriberInfoForm from './MgaSubscriberInfoForm';
import { testID } from '../../components/utils/testID';
import { MgaCartItem, MgaCartLineItemView } from '../../components/MgaCart';
import { formatCurrencyForBilling } from '../../utils/subscriptions';
import { store } from '../../store';
import { accountApi } from '../../api/account.api';
import { useAppNavigation } from '../../Controller';
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView';
import { MgaPaymentInformationFormRef } from './MgaBillingInformationEdit';
import {
  canadaManageEnrollmentApi,
  useCanadaCurrentEnrollmentQuery,
} from '../../api/caManageEnrollment.api';
import {
  AriaBillingDetails,
  getNameForPlan,
} from '../../api/manageEnrollment.api';
import CsfView from '../../components/CsfView';
import promptAlert from '../../components/CsfAlert';
import CsfText from '../../components/CsfText';
import CsfTile from '../../components/CsfTile';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';

/**
 * List of STARLINK features advertised by SCI.
 *
 * Used in enrollment and cancel.
 **/
export const SciStarlinkFeaturesView: React.FC = () => {
  const { t } = useTranslation();
  const id = testID('connectedServices');
  return (
    <CsfView gap={8}>
      <CsfTile>
        <CsfText variant="subheading" testID={id('safetyFeatures')}>
          {t('subscriptionEnrollment:safetyFeatures')}
        </CsfText>
        <MgaSubscriptionFeatureListSafety gap={0} />
      </CsfTile>
      <CsfTile>
        <CsfText variant="subheading" testID={id('securityFeatures')}>
          {t('subscriptionEnrollment:securityFeatures')}
        </CsfText>
        <MgaSubscriptionFeatureListRemote hideSafetyIntro gap={0} />
      </CsfTile>
      <CsfTile>
        <CsfText variant="subheading" testID={id('conciergeFeatures')}>
          {t('subscriptionEnrollment:conciergeFeatures')}
        </CsfText>
        <CsfText variant="body2" testID={id('conciergeFeatureDescription')}>
          {t('subscriptionEnrollment:conciergeFeatureDescription')}
        </CsfText>
      </CsfTile>
    </CsfView>
  );
};

/** Subscription Enrollment for Canada */
const SciSubscriptionEnrollment: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const vParams = { vin: vehicle?.vin ?? '' };
  const rateSchedules = useCanadaRateSchedulesQuery(vParams);
  const [priceCheck, priceCheckResponse] = useCanadaPriceCheckMutation();
  const [isEnrolling, setEnrolling] = useState(false);
  const [page, setPage] = useState(1);
  const [subscriberInfoForm, setSubscriberInfoForm] = useState<object>({});
  const formRef = useRef<MgaPaymentInformationFormRef>(null);
  const { allInRateSchedule, startDate, endDate } =
    rateSchedules.data?.data ?? {};

  const id = testID('SciSubscriptionEnrollment');
  const currentEnrollment = useCanadaCurrentEnrollmentQuery({
    vin: vehicle?.vin ?? '',
  });

  const allInPlan = currentEnrollment?.data?.data?.find(
    plan => plan.starlinkPackage == 'ALLIN',
  );

  useEffect(() => {
    if (!allInRateSchedule) return;
    const subscriptionEnrollmentForm = {
      allInMasterPlanId: allInRateSchedule?.masterPlanId,
      allInRateScheduleId: allInRateSchedule?.rateScheduleId,
    };
    priceCheck(subscriptionEnrollmentForm).then().catch(console.error);
  }, [allInRateSchedule]);

  const ccRequired = allInRateSchedule?.price;
  const PlansPage: React.FC = () => {
    const dates = {
      startDate: formatFullDate(parseDateObject(startDate)),
      endDate: formatFullDate(parseDateObject(endDate)),
    };

    return (
      <CsfView gap={8}>
        <CsfText
          align="center"
          variant="heading"
          testID={id('starlinkConnectedServices')}>
          {getNameForPlan(allInPlan)}
        </CsfText>
        <CsfTile gap={4}>
          <CsfText variant="subheading" testID={id('freeTrial')}>
            {ccRequired
              ? t('subscriptionEnrollment:annualSubscription')
              : t('subscriptionEnrollment:freeTrial')}
          </CsfText>
          {dates && (
            <CsfText variant="body2" testID={id('freeTrialDateRange')}>
              {ccRequired
                ? t('trafficConnectSubscription:through', {
                  when: dates.endDate,
                })
                : t('subscriptionEnrollment:freeTrialDateRange', dates)}
            </CsfText>
          )}
        </CsfTile>
        <MgaButton
          trackingId="SciSubscriptionEnrollmentNext"
          title={t('common:next')}
          onPress={() => setPage(2)}
        />
        <SciStarlinkFeaturesView />
        <MgaButton
          trackingId="SciSubscriptionEnrollmentNext"
          title={t('common:next')}
          onPress={() => setPage(2)}
        />
      </CsfView>
    );
  };
  const SubscriberInfoFormPage: React.FC = () => {
    return (
      <MgaSubscriberInfoForm
        pinRequired={true}
        onCancel={() => setPage(1)}
        onSubmit={data => {
          setSubscriberInfoForm(data);
          setPage(3);
        }}
      />
    );
  };
  const CheckoutPage: React.FC = () => {
    const item: MgaCartItem = {
      title: getNameForPlan(allInPlan),
      months: allInRateSchedule?.months,
      priceString: formatCurrencyForBilling(allInRateSchedule?.price),
    };
    const {
      invoiceCreditAmount,
      invoicePreTaxTotal,
      invoiceTaxTotal,
      invoiceTotal,
    } = priceCheckResponse.data?.data?.enrollResponse.subscriptionResult ?? {};
    const priceCheckOk = priceCheckResponse.data?.data?.enrollResponse;
    const InvoiceLine: React.FC<{
      bold?: boolean
      testID?: string
      title?: string
      amount?: number
    }> = ({ bold, testID, title, amount }) => {
      return (
        <CsfView flexDirection="row" align="center" justify="space-between">
          <CsfText bold={bold} testID={testID}>
            {title}
          </CsfText>
          <CsfText bold={bold} testID={id('calculating')}>
            {amount != undefined
              ? formatCurrencyForBilling(amount)
              : t('subscriptionEnrollment:calculating')}
          </CsfText>
        </CsfView>
      );
    };
    return (
      <CsfView gap={8}>
        <CsfTile>
          <CsfText variant="heading" testID={id('confirmation')}>
            {t('common:confirmation')}
          </CsfText>
          <CsfText variant="subheading" testID={id('orderDetails')}>
            {t('subscriptionUpgrade:orderDetails')}
          </CsfText>
          <MgaCartLineItemView item={item} onEdit={() => setPage(1)} />
          <InvoiceLine
            testID={id('yourSubTotal')}
            title={t('subscriptionModify:yourSubTotal')}
            amount={
              invoicePreTaxTotal != undefined &&
                invoiceCreditAmount != undefined
                ? invoicePreTaxTotal - invoiceCreditAmount
                : undefined
            }
          />
          <InvoiceLine
            testID={id('tax')}
            title={t('subscriptionModify:tax')}
            amount={invoiceTaxTotal}
          />
          <InvoiceLine
            bold
            testID={id('total')}
            title={t('subscriptionModify:total')}
            amount={invoiceTotal}
          />
        </CsfTile>
        <CsfView flexDirection="row" gap={8}>
          <MgaButton
            trackingId="SubscriptionEnrollmentBack"
            flex={1}
            title={t('common:back')}
            variant="secondary"
            onPress={() => setPage(2)}
          />
          <MgaButton
            trackingId="SubscriptionEnrollmentContinueSubscribe"
            isLoading={isEnrolling}
            flex={1}
            title={t(ccRequired ? 'common:continue' : 'common:subscribeNow')}
            variant="primary"
            bg={priceCheckOk ? 'button' : 'disabled'}
            onPress={
              priceCheckOk
                ? async () => {
                  if (ccRequired) {
                    setPage(4);
                  } else {
                    if (isEnrolling) return;
                    setEnrolling(true);
                    await onEnroll();
                    setEnrolling(false);
                  }
                }
                : undefined
            }
          />
        </CsfView>
      </CsfView>
    );
  };
  const onEnroll = async () => {
    if (!allInRateSchedule) return;
    // ARIA Check
    let ariaAccountExists = !ccRequired;
    if (ccRequired) {
      if (!formRef.current) return;
      if (!formRef.current.validate()) return;
      // Check existing ARIA token
      const request =
        canadaInitialEnrollmentApi.endpoints.canadaCheckForExistingAriaAccount.initiate(
          undefined,
        );
      const response = await store.dispatch(request).unwrap();
      ariaAccountExists = response.data ?? false;
      if (ariaAccountExists) {
        const billingOk = await formRef.current.submit();
        if (!billingOk) {
          return;
        }
      }
    }
    const form = {
      allInMasterPlanId: allInRateSchedule?.masterPlanId,
      allInRateScheduleId: allInRateSchedule?.rateScheduleId,
      ...subscriberInfoForm,
    };
    // Initial enrollment
    const enrollmentRequest =
      canadaInitialEnrollmentApi.endpoints.canadaEnroll.initiate(form);
    const enrollmentResponse = await store.dispatch(enrollmentRequest).unwrap();
    if (
      !enrollmentResponse.success ||
      !enrollmentResponse.data?.enrollResponse.overallResult?.success
    ) {
      const errorCode4027 =
        enrollmentResponse.errorCode == 'UNABLE_TO_AUTHORIZE_CREDIT_CARD' ||
        enrollmentResponse.data?.enrollResponse.overallResult?.errorCode == 4027;
      await promptAlert(
        t('common:error'),
        errorCode4027
          ? t('subscriptionEnrollment:4027error')
          : t('subscriptionEnrollment:notAbleToEnroll'),
        [{ title: t('common:continue') }],
      );
      return;
    }
    // Submit billing info
    if (ccRequired && !ariaAccountExists) {
      if (!formRef.current) return;
      /* eslint-disable camelcase */
      const routing: Partial<AriaBillingDetails> = enrollmentResponse.data
        ? {
          client_no: enrollmentResponse.data.ariaClientNumber,
          mode: enrollmentResponse.data.ariaMode,
          inSessionID:
            enrollmentResponse.data.enrollResponse.overallResult
              .subscriptionResult.sessionId,
          pending_invoice_no:
            enrollmentResponse.data.enrollResponse.overallResult
              .subscriptionResult.invoiceNumber,
        }
        : {};
      /* eslint-enable camelcase */
      const billingOk = await formRef.current.submit(routing);
      if (!billingOk) {
        // Cancel plans because of payment submission failure
        const cancelRequest =
          canadaManageEnrollmentApi.endpoints.canadaCancelPriceCheck.initiate({
            doWrite: true,
          });
        await store.dispatch(cancelRequest).unwrap(); // NOTE: Success is not checked
        return;
      }
    }
    // NOTE: Success is not checked here
    await store
      .dispatch(
        canadaInitialEnrollmentApi.endpoints.canadaPostEnroll.initiate({}),
      )
      .unwrap();
    // Refresh vehicle data after sub change
    await store
      .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
      .unwrap();
    setPage(5);
  };
  const ThankYouPage: React.FC = () => {
    return (
      <CsfView gap={8}>
        <CsfText variant="subheading" testID={id('thanksForYourOrder')}>
          {t('subscriptionUpgrade:thanksForYourOrder')}
        </CsfText>
        <CsfText testID={id('addRequiredDetails')}>
          {t('subscriptionUpgrade:addRequiredDetails')}
        </CsfText>
        <MgaButton
          trackingId="SubscriptionEnrollmentAddEmergencyContacts"
          title={t('subscriptionUpgrade:addEmergencyContacts')}
          onPress={() => navigation.replace('EmergencyContacts')}
        />
        <CsfText testID={id('useManageSubscriptionsPage')}>
          {t('subscriptionUpgrade:useManageSubscriptionsPage')}
        </CsfText>
        <CsfText testID={id('scheduledToActivate')}>
          {t('subscriptionUpgrade:scheduledToActivate')}
        </CsfText>
      </CsfView>
    );
  };
  return (
    <MgaPage showVehicleInfoBar title={t('subscriptionServices:title')}>
      <MgaPageContent title={t('subscriptionServices:title')}>
        {(page == 1 || page == 2 || page == 3 || page == 4) && (
          <MgaProgressIndicator current={page} length={ccRequired ? 4 : 3} />
        )}
        {page == 1 && <PlansPage />}
        {page == 2 && <SubscriberInfoFormPage />}
        {page == 3 && <CheckoutPage />}
        {/* Inlining form to preserve state */}
        {page == 4 && (
          <CsfView gap={8}>
            <MgaBillingInformationViewEmbed ref={formRef} />
            <CsfView flexDirection="row" gap={8}>
              <MgaButton
                trackingId="SubscriptionEnrollmentBack"
                flex={1}
                title={t('common:back')}
                variant="secondary"
                onPress={() => setPage(3)}
              />
              <MgaButton
                trackingId="SubscriptionEnrollmentSubscribeNow"
                isLoading={isEnrolling}
                flex={1}
                title={t('common:subscribeNow')}
                variant="primary"
                onPress={async () => {
                  if (isEnrolling) return;
                  setEnrolling(true);
                  await onEnroll();
                  setEnrolling(false);
                }}
              />
            </CsfView>
          </CsfView>
        )}
        {page == 5 && <ThankYouPage />}
      </MgaPageContent>
    </MgaPage>
  );
};

export default SciSubscriptionEnrollment;