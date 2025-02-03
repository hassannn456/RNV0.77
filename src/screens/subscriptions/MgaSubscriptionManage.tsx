/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import {
  isLiveTrafficSubscription,
  isWritableSubscription,
  manageEnrollmentApi,
  showCancelAllNotice,
  useCurrentEnrollmentQuery,
  usePaymentMethodQuery,
} from '../../api/manageEnrollment.api';
import { SubscriptionDetail } from '../../../@types';
import { formatFullDate, parseDateObject } from '../../utils/dates';
import { useAppNavigation } from '../../Controller';
import {
  formatCurrencyForBilling,
  getExpirationStringForPlan,
  getPlanDurationString,
} from '../../utils/subscriptions';
import { store } from '../../store';
import { testID } from '../../components/utils/testID';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import promptAlert from '../../components/CsfAlert';
import { successNotice } from '../../components/notice';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import MgaPage from '../../components/MgaPage';
import CsfTile from '../../components/CsfTile';
import MgaButton from '../../components/MgaButton';

/** Using instead of MgaStarlinkPlans because of extra info around expiration / renewals */
export const MgaPlanDetail: React.FC<{
  plan: SubscriptionDetail
  testID?: string
}> = ({ plan, ...props }) => {
  const { t } = useTranslation();
  const id = testID(props.testID);
  return (
    <CsfView>
      {plan.starlinkPackage == 'SAFETY' && (
        <CsfText variant="heading2" testID={id('starlinkSafetyPlus')}>
          {t('common:starlinkSafetyPlus')}
        </CsfText>
      )}
      {plan.starlinkPackage == 'REMOTE' && (
        <CsfText variant="heading2" testID={id('starlinkSecurityPlus')}>
          {t('common:starlinkSecurityPlus')}
        </CsfText>
      )}
      {plan.starlinkPackage == 'CONCIERGE' && (
        <CsfText variant="heading2" testID={id('starlinkConcierge')}>
          {t('common:starlinkConcierge')}
        </CsfText>
      )}
      {isLiveTrafficSubscription(plan) && (
        <CsfText variant="heading2" testID={id('trafficConnectTitle')}>
          {t('trafficConnectManage:trafficConnectTitle')}
        </CsfText>
      )}
      <CsfText testID={id('planDuration')}>
        {getPlanDurationString(plan)}
      </CsfText>
      <CsfText testID={id('planDate')}>
        {t('subscriptionEnrollment:startDate', {
          when: formatFullDate(parseDateObject(plan.planDate)),
        })}
      </CsfText>
      <CsfText testID={id('autoRenews')}>
        {getExpirationStringForPlan(plan)}
      </CsfText>
    </CsfView>
  );
};

