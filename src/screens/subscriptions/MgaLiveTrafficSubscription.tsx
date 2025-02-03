/* eslint-disable eol-last */
// cSpell:ignore Rateschedule
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AriaBillingDetails,
  defaultLiveTrafficMonthlyCost,
  manageEnrollmentApi,
  useGetTrafficConnectAccountTypeTrialStatusMonthlyCostQuery,
  useGetTrafficConnectPricingQuery,
  usePaymentMethodQuery,
} from '../../api/manageEnrollment.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import {
  formatCurrencyForBilling,
  getExpString,
  getRatePriceString,
} from '../../utils/subscriptions';
import { useAppNavigation } from '../../Controller';
import { store } from '../../store';
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView';
import {
  initialEnrollmentApi,
  usePriceCheckMutation,
} from '../../api/initialEnrollment.api';
import { SubscriptionEnrollmentForm } from '../../../@types';
import {
  MgaCart,
  MgaCartItem,
  MgaCartLineItemView,
} from '../../components/MgaCart';
import { MgaPaymentInformationFormRef } from './MgaBillingInformationEdit';
import { MgaSubscriberInfoForm } from './MgaSubscriberInfoForm';
import { has } from '../../features/menu/rules';
import { accountApi } from '../../api/account.api';
import { testID } from '../../components/utils/testID';
import promptAlert from '../../components/CsfAlert';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';
import CsfTile from '../../components/CsfTile';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import CsfBulletedList from '../../components/CsfBulletedList';
import MgaButton from '../../components/MgaButton';
import CsfRule from '../../components/CsfRule';

