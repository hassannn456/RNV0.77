/* eslint-disable eol-last */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useModifyEnrollmentMutation,
  usePostEnrollMutation,
  usePriceCheckMutation,
} from '../../api/initialEnrollment.api';
import {
  formatCurrencyForBilling,
  getExpirationStringForPlan,
  getExpString,
  getPlanDurationString,
} from '../../utils/subscriptions';
import { RateSchedule } from '../../../@types';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useAppNavigation } from '../../Controller';
import { ScrollView } from 'react-native';
import {
  manageEnrollmentApi,
  useCurrentEnrollmentQuery,
} from '../../api/manageEnrollment.api';
import { store } from '../../store';
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
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';
import MgaButton from '../../components/MgaButton';
import CsfTile from '../../components/CsfTile';
import { CsfCheckBox } from '../../components/CsfCheckbox';

const MgaSubscriptionModify: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const plans = useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data
    ?.data;
  const oldSafetyPackage = plans?.find(p => p.starlinkPackage == 'SAFETY');
  const oldRemotePackage = plans?.find(p => p.starlinkPackage == 'REMOTE');
  const oldConciergePackage = plans?.find(p => p.starlinkPackage == 'CONCIERGE');
  const [page, setPage] = useState(1);
  const [newSafetyRate, setSafetyRate] = useState<RateSchedule | null>(null);
  const [newRemoteRate, setRemoteRate] = useState<RateSchedule | null>(null);
  const [newConciergeRate, setConciergeRate] = useState<RateSchedule | null>(
    null,
  );
  const [priceCheck, priceCheckResponse] = usePriceCheckMutation();
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [showPage3Errors, setShowPage3Errors] = useState(false);
  const [modifyEnrollment, _modifyEnrollmentResponse] =
    useModifyEnrollmentMutation();
  const [postEnrollment, _postEnrollmentResponse] = usePostEnrollMutation();
  const subscriptionResult =
    priceCheckResponse.data?.data?.enrollResponse.subscriptionResult;
  const modifySubscriptionRequest = {
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
    priceCheck(modifySubscriptionRequest).then().catch(console.error);
  }, [newSafetyRate, newRemoteRate, newConciergeRate]);
  const formRef = useRef<MgaPaymentInformationFormRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [safetyStartPosition, setSafetyStartPosition] = useState(0);
  const [remoteStartPosition, setRemoteStartPosition] = useState(0);
  const [conciergeStartPosition, setConciergeStartPosition] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [isEnrolling, setEnrolling] = useState(false);
  useEffect(() => {
    const getRefundAmount = async () => {
      const response = await store
        .dispatch(
          manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
            doWrite: false,
            starlinkPackage: 'SAFETY',
          }),
        )
        .unwrap();
      if (response.success && response.data) {
        setRefundAmount(response.data.refundAmount);
      }
    };
    getRefundAmount().then().catch(console.error);
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
          ? formatCurrencyForBilling(addedPlan.amount)
          : t('subscriptionEnrollment:calculating'),
        months: rate?.months,
      };
    });
  const onEdit = (plan: MgaCartItem) => {
    if (plan.id == newSafetyRate?.masterPlanId) {
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
  const onSubscribe = async () => {
    // Submit billing (if needed)
    if (!formRef.current) return;
    const billingOk = await formRef.current.submit();
    if (!billingOk) return;
    // Modify subscription
    const modifyEnrollmentResponse = await modifyEnrollment(
      modifySubscriptionRequest,
    ).unwrap();
    if (
      !modifyEnrollmentResponse.success ||
      !modifyEnrollmentResponse.data?.enrollResponse.overallResult.success
    ) {
      const errorCode4027 =
        modifyEnrollmentResponse.errorCode ==
        'UNABLE_TO_AUTHORIZE_CREDIT_CARD' ||
        modifyEnrollmentResponse.data?.enrollResponse.overallResult.errorCode ==
        4027;
      await promptAlert(
        t('common:error'),
        errorCode4027
          ? t('subscriptionEnrollment:4027error')
          : t('subscriptionEnrollment:notAbleToEnroll'),
        [{ title: t('common:continue') }],
      );
      return;
    }
    // MGA-1781: Refresh subscription listing on manage page
    await store
      .dispatch(
        manageEnrollmentApi.endpoints.currentEnrollment.initiate({
          vin: vehicle?.vin ?? '',
        }),
      )
      .unwrap();
    // NOTE: Success is not checked here
    const _postEnrollmentResponse = await postEnrollment({}).unwrap();
    setPage(5);
  };
  const id = testID('SubscriptionModify');
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
            <MgaProgressIndicator current={page} length={4} />
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
              {newSafetyRate && (
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
                      scrollRef.current.scrollTo({ y: conciergeStartPosition });
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
                  trackingId="SubscriptionModifyCancel"
                  flex={1}
                  title={t('common:cancel')}
                  variant="secondary"
                  onPress={() => navigation.pop()}
                />
                {newSafetyRate && (
                  <MgaButton
                    trackingId="SubscriptionModifyContinue"
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
            <CsfView gap={8}>
              <CsfTile>
                <CsfText variant="heading" testID={id('currentPlan')}>
                  {t('subscriptionModify:currentPlan')}
                </CsfText>
                {[oldSafetyPackage, oldRemotePackage, oldConciergePackage].map(
                  plan => {
                    const title: string =
                      (plan == oldSafetyPackage &&
                        t('common:starlinkSafetyPlus')) ||
                      (plan == oldRemotePackage &&
                        t('common:starlinkSecurityPlus')) ||
                      (plan == oldConciergePackage &&
                        t('common:starlinkConcierge')) ||
                      'plan';
                    return (
                      plan && (
                        <CsfView key={title}>
                          <CsfText testID={id('title')}>
                            {title} - {getPlanDurationString(plan)}
                          </CsfText>
                          <CsfText testID={id('planDetails')}>
                            {getExpirationStringForPlan(plan)}
                          </CsfText>
                        </CsfView>
                      )
                    );
                  },
                )}
                <CsfText align="center" testID={id('planWillBeCancelled')}>
                  {t('subscriptionModify:planWillBeCancelled', {
                    count: refundAmount,
                  })}
                </CsfText>
              </CsfTile>
              <CsfTile>
                <CsfText variant="heading" testID={id('newPlan')}>
                  {t('subscriptionModify:newPlan')}
                </CsfText>
                {cartItems.map(item => (
                  <MgaCartLineItemView
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                  />
                ))}
                <CsfText align="center" testID={id('newPlanWillBeginLater')}>
                  {t('subscriptionModify:newPlanWillBeginLater')}
                </CsfText>
              </CsfTile>
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  trackingId="SubscriptionModifyBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(1)}
                />
                <MgaButton
                  trackingId="SubscriptionModifyContinue"
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
                      ? () => setPage(3)
                      : undefined
                  }
                />
              </CsfView>
            </CsfView>
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
              <CsfCheckBox
                testID={id('iAgree')}
                label={t('subscriptionUpgrade:iAgree')}
                checked={termsAndConditions}
                onChangeValue={setTermsAndConditions}
              />
              {showPage3Errors && !termsAndConditions && (
                <CsfText color="error" testID={id('termsAndConditions')}>
                  {t(
                    'subscriptionEnrollment:upgradeConfirmationFormValidateMessages.termsAndConditions.required',
                  )}
                </CsfText>
              )}
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  trackingId="SubscriptionModifyBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(2)}
                />
                <MgaButton
                  trackingId="SubscriptionModifyContinue"
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
                      ? () => {
                        setShowPage3Errors(true);
                        if (!termsAndConditions) return;
                        setPage(4);
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
                  trackingId="SubscriptionModifyBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(3)}
                />
                <MgaButton
                  trackingId="SubscriptionModifySubscribeNow"
                  isLoading={isEnrolling}
                  flex={1}
                  title={t('common:subscribeNow')}
                  variant="primary"
                  onPress={async () => {
                    if (isEnrolling) return;
                    setEnrolling(true);
                    await onSubscribe();
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
                trackingId="SubscriptionModifyAddEmergencyContacts"
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

export default MgaSubscriptionModify;