/** Using instead of MgaStarlinkPlans because of extra info around expiration / renewals */
export const MgaPlanDetailC25: React.FC<{
  plan: SubscriptionDetail
  autoRenewEnabled?: boolean
}> = ({ plan, autoRenewEnabled }) => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const [isLoading, setLoading] = useState(false);
  const isAutoRenew = plan?.automaticRenewal;

  /** Endpoint can return null for cost, use as fallback */
  const defaultSafetySubscriptionMonthlyCost = 9.95;
  const defaultRemoteSubscriptionMonthlyCost = 4.95;

  const when = formatFullDate(parseDateObject(plan?.expirationDate));
  const which = plan.starlinkPackage;
  const tcMonthlyFee = formatCurrencyForBilling(
    plan?.rolloverPlanRateSchedule?.price ??
    (plan?.starlinkPackage == 'SAFETY'
      ? defaultSafetySubscriptionMonthlyCost
      : defaultRemoteSubscriptionMonthlyCost),
  );

  const toggleAutoRenew = async () => {
    // Confirmation prompt if stopping auto-renew
    if (isAutoRenew) {
      const disable = t('trafficConnectManage:disableAutoRenew');
      const cancel: string = t('common:back');
      const selection = await promptAlert(
        t('subscriptionManage:cancelAutoRenewal'),
        t('subscriptionManage:cancelMessage', { which, when, tcMonthlyFee }),
        [
          { title: disable, type: 'primary' },
          { title: cancel, type: 'secondary' },
        ],
      );
      if (selection != disable) return;
    }
    let response;
    const payload = { starlinkPackage: plan.starlinkPackage };

    if (isAutoRenew) {
      response = await store
        .dispatch(
          manageEnrollmentApi.endpoints.disableAutoRenewSubscription.initiate(
            payload,
          ),
        )
        .unwrap();
    } else {
      response = await store
        .dispatch(
          manageEnrollmentApi.endpoints.enableAutoRenewSubscription.initiate(
            payload,
          ),
        )
        .unwrap();
    }
    if (response.success) {
      const refresh = await store
        .dispatch(
          manageEnrollmentApi.endpoints.currentEnrollment.initiate({
            vin: vehicle?.vin ?? '',
          }),
        )
        .unwrap();
      if (refresh.success) {
        successNotice({
          noticeKey: 'IDSuccess',
          subtitle: t(
            isAutoRenew
              ? 'subscriptionManage:autoRenewOff'
              : 'subscriptionManage:autoRenewOn',
            { which, when, tcMonthlyFee },
          ),
          dismissable: true,
        });
      }
    } else {
      // TODO: Need to map correct error messages for all responses
      CsfSimpleAlert(
        t('common:error'),
        t('subscriptionManage:autoRenewChangeFailed', { which }),
        { type: 'error' },
      );
    }
  };
  const id = testID('PlanDetailsC25');
  return (
    <CsfView flexDirection="row" align="center" justify="space-between">
      <CsfView>
        {plan.starlinkPackage == 'SAFETY' && (
          <CsfText variant="heading2" testID={id('starlinkSafetyPlus')}>
            {t('common:starlinkSafetyPlus')}
          </CsfText>
        )}
        {plan.starlinkPackage == 'REMOTE' && (
          <CsfText variant="heading2" testID={id('starlinkSecurityPlus')}>
            {t('common:starlinkSecurityPlus')}
          </CsfText>
        )}
        {plan.starlinkPackage == 'CONCIERGE' && (
          <CsfText variant="heading2" testID={id('starlinkConcierge')}>
            {t('common:starlinkConcierge')}
          </CsfText>
        )}
        {isLiveTrafficSubscription(plan) && (
          <CsfText variant="heading2" testID={id('trafficConnectTitle')}>
            {t('trafficConnectManage:trafficConnectTitle')}
          </CsfText>
        )}
        <CsfText testID={id('planDuration')}>
          {getPlanDurationString(plan)}
        </CsfText>
        <CsfText testID={id('startDate')}>
          {t('subscriptionEnrollment:startDate', {
            when: formatFullDate(parseDateObject(plan.planDate)),
          })}
        </CsfText>
        <CsfText testID={id('autoRenews')}>
          {getExpirationStringForPlan(plan)}
        </CsfText>
      </CsfView>
      {autoRenewEnabled && (
        <CsfToggle
          inline
          maxWidth={50}
          isLoading={isLoading}
          checked={plan.automaticRenewal}
          onChangeValue={async () => {
            setLoading(true);
            await toggleAutoRenew();
            setLoading(false);
          }}
        />
      )}
    </CsfView>
  );
};

