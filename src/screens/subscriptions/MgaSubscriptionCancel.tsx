/* eslint-disable eol-last */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isLeaseSubscription,
  isPHEVTrial,
  manageEnrollmentApi,
  showCancelAllNotice,
  useCancelPriceCheckQuery,
  useCurrentEnrollmentQuery,
} from '../../api/manageEnrollment.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useAppNavigation } from '../../Controller';
import { StarlinkPackage } from '../../../@types';
import { store } from '../../store';
import {
  formatCurrencyForBilling,
  getPlanDurationString,
  getRefundPlan,
} from '../../utils/subscriptions';
import { accountApi } from '../../api/account.api';
import { featureFlagEnabled } from '../../features/menu/rules';
import { testID } from '../../components/utils/testID';
import {
  CustomerProfileResponse,
  useCustomerProfileQuery,
} from '../../features/profile/contact/contactApi';
import promptAlert from '../../components/CsfAlert';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaProgressIndicator from '../../components/MgaProgressIndicator';
import CsfTile from '../../components/CsfTile';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import MgaButton from '../../components/MgaButton';
import CsfRule from '../../components/CsfRule';

const MgaSubscriptionCancel: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const plans = useCurrentEnrollmentQuery({ vin: vehicle?.vin ?? '' }).data?.data;
  const { data = { success: true }, isLoading: isProfileLoading } =
    useCustomerProfileQuery({
      vin: vehicle?.vin || '',
      oemCustId: vehicle?.oemCustId || '',
    });
  const { data: responseData }: CustomerProfileResponse = data;
  const customerProfile = responseData?.customerProfile;
  const safetyPlan = plans?.find(p => p.starlinkPackage == 'SAFETY');
  const remotePlan = plans?.find(p => p.starlinkPackage == 'REMOTE');
  const conciergePlan = plans?.find(p => p.starlinkPackage == 'CONCIERGE');
  const validPackages = ['SAFETY', 'REMOTE', 'CONCIERGE'];
  const cancelAllOnly = showCancelAllNotice(
    plans?.filter(p => validPackages.includes(p.starlinkPackage)),
  );
  const activePlans = [
    safetyPlan?.starlinkPackage,
    remotePlan?.starlinkPackage,
    conciergePlan?.starlinkPackage,
  ].filter(p => p) as StarlinkPackage[];
  const [cancelPlans, setCancelPlans] = useState<StarlinkPackage[]>(
    cancelAllOnly ? activePlans : [],
  );

  const { data: cancelPlansResponse } = useCancelPriceCheckQuery({
    doWrite: false,
    starlinkPackage: activePlans[0],
  });

  const { safetyRefund, remoteServicesRefund, conciergeRefund, refundAmount } =
    cancelPlansResponse?.data || {};
  const subscriptionTypes = [];
  if (safetyRefund?.refundAmount) subscriptionTypes.push('SAFETY');
  if (remoteServicesRefund?.refundAmount) subscriptionTypes.push('REMOTE');
  if (conciergeRefund?.refundAmount) subscriptionTypes.push('CONCIERGE');

  const [page, setPage] = useState(1);
  const [totalRefund, setTotalRefund] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [badCreditCard, setBadCreditCard] = useState(false);
  const starlinkPackage = cancelPlans[0]; // Highest plan
  const isLeaseFinance = isLeaseSubscription(
    plans?.find(plan => plan.starlinkPackage == starlinkPackage),
  );

  const isFreeTrial = plans?.find(plan => plan.trial == true);
  const isMonthlyPlanOrFreeTrial =
    isFreeTrial ||
    plans?.find(
      plan => validPackages.includes(plan.starlinkPackage) && plan.months == 1,
    );

  const phevCombinedTrial = isPHEVTrial(safetyPlan) && isPHEVTrial(remotePlan);
  const onCheck = (value: StarlinkPackage) => (checked: boolean) => {
    setCancelPlans(
      activePlans.filter(plan => {
        const cmp = activePlans.indexOf(plan) - activePlans.indexOf(value);
        if (cmp > 0) {
          return true;
        } else if (cmp < 0) {
          return false;
        } else {
          return checked;
        }
      }),
    );
  };

  const id = testID('SubscriptionCancel');

  const onCancelSubscription = async () => {
    const confirmAddressCorrect = t('subscriptionCancel:confirmAddressCorrect');
    const confirmAddressIncorrect = t(
      'subscriptionCancel:confirmAddressIncorrect',
    );
    const confirmMailingAddress = t('subscriptionCancel:confirmMailingAddress');
    const confirmMailingAddressForRefund = t(
      'subscriptionCancel:confirmMailingAddressForRefund',
    );
    const refundAddrConfirmation = t(
      'subscriptionCancel:badCreditCardRefundAddressConfirmation',
    );

    const address = {
      address: customerProfile?.address || '',
      address2: customerProfile?.address2 || '',
      city: customerProfile?.city || '',
      state: customerProfile?.state || '',
      zip5Digits: customerProfile?.zip5Digits || '',
      countryCode: customerProfile?.countryCode || 'USA',
    };

    if (
      !featureFlagEnabled('mga.subscriptions.confirmAddressOnCancel') ||
      (isMonthlyPlanOrFreeTrial && !refundAmount)
    ) {
      await cancelSubscription();
      return;
    }
    const selection = await promptAlert(
      confirmMailingAddress,
      `${confirmMailingAddressForRefund}\n\n<b>${address?.address}, </b>\n${address.address2.length ? `<b>${address.address2}</b><br>` : ''
      }<b>${address?.city},</b>\n<b>${address?.state} ${address.zip5Digits
      }</b>\n\n${refundAddrConfirmation}`,
      [
        {
          title: confirmAddressCorrect,
          type: 'primary',
        },
        {
          title: confirmAddressIncorrect,
          type: 'secondary',
        },
      ],
    );

    if (selection === confirmAddressIncorrect) {
      navigation.navigate('EditAddress', { address });
    } else if (selection === confirmAddressCorrect) {
      await cancelSubscription();
    }
  };

  const cancelSubscription = async () => {
    if (isLoading) return;
    const plans = cancelAllOnly ? activePlans : cancelPlans;
    if (plans.length == 0) {
      CsfSimpleAlert(
        t('common:error'),
        t('subscriptionEnrollment:selectAPlanToCancel'),
        { type: 'error' },
      );
      return;
    }
    setLoading(true);
    const response = await store
      .dispatch(
        manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
          doWrite: false,
          starlinkPackage: starlinkPackage,
        }),
      )
      .unwrap();
    if (response.success && response.data) {
      setTotalRefund(response.data.refundAmount);
      setPage(2);
    } else {
      CsfSimpleAlert(
        t('common:error'),
        t('subscriptionEnrollment:errorRetrievingRefundData'),
        { type: 'error' },
      );
    }
    setLoading(false);
  };

  return (
    <MgaPage
      showVehicleInfoBar
      title={t('subscriptionCancel:cancelStarlinkSubscription')}>
      <CsfView edgeInsets standardSpacing>
        <CsfText
          align="center"
          variant="title3"
          testID={id('cancelStarlinkSubscription')}>
          {t('subscriptionCancel:cancelStarlinkSubscription')}
        </CsfText>
        {(page == 1 || page == 2) && (
          <MgaProgressIndicator current={page} length={2} />
        )}
        {page == 1 && (
          <CsfView gap={8}>
            <CsfText variant="heading" testID={id('yourCurrentPlan')}>
              {t('subscriptionCancel:yourCurrentPlan')}
            </CsfText>
            <CsfTile align="flex-start">
              <CsfView gap={12}>
                {phevCombinedTrial && remotePlan && (
                  <CsfCheckBox
                    checked={
                      cancelPlans.includes('SAFETY') &&
                      cancelPlans.includes('REMOTE')
                    }
                    testID={id('cancelPlans')}
                    editable={!cancelAllOnly}
                    onChangeValue={checked => {
                      if (checked) {
                        onCheck('SAFETY')(true);
                      } else {
                        setCancelPlans(
                          cancelPlans.filter(p => p == 'CONCIERGE'),
                        );
                      }
                    }}>
                    <CsfText bold testID={id('starlinkSafetyAndSecurity')}>
                      {t('common:starlinkSafetyAndSecurity')}
                    </CsfText>
                    <CsfText testID={id('remotePlanDuration')}>
                      {getPlanDurationString(remotePlan)}
                    </CsfText>
                  </CsfCheckBox>
                )}
                {!phevCombinedTrial && safetyPlan && (
                  <CsfCheckBox
                    checked={cancelPlans.includes('SAFETY')}
                    editable={!cancelAllOnly}
                    testID={id('checkSafety')}
                    onChangeValue={onCheck('SAFETY')}>
                    <CsfText bold testID={id('starlinkSafetyPlus')}>
                      {t('common:starlinkSafetyPlus')}
                    </CsfText>
                    <CsfText testID={id('safetyPlanDuration')}>
                      {getPlanDurationString(safetyPlan)}
                    </CsfText>
                  </CsfCheckBox>
                )}
                {!phevCombinedTrial && remotePlan && (
                  <CsfCheckBox
                    checked={cancelPlans.includes('REMOTE')}
                    editable={!cancelAllOnly}
                    testID={id('checkRemote')}
                    onChangeValue={onCheck('REMOTE')}>
                    <CsfText bold testID={id('starlinkSecurityPlus')}>
                      {t('common:starlinkSecurityPlus')}
                    </CsfText>
                    <CsfText testID={id('remotePlanDuration')}>
                      {getPlanDurationString(remotePlan)}
                    </CsfText>
                  </CsfCheckBox>
                )}
                {conciergePlan && (
                  <CsfCheckBox
                    checked={cancelPlans.includes('CONCIERGE')}
                    editable={!cancelAllOnly}
                    testID={id('checkConcierge')}
                    onChangeValue={onCheck('CONCIERGE')}>
                    <CsfText bold testID={id('starlinkConcierge')}>
                      {t('common:starlinkConcierge')}
                    </CsfText>
                    <CsfText testID={id('conciergePlanDuration')}>
                      {getPlanDurationString(conciergePlan)}
                    </CsfText>
                  </CsfCheckBox>
                )}
              </CsfView>
            </CsfTile>

            {/* TODO:UA:20240930 Write unit tests for isFreeTrial, isPHEVTrial etc */}
            {isLeaseFinance || (isMonthlyPlanOrFreeTrial && !refundAmount) ? (
              <CsfText testID={id('cancellationNote')}>
                {t('subscriptionManage:MonthlyPlanCancellationNote')}
              </CsfText>
            ) : (
              <CsfText testID={id('cancellationNote')}>
                {t('subscriptionManage:cancellationNote', {
                  which: getRefundPlan(subscriptionTypes),
                })}
              </CsfText>
            )}
            {cancelAllOnly && (
              <CsfText testID={id('subscriptionNote')}>
                {t('subscriptionManage:subscriptionNote')}
              </CsfText>
            )}
            <CsfView flexDirection="row" gap={16}>
              <MgaButton
                flex={1}
                trackingId="SubscriptionCancelBack"
                variant="secondary"
                title={t('common:back')}
                onPress={() => navigation.pop()}
              />
              <MgaButton
                flex={1}
                trackingId="SubscriptionCancelContinue"
                isLoading={isLoading || isProfileLoading}
                title={t('common:continue')}
                onPress={onCancelSubscription}
              />
            </CsfView>
          </CsfView>
        )}
        {page == 2 && (
          <CsfView gap={8}>
            <CsfRule />
            <CsfText variant="heading" testID={id('details')}>
              {t('subscriptionCancel:details')}
            </CsfText>
            {cancelPlans.includes('SAFETY') && (
              <CsfText testID={id('starlinkSafetyPlus')}>
                {t('common:starlinkSafetyPlus')}
              </CsfText>
            )}
            {cancelPlans.includes('REMOTE') && (
              <CsfText testID={id('starlinkSecurityPlus')}>
                {t('common:starlinkSecurityPlus')}
              </CsfText>
            )}
            {cancelPlans.includes('CONCIERGE') && (
              <CsfText testID={id('starlinkConcierge')}>
                {t('common:starlinkConcierge')}
              </CsfText>
            )}
            <CsfRule />
            <CsfView flexDirection="row" justify="space-between">
              <CsfText variant="subheading" testID={id('estimatedRefund')}>
                {t('subscriptionCancel:estimatedRefund')}
              </CsfText>
              <CsfText variant="subheading" testID={id('totalRefund')}>
                {formatCurrencyForBilling(totalRefund)}
              </CsfText>
            </CsfView>
            <CsfView flexDirection="row" gap={16}>
              <MgaButton
                flex={1}
                trackingId="CancelSubscriptionBack"
                variant="secondary"
                title={t('common:back')}
                onPress={() => setPage(1)}
              />
              <MgaButton
                flex={1}
                trackingId="CancelSubscription"
                isLoading={isLoading}
                title={t('subscriptionCancel:cancelSubscription')}
                onPress={async () => {
                  if (isLoading) return;
                  setLoading(true);
                  const response = await store
                    .dispatch(
                      manageEnrollmentApi.endpoints.cancelPriceCheck.initiate({
                        doWrite: true,
                        starlinkPackage: starlinkPackage,
                      }),
                    )
                    .unwrap();
                  if (response.success) {
                    if (
                      !isLeaseFinance &&
                      ((response.data?.safetyRefund &&
                        response.data.safetyRefund.refundDeferred) ||
                        (response.data?.conciergeRefund &&
                          response.data.conciergeRefund.refundDeferred) ||
                        (response.data?.remoteServicesRefund &&
                          response.data.remoteServicesRefund.refundDeferred))
                    ) {
                      setBadCreditCard(true);
                    }
                    // Refresh vehicle data after sub change
                    await store
                      .dispatch(
                        accountApi.endpoints.refreshVehicles.initiate(
                          undefined,
                        ),
                      )
                      .unwrap();
                    setPage(3);
                  }
                  setLoading(false);
                }}
              />
            </CsfView>
          </CsfView>
        )}
        {page == 3 && (
          <CsfView gap={8}>
            {cancelPlans.includes('SAFETY') ? (
              <CsfText testID={id('cancelSafetyMessage')}>
                {t('subscriptionCancel:cancelSafetyMessage')}
              </CsfText>
            ) : cancelPlans.length == 1 && cancelPlans[0] == 'REMOTE' ? (
              <CsfText testID={id('cancelRemoteOnlyMessage')}>
                {t('subscriptionCancel:cancelRemoteOnlyMessage')}
              </CsfText>
            ) : cancelPlans.length == 1 && cancelPlans[0] == 'CONCIERGE' ? (
              <CsfText testID={id('cancelConciergeOnlyMessage')}>
                {t('subscriptionCancel:cancelConciergeOnlyMessage')}
              </CsfText>
            ) : (
              <CsfText testID={id('cancelRemoteConciergeMessage')}>
                {t('subscriptionCancel:cancelRemoteConciergeMessage')}
              </CsfText>
            )}
            {badCreditCard && (
              <CsfText testID={id('badCreditCardMessage')}>
                {t('subscriptionCancel:badCreditCardMessage', {
                  totalRefund: formatCurrencyForBilling(totalRefund),
                })}
              </CsfText>
            )}
            {isLeaseFinance && (
              <CsfText testID={id('leaseFinanceThanks')}>
                {t('subscriptionCancel:leaseFinanceThanks')}
              </CsfText>
            )}
            <MgaButton
              trackingId="ReturnToSubscriptions"
              title={t('subscriptionCancel:returnToSubscriptions')}
              onPress={() => navigation.navigate('SubscriptionServicesLanding')}
            />
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  );
};

export default MgaSubscriptionCancel;
