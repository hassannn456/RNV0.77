/* eslint-disable eol-last */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';
import CsfTile from '../../components/CsfTile';
import MgaButton from '../../components/MgaButton';

import {
  initialEnrollmentApi,
  usePriceCheckMutation,
} from '../../api/initialEnrollment.api';
import {
  formatCurrencyForBilling,
  getExpString,
  isCombinedSafetyAndRemoteTrial,
} from '../../utils/subscriptions';
import { RateSchedule } from '../../../@types';
import { useAppNavigation } from '../../Controller';
import { ScrollView } from 'react-native';
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView';
import {
  MgaCart,
  MgaCartItem,
  MgaCartLineItemView,
} from '../../components/MgaCart';
import {
  MgaSubscriptionStarlinkConciergePlans,
  MgaSubscriptionStarlinkRemotePlans,
  MgaSubscriptionStarlinkSafetyPlans,
} from './MgaSubscriptionStarlinkPlans';
import { MgaPaymentInformationFormRef } from './MgaBillingInformationEdit';
import { store } from '../../store';
import {
  AriaBillingDetails,
  manageEnrollmentApi,
} from '../../api/manageEnrollment.api';
import { accountApi } from '../../api/account.api';
import { testID } from '../../components/utils/testID';
import promptAlert from '../../components/CsfAlert';
import { MgaSubscriberInfoForm } from '.';

