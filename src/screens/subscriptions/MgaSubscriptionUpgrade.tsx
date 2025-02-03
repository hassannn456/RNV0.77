/* eslint-disable eol-last */
/* eslint-disable react-hooks/exhaustive-deps */
// cspell:ignore autorenew
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  formatCurrencyForBilling,
  getExpString,
  getMonthsFromRateScheduleId,
  getUpgradePriceString,
} from '../../utils/subscriptions';
import { PlanOptions, SubscriptionResult } from '../../../@types';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useAppNavigation } from '../../Controller';
import { ScrollView } from 'react-native';
import {
  manageEnrollmentApi,
  useCurrentEnrollmentQuery,
  useUpgradeOptionsQuery,
} from '../../api/manageEnrollment.api';
import { MgaPlanDetail } from './MgaSubscriptionManage';
import MgaSubscriptionFeatureListRemote from './MgaSubscriptionFeatureListRemote';
import MgaCart, { MgaCartItem, MgaCartLineItemView } from '../../components/MgaCart';
import { store } from '../../store';
import { MgaBillingInformationViewEmbed } from './MgaBillingInformationView';
import { MgaPaymentInformationFormRef } from './MgaBillingInformationEdit';
import { formatFullDate, parseDateObject } from '../../utils/dates';
import { accountApi } from '../../api/account.api';
import { testID } from '../../components/utils/testID';
import promptAlert from '../../components/CsfAlert';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';
import CsfTile from '../../components/CsfTile';
import CsfRule from '../../components/CsfRule';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import MgaButton from '../../components/MgaButton';