export const MgaSubscriptionManage: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { data, isLoading } = useCurrentEnrollmentQuery({
    vin: vehicle?.vin ?? '',
  });
  const plans = data?.data;
  const safetyPlan = plans?.find(p => p.starlinkPackage == 'SAFETY');
  const remotePlan = plans?.find(p => p.starlinkPackage == 'REMOTE');
  const conciergePlan = plans?.find(p => p.starlinkPackage == 'CONCIERGE');
  const writeableSubscription = isWritableSubscription(safetyPlan);
  const showModifySubscription =
    writeableSubscription && safetyPlan && !safetyPlan.trial;
  // MGA-1976: Show extend subscription to 6 month REMOTE trial sub with 3, 4, 5 year SAFETY trial subs
  // Reference: GIIMA-5566, https://github.com/SubaruOfAmerica/tb2c-mysubaru-commit/d6d85ba67b25272f5c2d9b88209c9d7ce041d093
  const showExtendSubscription =
    remotePlan?.months == 6 && [36, 48, 60].includes(safetyPlan?.months ?? 0);
  const showUpgradeSubscription =
    writeableSubscription &&
    !showModifySubscription &&
    (!remotePlan || !conciergePlan || showExtendSubscription);
  const paymentMethodResponse = usePaymentMethodQuery({
    skipCreditCardValidation: false,
  });
  const creditCardExists =
    paymentMethodResponse.data?.data?.validateCreditCardResponse
      ?.creditCardExists;

  const MgaPlanDetails = () => {
    //TODO:UA:20240924 Retire `MgaPlanDetail` and rename `MgaPlanDetailC25`
    return (
      <CsfView gap={16}>
        {safetyPlan && (
          <MgaPlanDetailC25
            plan={safetyPlan}
            autoRenewEnabled={creditCardExists}
          />
        )}
        {remotePlan && (
          <MgaPlanDetailC25
            plan={remotePlan}
            autoRenewEnabled={creditCardExists}
          />
        )}
        {conciergePlan && (
          <MgaPlanDetailC25
            plan={conciergePlan}
            autoRenewEnabled={creditCardExists}
          />
        )}
      </CsfView>
    );
  };

  const id = testID('SubscriptionManage');
  return (
    <MgaPage
      showVehicleInfoBar
      isLoading={isLoading}
      title={t('remoteService:manageStarlinkSubscription')}>
      <CsfView edgeInsets standardSpacing>
        <CsfText
          variant="title3"
          align="center"
          testID={id('manageStarlinkSubscription')}>
          {t('remoteService:manageStarlinkSubscription')}
        </CsfText>
        {plans ? (
          <CsfTile>
            <CsfText variant="heading" testID={id('yourCurrentSubscription')}>
              {t('subscriptionManage:yourCurrentSubscription')}
            </CsfText>
            {MgaPlanDetails()}
          </CsfTile>
        ) : null}
        {showCancelAllNotice(plans) && (
          <CsfText testID={id('subscriptionNote')}>
            {t('subscriptionManage:subscriptionNote')}
          </CsfText>
        )}
        {showModifySubscription && (
          <CsfTile>
            <CsfText variant="heading" testID={id('changeYourSubscription')}>
              {t('subscriptionManage:changeYourSubscription')}
            </CsfText>
            <CsfText testID={id('makeChangesToYourSubscription')}>
              {t('subscriptionManage:makeChangesToYourSubscription')}
            </CsfText>
            <MgaButton
              trackingId="SubscriptionManageChangeSubscription"
              title={t('subscriptionManage:changeSubscription')}
              onPress={() => navigation.push('SubscriptionModify')}
            />
          </CsfTile>
        )}
        {showUpgradeSubscription && safetyPlan && (
          <CsfTile>
            <CsfText variant="heading" testID={id('upgradeToday')}>
              {t('subscriptionManage:upgradeToday')}
            </CsfText>
            <CsfText testID={id('accessYourVehicleFeatures')}>
              {(() => {
                if (!remotePlan) {
                  return t('subscriptionUpgrade:accessYourVehicleFeatures');
                } else if (!conciergePlan) {
                  if (vehicle?.features?.includes('PHEV')) {
                    return t(
                      'subscriptionUpgrade:starlinkConciergeDescription3',
                    );
                  } else {
                    return t(
                      'subscriptionUpgrade:starlinkConciergeDescription2',
                    );
                  }
                } else {
                  return t('subscriptionManage:extendYourSecurityPlusPlan');
                }
              })()}
            </CsfText>
            <MgaButton
              trackingId="SubscriptionManageSubscribeNow"
              title={t('common:subscribeNow')}
              onPress={() => navigation.push('SubscriptionUpgrade')}
            />
          </CsfTile>
        )}
        {writeableSubscription && (
          <CsfTile>
            <CsfText
              variant="heading"
              testID={id('updateYourBillingInformation')}>
              {t('subscriptionManage:updateYourBillingInformation')}
            </CsfText>
            <CsfText testID={id('makeSureYourBillingInformationIsUpToDate')}>
              {t('subscriptionManage:makeSureYourBillingInformationIsUpToDate')}
            </CsfText>
            <MgaButton
              trackingId="SubscriptionManageUpdateBillingInformation"
              title={t('subscriptionManage:updateBillingInformation')}
              onPress={() => navigation.push('BillingInformationView')}
            />
          </CsfTile>
        )}
        {writeableSubscription && (
          <CsfTile>
            <CsfText variant="heading" testID={id('unsubscribe')}>
              {t('subscriptionManage:unsubscribe')}
            </CsfText>
            <CsfText testID={id('currentPlanNotWorking')}>
              {t('subscriptionManage:currentPlanNotWorking')}
            </CsfText>
            <MgaButton
              trackingId="SubscriptionManageUnsubscribe"
              title={t('subscriptionManage:unsubscribe')}
              onPress={() => navigation.push('SubscriptionCancel')}
            />
          </CsfTile>
        )}
      </CsfView>
    </MgaPage>
  );
};