const MgaSubscriptionEnrollment: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [page, setPage] = useState(1);
  const formRef = useRef<MgaPaymentInformationFormRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [safetyStartPosition, setSafetyStartPosition] = useState(0);
  const [remoteStartPosition, setRemoteStartPosition] = useState(0);
  const [conciergeStartPosition, setConciergeStartPosition] = useState(0);
  const [newSafetyRate, setSafetyRate] = useState<RateSchedule | null>(null);
  const [newRemoteRate, setRemoteRate] = useState<RateSchedule | null>(null);
  const [newConciergeRate, setConciergeRate] = useState<RateSchedule | null>(
    null,
  );
  const [priceCheck, priceCheckResponse] = usePriceCheckMutation();
  const [isEnrolling, setEnrolling] = useState(false);
  const [subscriberInfoForm, setSubscriberInfoForm] = useState<object>({});
  const subscriptionEnrollmentForm = {
    promoCode: '', // Per Aaron, promo is disabled until codes exist
    currentSubscriptionCartToken: new Date().getTime(),
    safetyMasterPlanId: newSafetyRate?.masterPlanId,
    safetyRateScheduleId: newSafetyRate?.rateScheduleId,
    remoteMasterPlanId: newRemoteRate?.masterPlanId,
    remoteRateScheduleId: newRemoteRate?.rateScheduleId,
    conciergeMasterPlanId: newConciergeRate?.masterPlanId,
    conciergeRateScheduleId: newConciergeRate?.rateScheduleId,
  };
  useEffect(() => {
    if (!newSafetyRate && !newRemoteRate && !newConciergeRate) return;
    priceCheck(subscriptionEnrollmentForm).then().catch(console.error);
  }, [newSafetyRate, newRemoteRate, newConciergeRate]);
  const subscriptionResult =
    priceCheckResponse.data?.data?.enrollResponse.subscriptionResult;
  const ccRequired = newRemoteRate != null || newSafetyRate?.price != 0;
  const cartItems: MgaCartItem[] = [
    newSafetyRate,
    newRemoteRate,
    newConciergeRate,
  ]
    .filter(rate => rate)
    .map(rate => {
      const addedPlan = subscriptionResult?.addedPlans.find(
        aPlan => aPlan.planId == rate?.masterPlanId,
      );
      return {
        id: rate?.masterPlanId,
        title:
          (rate == newSafetyRate && t('common:starlinkSafetyPlus')) ||
          (rate == newRemoteRate && t('common:starlinkSecurityPlus')) ||
          (rate == newConciergeRate && t('common:starlinkConcierge')) ||
          'plan',
        subtitle: getExpString('trafficConnectSubscription:through', addedPlan),
        priceString: addedPlan
          ? formatCurrencyForBilling(
            addedPlan.amount ? addedPlan.amount : rate?.price,
          )
          : t('subscriptionEnrollment:calculating'),
        months: rate?.months,
      };
    });
  const scrollTo = (y: number, ms?: number) => {
    if (ms) {
      setTimeout(() => scrollTo(y, 0), ms);
    } else {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          y: y,
        });
      }
    }
  };
  const onEdit = (plan: MgaCartItem) => {
    if (
      plan.id == newSafetyRate?.masterPlanId ||
      (plan.id == newRemoteRate?.masterPlanId &&
        isCombinedSafetyAndRemoteTrial(newSafetyRate, newRemoteRate))
    ) {
      setPage(1);
      scrollTo(safetyStartPosition, 250);
      return true;
    }
    if (plan.id == newRemoteRate?.masterPlanId) {
      setPage(1);
      scrollTo(remoteStartPosition, 250);
      return true;
    }
    if (plan.id == newConciergeRate?.masterPlanId) {
      setPage(1);
      scrollTo(conciergeStartPosition, 250);
      return true;
    }
    return false;
  };
  const onEnroll = async () => {
    let ariaAccountExists = !ccRequired;
    if (ccRequired) {
      if (!formRef.current) return;
      if (!formRef.current.validate()) return;
      // Check existing ARIA token
      const request =
        initialEnrollmentApi.endpoints.checkForExistingAriaAccount.initiate(
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
    // Initial enrollment
    const enrollmentRequest = initialEnrollmentApi.endpoints.enroll.initiate({
      ...subscriptionEnrollmentForm,
      ...subscriberInfoForm,
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
          manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
            doWrite: true,
            starlinkPackage: 'SAFETY',
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
  const cart =
    cartItems.length > 0 && (page == 1 || page == 2)
      ? () => (
        <MgaCart
          items={cartItems}
          onEdit={onEdit}
          subscriptionResult={subscriptionResult}
        />
      )
      : undefined;

  const id = testID('SubscriptionEnrollment');
  return (
    <MgaPage
      noScroll
      showVehicleInfoBar
      stickyFooter={cart}
      title={t('subscriptionModify:starlinkSubscription')}>
      <ScrollView ref={scrollRef}>
        <CsfView edgeInsets standardSpacing>
          <CsfText
            align="center"
            variant="title3"
            testID={id('starlinkSubscription')}>
            {t('subscriptionModify:starlinkSubscription')}
          </CsfText>
          {(page == 1 || page == 2 || page == 3 || page == 4) && (
            <MgaProgressIndicator current={page} length={ccRequired ? 4 : 3} />
          )}
          {page == 1 && (
            <CsfView gap={8}>
              <MgaSubscriptionStarlinkSafetyPlans
                selected={newSafetyRate?.rateScheduleId}
                onLayout={event =>
                  setSafetyStartPosition(event.nativeEvent.layout.y)
                }
                onSelect={(safety, remote, concierge) => {
                  setSafetyRate(safety);
                  setRemoteRate(remote);
                  setConciergeRate(concierge);
                  if (remote) {
                    if (conciergeStartPosition && scrollRef.current) {
                      scrollRef.current.scrollTo({
                        y: conciergeStartPosition,
                      });
                    }
                  } else {
                    if (remoteStartPosition && scrollRef.current) {
                      scrollRef.current.scrollTo({ y: remoteStartPosition });
                    }
                  }
                }}
              />
              {newSafetyRate &&
                !isCombinedSafetyAndRemoteTrial(
                  newSafetyRate,
                  newRemoteRate,
                ) && (
                  <MgaSubscriptionStarlinkRemotePlans
                    selected={newRemoteRate?.rateScheduleId}
                    onLayout={event => {
                      setRemoteStartPosition(event.nativeEvent.layout.y);
                      if (!remoteStartPosition && scrollRef.current) {
                        scrollRef.current.scrollTo({
                          y: event.nativeEvent.layout.y,
                        });
                      }
                    }}
                    onSelect={s => {
                      setRemoteRate(s);
                      setConciergeRate(null);
                      if (s && conciergeStartPosition && scrollRef.current) {
                        scrollRef.current.scrollTo({
                          y: conciergeStartPosition,
                        });
                      }
                    }}
                    safetyPlan={newSafetyRate}
                  />
                )}
              {newRemoteRate && (
                <MgaSubscriptionStarlinkConciergePlans
                  selected={newConciergeRate?.rateScheduleId}
                  onLayout={event => {
                    setConciergeStartPosition(event.nativeEvent.layout.y);
                    if (!conciergeStartPosition && scrollRef.current) {
                      scrollRef.current.scrollTo({
                        y: event.nativeEvent.layout.y,
                      });
                    }
                  }}
                  onSelect={s => {
                    setConciergeRate(s);
                  }}
                  remotePlan={newRemoteRate}
                />
              )}
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  trackingId="SubscriptionEnrollmentCancel"
                  flex={1}
                  title={t('common:cancel')}
                  variant="secondary"
                  onPress={() => navigation.pop()}
                />
                {newSafetyRate && (
                  <MgaButton
                    trackingId="SubscriptionEnrollmentContinue"
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
              // See MGA-899
              // pinRequired={newRemoteRate != null}
              pinRequired={true}
              onCancel={() => setPage(1)}
              onSubmit={data => {
                setSubscriberInfoForm(data);
                setPage(3);
              }}
            />
          )}
          {page == 3 && (
            <CsfView gap={8}>
              <CsfTile>
                <CsfText variant="heading" testID={id('confirmation')}>
                  {t('common:confirmation')}
                </CsfText>
                <CsfText variant="subheading" testID={id('orderDetails')}>
                  {t('subscriptionUpgrade:orderDetails')}
                </CsfText>
                {cartItems.map(item => (
                  <MgaCartLineItemView
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                  />
                ))}
              </CsfTile>
              <CsfView
                flexDirection="row"
                align="center"
                justify="space-between">
                <CsfText testID={id('yourSubTotal')}>
                  {t('subscriptionModify:yourSubTotal')}
                </CsfText>
                <CsfText testID={id('calculating')}>
                  {subscriptionResult
                    ? formatCurrencyForBilling(
                      subscriptionResult.invoicePreTaxTotal -
                      subscriptionResult.invoiceCreditAmount,
                    )
                    : t('subscriptionEnrollment:calculating')}
                </CsfText>
              </CsfView>
              <CsfView
                flexDirection="row"
                align="center"
                justify="space-between">
                <CsfText testID={id('tax')}>
                  {t('subscriptionModify:tax')}
                </CsfText>
                <CsfText testID={id('calculating')}>
                  {subscriptionResult
                    ? formatCurrencyForBilling(
                      subscriptionResult.invoiceTaxTotal,
                    )
                    : t('subscriptionEnrollment:calculating')}
                </CsfText>
              </CsfView>
              <CsfView
                flexDirection="row"
                align="center"
                justify="space-between">
                <CsfText bold testID={id('total')}>
                  {t('subscriptionModify:total')}
                </CsfText>
                <CsfText bold testID={id('calculating')}>
                  {subscriptionResult
                    ? formatCurrencyForBilling(subscriptionResult.invoiceTotal)
                    : t('subscriptionEnrollment:calculating')}
                </CsfText>
              </CsfView>
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
                  title={t(
                    ccRequired ? 'common:continue' : 'common:subscribeNow',
                  )}
                  variant="primary"
                  bg={
                    priceCheckResponse.data?.data?.enrollResponse
                      ? 'button'
                      : 'disabled'
                  }
                  onPress={
                    priceCheckResponse.data?.data?.enrollResponse
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
          )}
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
          {page == 5 && (
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
          )}
        </CsfView>
      </ScrollView>
    </MgaPage>
  );
};

export default MgaSubscriptionEnrollment;