const MgaSubscriptionUpgrade: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const plans = useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data
    ?.data;
  const oldSafetyPackage = plans?.find(p => p.starlinkPackage == 'SAFETY');
  const oldRemotePackage = plans?.find(p => p.starlinkPackage == 'REMOTE');
  const oldConciergePackage = plans?.find(p => p.starlinkPackage == 'CONCIERGE');
  const upgradeOptionsResponse = useUpgradeOptionsQuery(undefined);
  const {
    remoteMonthlyRateSchedule,
    conciergeMonthlyRateSchedule,
    upgradeOptions,
  } = upgradeOptionsResponse.data?.data ?? {};
  const {
    remoteServicesAdd,
    remoteServicesExtend,
    remoteServicesTerm,
    conciergeAdd,
    conciergeTerm,
  } = upgradeOptions ?? {};
  const [page, setPage] = useState(1);
  const [newRemotePlan, setRemotePlan] = useState<PlanOptions | null>(null);
  const [newConciergePlan, setConciergePlan] = useState<PlanOptions | null>(
    null,
  );
  const [subscriptionResult, setSubscriptionResult] =
    useState<SubscriptionResult | null>(null);
  const upgradePlans = async (props: { doWrite: boolean }) => {
    const remoteOptions = newRemotePlan
      ? {
        remoteAdd:
          newRemotePlan?.rateScheduleId == remoteServicesAdd?.rateScheduleId,
        remoteExtend:
          newRemotePlan?.rateScheduleId ==
          remoteServicesExtend?.rateScheduleId,
        remoteTerm:
          newRemotePlan?.rateScheduleId == remoteServicesTerm?.rateScheduleId,
      }
      : {};
    const conciergeOptions = newConciergePlan
      ? {
        conciergeAdd:
          newConciergePlan?.rateScheduleId == conciergeAdd?.rateScheduleId,
        conciergeTerm:
          newConciergePlan?.rateScheduleId == conciergeTerm?.rateScheduleId,
      }
      : {};
    const request = manageEnrollmentApi.endpoints.upgradePlans.initiate({
      doWrite: props.doWrite,
      promoCode: '',
      ...remoteOptions,
      ...conciergeOptions,
    });
    return await store.dispatch(request).unwrap();
  };
  useEffect(() => {
    const getPlans: () => Promise<SubscriptionResult | null> = async () => {
      if (!newRemotePlan && !newConciergePlan) return null;
      const response = await upgradePlans({ doWrite: false });
      if (!response.success) return null;
      const subscriptionResult =
        response.data?.addPlansResponse.subscriptionResult;
      if (!subscriptionResult) return null;
      if (!subscriptionResult.addedPlans) return null;
      if (subscriptionResult.addedPlans.length == 0) return null;
      return subscriptionResult;
    };
    getPlans().then(setSubscriptionResult).catch(console.error);
  }, [newRemotePlan, newConciergePlan]);
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [showTCErrors, setShowTCErrors] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [remoteStartPosition, setRemoteStartPosition] = useState(0);
  const [conciergeStartPosition, setConciergeStartPosition] = useState(0);
  const [isEnrolling, setEnrolling] = useState(false);
  const formRef = useRef<MgaPaymentInformationFormRef>(null);
  // If upgrading into REMOTE, show info page to get PIN
  // const [pPick, pInfo, pView, pSub, pages] = oldRemotePackage ? [1, undefined, 2, 3, 3] : [1, 2, 3, 4, 4]
  // Use this version until backend is changed to accommodate, see GIIMA-6852
  const [pPick, pInfo, pView, pSub, pages] = [1, undefined, 2, 3, 3];
  const pThankYou = 999;
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
  const cartItems: MgaCartItem[] = [newRemotePlan, newConciergePlan]
    .filter(plan => plan)
    .map(plan => {
      const addedPlan = subscriptionResult?.addedPlans.find(
        aPlan => aPlan.planId == plan?.planId,
      );
      return {
        id: plan?.planId,
        title:
          (plan == newRemotePlan && t('common:starlinkSecurityPlus')) ||
          (plan == newConciergePlan && t('common:starlinkConcierge')) ||
          'plan',
        subtitle: getExpString('trafficConnectSubscription:through', addedPlan),
        priceString: addedPlan
          ? formatCurrencyForBilling(addedPlan.amount)
          : t('subscriptionEnrollment:calculating'),
        months: getMonthsFromRateScheduleId(plan?.rateScheduleId),
      };
    });
  const onEdit = (plan: MgaCartItem) => {
    if (plan.id == newRemotePlan?.planId) {
      setPage(pPick);
      scrollTo(remoteStartPosition, 250);
      return true;
    }
    if (plan.id == newConciergePlan?.planId) {
      setPage(pPick);
      scrollTo(conciergeStartPosition, 250);
      return true;
    }
    return false;
  };
  const cart =
    cartItems.length > 0 && (page == pPick || page == pInfo || page == pView)
      ? () => (
        <MgaCart
          items={cartItems}
          onEdit={onEdit}
          subscriptionResult={subscriptionResult}
        />
      )
      : undefined;
  const onUpgrade = async () => {
    // Submit billing (if needed)
    if (!formRef.current) return;
    const billingOk = await formRef.current.submit();
    if (!billingOk) return;
    // Upgrade plans
    const response = await upgradePlans({ doWrite: true });
    if (
      response.success &&
      response.data?.addPlansResponse.overallResult?.success
    ) {
      // Refresh vehicle data after sub change
      await store
        .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
        .unwrap();
      // MGA-1781: Refresh subscription listing on manage page
      await store
        .dispatch(
          manageEnrollmentApi.endpoints.currentEnrollment.initiate({
            vin: vehicle?.vin ?? '',
          }),
        )
        .unwrap();
      setPage(pThankYou);
    } else {
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
    }
  };

  const id = testID('SubscriptionUpgrade');
  return (
    <MgaPage
      noScroll
      showVehicleInfoBar
      stickyFooter={cart}
      title={t('subscriptionUpgrade:upgradeSubscription')}>
      <ScrollView ref={scrollRef}>
        <CsfView edgeInsets standardSpacing>
          <CsfText
            align="center"
            variant="title3"
            testID={id('upgradeSubscription')}>
            {t('subscriptionUpgrade:upgradeSubscription')}
          </CsfText>
          {page != pThankYou && (
            <MgaProgressIndicator current={page} length={pages} />
          )}
          {page == pPick && (
            <CsfView gap={8} isLoading={!upgradeOptions}>
              <CsfTile>
                <CsfText
                  variant="heading"
                  testID={id('yourCurrentSubscription')}>
                  {t('subscriptionManage:yourCurrentSubscription')}
                </CsfText>
                {oldSafetyPackage && (
                  <MgaPlanDetail
                    plan={oldSafetyPackage}
                    testID={id('oldSafetyPackage')}
                  />
                )}
                {oldRemotePackage && (
                  <MgaPlanDetail
                    plan={oldRemotePackage}
                    testID={id('oldRemotePackage')}
                  />
                )}
                {oldConciergePackage && (
                  <MgaPlanDetail
                    plan={oldConciergePackage}
                    testID={id('oldConciergePackage')}
                  />
                )}
              </CsfTile>
              {/* Remote */}
              {(!oldRemotePackage || remoteServicesExtend) && (
                <CsfView
                  gap={8}
                  onLayout={event => {
                    setRemoteStartPosition(event.nativeEvent.layout.y);
                  }}>
                  <CsfText
                    align="center"
                    variant="heading"
                    testID={id('giveABoost')}>
                    {t('subscriptionUpgrade:giveABoost')}
                  </CsfText>
                  <CsfRule />
                  <CsfText
                    variant="subheading"
                    testID={id('starlinkSecurityPlusServices')}>
                    {t('subscriptionUpgrade:starlinkSecurityPlusServices')}
                  </CsfText>
                  <CsfText
                    variant="body2"
                    testID={id('accessYourVehicleFeatures')}>
                    {t('subscriptionUpgrade:accessYourVehicleFeatures')}
                  </CsfText>
                  <CsfTile gap={20}>
                    <CsfText
                      variant="subheading"
                      testID={id('addYourOptionalUpgrade')}>
                      {t('subscriptionUpgrade:addYourOptionalUpgrade')}
                    </CsfText>
                    <CsfView gap={20} maxWidth={'90%'}>
                      {remoteServicesAdd && (
                        <CsfCheckBox
                          key={remoteServicesAdd.rateScheduleId}
                          checked={
                            remoteServicesAdd.rateScheduleId ==
                            newRemotePlan?.rateScheduleId
                          }
                          testID={id('remoteServicesAdd')}
                          align="flex-start"
                          onChangeValue={_value => {
                            if (newConciergePlan != null) {
                              setConciergePlan(null);
                            }
                            if (
                              remoteServicesAdd.rateScheduleId !=
                              newRemotePlan?.rateScheduleId
                            ) {
                              setRemotePlan(remoteServicesAdd);
                              scrollTo(conciergeStartPosition, 250);
                            } else {
                              setRemotePlan(null);
                            }
                          }}>
                          <CsfText testID={id('startAFreeSecurityPlusTrial')}>
                            {t(
                              remoteServicesAdd.isTrial
                                ? 'subscriptionUpgrade:startAFreeSecurityPlusTrial'
                                : 'subscriptionUpgrade:monthlySecurityPlusSubscription',
                            )}
                          </CsfText>
                          <CsfText
                            testID={id('autorenewAsMonthlySubscription')}>
                            {t(
                              'subscriptionUpgrade:autorenewAsMonthlySubscription',
                            )}
                          </CsfText>
                          <CsfText testID={id('perMonth')}>
                            {t('subscriptionUpgrade:perMonth', {
                              rate: formatCurrencyForBilling(
                                remoteMonthlyRateSchedule?.price,
                              ),
                            })}
                          </CsfText>
                        </CsfCheckBox>
                      )}
                      {remoteServicesExtend && (
                        <CsfCheckBox
                          align="flex-start"
                          testID={id('remoteServicesExtend')}
                          key={remoteServicesExtend.rateScheduleId}
                          checked={
                            remoteServicesExtend.rateScheduleId ==
                            newRemotePlan?.rateScheduleId
                          }
                          onChangeValue={_value => {
                            if (
                              remoteServicesExtend.rateScheduleId !=
                              newRemotePlan?.rateScheduleId
                            ) {
                              setRemotePlan(remoteServicesExtend);
                              scrollTo(conciergeStartPosition, 250);
                            } else {
                              setRemotePlan(null);
                            }
                          }}>
                          <CsfText testID={id('renewalDateExtended')}>
                            {t('subscriptionUpgrade:renewalDateExtended', {
                              when: formatFullDate(
                                parseDateObject(
                                  oldSafetyPackage?.nextBillingDate,
                                ),
                              ),
                            })}
                          </CsfText>
                          <CsfText testID={id('upgradePrice')}>
                            {getUpgradePriceString(remoteServicesExtend)}
                          </CsfText>
                          {remoteServicesExtend.isTrial && (
                            <CsfText testID={id('includesFreeTrial')}>
                              {t('subscriptionUpgrade:includesFreeTrial')}
                            </CsfText>
                          )}
                        </CsfCheckBox>
                      )}
                      {remoteServicesTerm && (
                        <CsfCheckBox
                          align="flex-start"
                          testID={id('remoteServicesTerm')}
                          key={remoteServicesTerm.rateScheduleId}
                          checked={
                            remoteServicesTerm.rateScheduleId ==
                            newRemotePlan?.rateScheduleId
                          }
                          onChangeValue={_value => {
                            if (
                              remoteServicesTerm.rateScheduleId !=
                              newRemotePlan?.rateScheduleId
                            ) {
                              setRemotePlan(remoteServicesTerm);
                              scrollTo(conciergeStartPosition, 250);
                            } else {
                              setRemotePlan(null);
                            }
                          }}>
                          <CsfText testID={id('renewalDateExtended')}>
                            {t('subscriptionUpgrade:renewalDateExtended', {
                              when: formatFullDate(
                                parseDateObject(
                                  oldSafetyPackage?.expirationDate,
                                ),
                              ),
                            })}
                          </CsfText>
                          <CsfText testID={id('remoteServicesTerm')}>
                            {getUpgradePriceString(remoteServicesTerm)}
                          </CsfText>
                          {remoteServicesTerm.isTrial && (
                            <CsfText testID={id('includesFreeTrial')}>
                              {t('subscriptionUpgrade:includesFreeTrial')}
                            </CsfText>
                          )}
                        </CsfCheckBox>
                      )}
                    </CsfView>
                  </CsfTile>
                  <CsfText
                    variant="subheading"
                    testID={id('newFeaturesInclude')}>
                    {t('subscriptionUpgrade:newFeaturesInclude')}
                  </CsfText>
                  <MgaSubscriptionFeatureListRemote />
                </CsfView>
              )}
              {/* Concierge */}
              {(newRemotePlan || oldRemotePackage) &&
                (conciergeAdd || conciergeTerm) && (
                  <CsfView
                    gap={8}
                    onLayout={event => {
                      setConciergeStartPosition(event.nativeEvent.layout.y);
                    }}>
                    <CsfRule />
                    <CsfText
                      variant="subheading"
                      testID={id('starlinkConcierge')}>
                      {t('subscriptionUpgrade:starlinkConcierge')}
                    </CsfText>
                    <CsfText
                      variant="body2"
                      testID={id('starlinkConciergeDescription1')}>
                      {t('subscriptionUpgrade:starlinkConciergeDescription1')}
                    </CsfText>
                    <CsfTile gap={20}>
                      <CsfText
                        variant="subheading"
                        testID={id('addYourOptionalUpgrade')}>
                        {t('subscriptionUpgrade:addYourOptionalUpgrade')}
                      </CsfText>
                      <CsfView gap={20}>
                        {conciergeAdd && (
                          <CsfCheckBox
                            testID={id('conciergeAdd')}
                            key={conciergeAdd.rateScheduleId}
                            align="flex-start"
                            checked={
                              conciergeAdd.rateScheduleId ==
                              newConciergePlan?.rateScheduleId
                            }
                            onChangeValue={checked => {
                              setConciergePlan(checked ? conciergeAdd : null);
                            }}>
                            <CsfText
                              testID={id('monthlyConciergeSubscription')}>
                              {t(
                                'subscriptionUpgrade:monthlyConciergeSubscription',
                              )}
                            </CsfText>
                            <CsfText
                              testID={id('autorenewAsMonthlySubscription')}>
                              {t(
                                'subscriptionUpgrade:autorenewAsMonthlySubscription',
                              )}
                            </CsfText>
                            <CsfText
                              testID={id('conciergeMonthlyRateSchedule')}>
                              {t('subscriptionUpgrade:perMonth', {
                                rate: formatCurrencyForBilling(
                                  conciergeMonthlyRateSchedule?.price,
                                ),
                              })}
                            </CsfText>
                          </CsfCheckBox>
                        )}
                        {conciergeTerm &&
                          (newRemotePlan != remoteServicesAdd ||
                            newRemotePlan == null) && (
                            <CsfCheckBox
                              testID={id('conciergeTerm')}
                              key={conciergeTerm.rateScheduleId}
                              align="flex-start"
                              checked={
                                conciergeTerm.rateScheduleId ==
                                newConciergePlan?.rateScheduleId
                              }
                              onChangeValue={checked => {
                                setConciergePlan(checked ? conciergeTerm : null);
                              }}>
                              <CsfText testID={id('conciergeServiceExtended')}>
                                {t(
                                  'subscriptionUpgrade:conciergeServiceExtended',
                                )}
                              </CsfText>
                              <CsfText testID={id('conciergeTermPrice')}>
                                {getUpgradePriceString(conciergeTerm)}
                              </CsfText>
                            </CsfCheckBox>
                          )}
                      </CsfView>
                    </CsfTile>
                  </CsfView>
                )}
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  testID="SubscriptionUpgradeCancel"
                  flex={1}
                  title={t('common:cancel')}
                  variant="secondary"
                  onPress={() => navigation.pop()}
                />
                {(newRemotePlan || newConciergePlan) && (
                  <MgaButton
                    testID="SubscriptionUpgradeContinue"
                    flex={1}
                    title={t('common:continue')}
                    variant="primary"
                    onPress={() => setPage(page + 1)}
                  />
                )}
              </CsfView>
            </CsfView>
          )}
          {page == pView && (
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
                <CsfText testID={id('subscriptionResult')}>
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
                <CsfText testID={id('invoiceTaxTotal')}>
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
                <CsfText bold testID={id('invoiceTotal')}>
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
              {showTCErrors && !termsAndConditions && (
                <CsfText color="error" testID={id('termsAndConditions')}>
                  {t(
                    'subscriptionEnrollment:upgradeConfirmationFormValidateMessages.termsAndConditions.required',
                  )}
                </CsfText>
              )}
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  testID="SubscriptionUpgradeBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(page - 1)}
                />
                <MgaButton
                  testID="SubscriptionUpgradeContinue"
                  flex={1}
                  title={t('common:continue')}
                  variant="primary"
                  bg={subscriptionResult ? 'button' : 'disabled'}
                  onPress={
                    subscriptionResult
                      ? () => {
                        setShowTCErrors(true);
                        if (!termsAndConditions) return;
                        setPage(page + 1);
                      }
                      : undefined
                  }
                />
              </CsfView>
            </CsfView>
          )}
          {page == pSub && (
            <CsfView gap={8}>
              <MgaBillingInformationViewEmbed ref={formRef} />
              <CsfView flexDirection="row" gap={8}>
                <MgaButton
                  testID="SubscriptionUpgradeBack"
                  flex={1}
                  title={t('common:back')}
                  variant="secondary"
                  onPress={() => setPage(page - 1)}
                />
                <MgaButton
                  testID="SubscriptionUpgradeSubscribeNow"
                  isLoading={isEnrolling}
                  flex={1}
                  title={t('common:subscribeNow')}
                  variant="primary"
                  onPress={async () => {
                    if (isEnrolling) return;
                    setEnrolling(true);
                    await onUpgrade();
                    setEnrolling(false);
                  }}
                />
              </CsfView>
            </CsfView>
          )}
          {page == pThankYou && (
            <CsfView gap={8}>
              <CsfText variant="subheading" testID={id('thanksForYourOrder')}>
                {t('subscriptionUpgrade:thanksForYourOrder')}
              </CsfText>
              <CsfText testID={id('addRequiredDetails')}>
                {t('subscriptionUpgrade:addRequiredDetails')}
              </CsfText>
              <MgaButton
                testID="SubscriptionUpgradeAddEmergencyContacts"
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

export default MgaSubscriptionUpgrade;