const MgaLiveTrafficSubscription: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const [page, setPage] = useState(1);
  const formRef = useRef<MgaPaymentInformationFormRef>(null);
  const rateSchedules = useGetTrafficConnectPricingQuery({
    vin: vehicle?.vin ?? '',
  }).data?.data;
  const paymentMethodResponse = usePaymentMethodQuery({
    skipCreditCardValidation: true,
  });
  const [selectedRateScheduleId, setSelectedRateScheduleId] = useState<
    string | undefined
  >(undefined);
  const newTrafficPlan = rateSchedules?.find(
    s => s.rateScheduleId == selectedRateScheduleId,
  );
  const trafficState =
    useGetTrafficConnectAccountTypeTrialStatusMonthlyCostQuery({
      vin: vehicle?.vin ?? '',
    }).data?.data;
  const tcMonthlyFee =
    trafficState?.monthlyCost ?? defaultLiveTrafficMonthlyCost;
  const ccRequired = !paymentMethodResponse?.data?.data?.paymentMethod;
  const [priceCheck, priceCheckResponse] = usePriceCheckMutation();
  const [isEnrolling, setEnrolling] = useState(false);
  const [subscriberInfoForm, setSubscriberInfoForm] = useState<object>({});
  const subscriptionResult =
    priceCheckResponse.data?.data?.enrollResponse.subscriptionResult;
  const modifySubscriptionRequest: SubscriptionEnrollmentForm = {
    promoCode: '', // Per Aaron, promo is disabled until codes exist
    currentSubscriptionCartToken: new Date().getTime(),
    tomtomPlanId: newTrafficPlan?.masterPlanId,
    tomtomRateScheduleId: newTrafficPlan?.rateScheduleId,
  };
  useEffect(() => {
    if (!newTrafficPlan) return;
    priceCheck(modifySubscriptionRequest).then().catch(console.error);
  }, [newTrafficPlan]);
  const eligibleForTrial = rateSchedules?.some(r =>
    r.rateScheduleId.includes('Trial'),
  );
  const cartItems: MgaCartItem[] = [newTrafficPlan]
    .filter(plan => plan)
    .map(plan => {
      const addedPlan =
        priceCheckResponse.data?.data?.enrollResponse.subscriptionResult?.addedPlans.find(
          aPlan => aPlan.planId == plan?.masterPlanId,
        );
      return {
        id: plan?.masterPlanId,
        title:
          (plan == newTrafficPlan &&
            t('subscriptionServices:subaruTrafficConnect')) ||
          'plan',
        subtitle: getExpString('trafficConnectSubscription:through', addedPlan),
        priceString: addedPlan
          ? formatCurrencyForBilling(addedPlan.amount)
          : t('subscriptionEnrollment:calculating'),
        months: plan?.months,
      };
    });
  const cart =
    cartItems.length > 0 && (page == 1 || page == 2)
      ? () => (
        <MgaCart
          items={cartItems}
          title={t('subscriptionServices:trafficPlanSummary')}
          subscriptionResult={subscriptionResult}
        />
      )
      : undefined;
  const onEnroll = async () => {
    if (!newTrafficPlan) return;
    let ariaAccountExists = !ccRequired;
    if (ccRequired) {
      if (!formRef.current) return;
      if (!formRef.current.validate()) return;
      // Check existing ARIA token
      const request =
        initialEnrollmentApi.endpoints.checkForExistingAriaAccount.initiate(
          undefined,
        );
      const response = await store.dispatch(request);
      ariaAccountExists = !!response.data?.data;
      if (ariaAccountExists) {
        const billingOk = await formRef.current.submit();
        if (!billingOk) {
          return;
        }
      }
    }
    // Initial enrollment
    const enrollmentRequest = initialEnrollmentApi.endpoints.enroll.initiate({
      ...subscriberInfoForm,
      promoCode: '', // Per Aaron, promo is disabled until codes exist
      currentSubscriptionCartToken: new Date().getTime(),
      tomtomPlanId: newTrafficPlan?.masterPlanId,
      tomtomRateScheduleId: newTrafficPlan?.rateScheduleId,
    });
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
    // Submit billing
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
    if (ccRequired && !ariaAccountExists) {
      const billingOk = await formRef.current.submit(routing);
      if (!billingOk) {
        // Cancel plans because of payment submission failure
        const cancelRequest =
          manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
            doWrite: true,
            starlinkPackage: 'TOMTOM',
          });
        await store.dispatch(cancelRequest).unwrap(); // NOTE: Success is not checked
        return;
      }
    }
    // NOTE: Success is not checked here
    await store
      .dispatch(initialEnrollmentApi.endpoints.postEnroll.initiate({}))
      .unwrap();
    // Refresh vehicle data after sub change
    await store
      .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
      .unwrap();
    setPage(5);
  };
  const onUpgrade = async () => {
    // Submit billing (if needed)
    if (!formRef.current) return;
    const billingOk = await formRef.current.submit();
    if (!billingOk) return;
    // Upgrade plans
    if (!newTrafficPlan) return;
    const request = manageEnrollmentApi.endpoints.upgradePlans.initiate({
      promoCode: null,
      doWrite: true,
      remoteAdd: false,
      remoteExtend: false,
      remoteTerm: false,
      conciergeAdd: false,
      conciergeTerm: false,
      tomtomRatescheduleId: newTrafficPlan.rateScheduleId,
      tomtomPlanId: newTrafficPlan.masterPlanId,
    });
    const response = await store.dispatch(request).unwrap();
    if (
      !response.success ||
      !response.data?.addPlansResponse.overallResult?.success
    ) {
      const errorCode4027 =
        response.errorCode == 'UNABLE_TO_AUTHORIZE_CREDIT_CARD' ||
        response.data?.addPlansResponse.overallResult?.errorCode == 4027;
      await promptAlert(
        t('common:error'),
        errorCode4027
          ? t('subscriptionEnrollment:4027error')
          : t('subscriptionEnrollment:notAbleToEnroll'),
        [{ title: t('common:continue') }],
      );
    } else {
      // Refresh vehicle data after sub change
      await store
        .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
        .unwrap();
      setPage(5);
    }
  };

  const id = testID('LiveTrafficSubscription');
  return (
    <MgaPage
      showVehicleInfoBar
      stickyFooter={cart}
      title={t('subscriptionServices:trafficConnectSubscribeHeader')}>
      <CsfView edgeInsets standardSpacing>
        <CsfText
          align="center"
          variant="title3"
          testID={id('trafficConnectSubscribeHeader')}>
          {t('subscriptionServices:trafficConnectSubscribeHeader')}
        </CsfText>
        {(page == 1 || page == 2 || page == 3 || page == 4) && (
          <MgaProgressIndicator current={page} length={4} />
        )}
        {page == 1 && (
          <CsfView gap={8}>
            <CsfText
              align="center"
              variant="heading"
              testID={id('trafficHeading')}>
              {t('subscriptionServices:trafficHeading')}
            </CsfText>
            <CsfText align="center" testID={id('trafficHeadingTwo')}>
              {t('subscriptionServices:trafficHeadingTwo')}
            </CsfText>
            <CsfTile gap={4}>
              <CsfText
                variant="subheading"
                testID={id('chooseTheLengthOfYourPlan')}>
                {t('subscriptionModify:chooseTheLengthOfYourPlan')}
              </CsfText>
              <CsfView>
                {rateSchedules?.map((s, i) => {
                  const itemTestId = testID(id(`schedule-${i}`));
                  return (
                    <CsfCheckBox
                      key={s.rateScheduleId}
                      label={getRatePriceString(s)}
                      checked={s.rateScheduleId == selectedRateScheduleId}
                      onChangeValue={value => {
                        setSelectedRateScheduleId(
                          value ? s.rateScheduleId : undefined,
                        );
                      }}
                      testID={itemTestId()}
                    />
                  );
                })}
              </CsfView>
            </CsfTile>
            <CsfText variant="subheading" testID={id('newFeaturesInclude')}>
              {t('subscriptionUpgrade:newFeaturesInclude')}
            </CsfText>
            <CsfBulletedList>
              {t('subscriptionServices:realtimeTraffic')}
              {t('subscriptionServices:travelTime')}
              {t('subscriptionServices:trafficDensity')}
              {t('subscriptionServices:enhanced')}
              {t('subscriptionServices:roadNetworkCoverage')}
              {t('subscriptionServices:safetyWarning')}
            </CsfBulletedList>
            <CsfView flexDirection="row" gap={8}>
              <MgaButton
                trackingId="LiveTrafficSubscriptionCancel"
                flex={1}
                title={t('common:cancel')}
                variant="secondary"
                onPress={() => navigation.pop()}
              />
              {selectedRateScheduleId && (
                <MgaButton
                  trackingId="LiveTrafficSubscriptionContinue"
                  flex={1}
                  title={t('common:continue')}
                  variant="primary"
                  onPress={() => setPage(2)}
                />
              )}
            </CsfView>
          </CsfView>
        )}
        {page == 2 && (
          <MgaSubscriberInfoForm
            onSubmit={data => {
              setSubscriberInfoForm(data);
              setPage(3);
            }}
            onCancel={() => setPage(1)}
          />
        )}
        {page == 3 && (
          <CsfView gap={8}>
            <CsfText variant="title3" testID={id('confirmation')}>
              {t('common:confirmation')}
            </CsfText>
            <CsfText variant="subheading" testID={id('orderDetails')}>
              {t('subscriptionUpgrade:orderDetails')}
            </CsfText>
            {cartItems.map(item => (
              <MgaCartLineItemView key={item.id} item={item} />
            ))}
            <CsfRule />
            <CsfView flexDirection="row" align="center" justify="space-between">
              <CsfText testID={id('yourSubTotal')}>
                {t('subscriptionModify:yourSubTotal')}
              </CsfText>
              <CsfText testID={id('invoiceDetail')}>
                {subscriptionResult
                  ? formatCurrencyForBilling(
                    subscriptionResult.invoicePreTaxTotal -
                    subscriptionResult.invoiceCreditAmount,
                  )
                  : t('subscriptionEnrollment:calculating')}
              </CsfText>
            </CsfView>
            <CsfView flexDirection="row" align="center" justify="space-between">
              <CsfText testID={id('tax')}>
                {t('subscriptionModify:tax')}
              </CsfText>
              <CsfText testID={id('calculating')}>
                {subscriptionResult
                  ? formatCurrencyForBilling(subscriptionResult.invoiceTaxTotal)
                  : t('subscriptionEnrollment:calculating')}
              </CsfText>
            </CsfView>
            <CsfView flexDirection="row" align="center" justify="space-between">
              <CsfText bold testID={id('total')}>
                {t('subscriptionModify:total')}
              </CsfText>
              <CsfText bold testID={id('invoiceTotal')}>
                {subscriptionResult
                  ? formatCurrencyForBilling(subscriptionResult.invoiceTotal)
                  : t('subscriptionEnrollment:calculating')}
              </CsfText>
            </CsfView>
            <CsfView flexDirection="row" gap={8}>
              <MgaButton
                trackingId="LiveTrafficSubscriptionGoBack"
                flex={1}
                title={t('common:back')}
                variant="secondary"
                onPress={() => setPage(2)}
              />
              <MgaButton
                trackingId="LiveTrafficSubscriptionContinue"
                flex={1}
                title={t('common:continue')}
                variant="primary"
                bg={
                  priceCheckResponse.data?.data?.enrollResponse
                    ? 'button'
                    : 'disabled'
                }
                onPress={
                  priceCheckResponse.data?.data?.enrollResponse
                    ? () => setPage(4)
                    : undefined
                }
              />
            </CsfView>
          </CsfView>
        )}
        {page == 4 && (
          <CsfView gap={8} testID={id('FreeTrialSTC')}>
            <CsfText testID={id('FreeTrialSTC')}>
              {t(
                ccRequired
                  ? eligibleForTrial
                    ? 'trafficConnectSubscription:noCCFreeTrialSTC'
                    : 'trafficConnectSubscription:noCCNonFreeTrialSTC'
                  : eligibleForTrial
                    ? 'trafficConnectSubscription:ccExistFreeTrialSTC'
                    : 'trafficConnectSubscription:ccExistNonFreeTrialSTC',
                {
                  tcMonthlyFee: formatCurrencyForBilling(tcMonthlyFee),
                },
              )}
            </CsfText>
            <MgaBillingInformationViewEmbed ref={formRef} />
            <CsfView gap={8}>
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  trackingId="LiveTrafficSubscriptionGoBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(3)}
                />
                <MgaButton
                  trackingId="LiveTrafficSubscriptionSubscribeNow"
                  flex={1}
                  title={t('common:subscribeNow')}
                  variant="primary"
                  isLoading={isEnrolling}
                  onPress={async () => {
                    if (isEnrolling) return;
                    setEnrolling(true);
                    if (has('sub:SAFETY', vehicle)) {
                      await onUpgrade();
                    } else {
                      await onEnroll();
                    }
                    setEnrolling(false);
                  }}
                />
              </CsfView>
              <CsfText testID={id('STCFreeTrial')}>
                {t(
                  eligibleForTrial
                    ? 'subscriptionUpgrade:legalDisclaimerSTCFreeTrial'
                    : 'subscriptionUpgrade:legalDisclaimerSTCNonFreeTrial',
                  {
                    tcMonthlyFee: formatCurrencyForBilling(tcMonthlyFee),
                  },
                )}
              </CsfText>
            </CsfView>
          </CsfView>
        )}
        {page == 5 && (
          <CsfView gap={8}>
            <CsfText variant="subheading" testID={id('thanksForYourOrder')}>
              {t('subscriptionUpgrade:thanksForYourOrder')}
            </CsfText>
            <CsfText testID={id('stcSuccessOne')}>
              {t('subscriptionUpgrade:stcSuccessOne')}
            </CsfText>
            <CsfText testID={id('stcSuccessTwo')}>
              {t('subscriptionUpgrade:stcSuccessTwo')}
            </CsfText>
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  );
};


export default MgaLiveTrafficSubscription;