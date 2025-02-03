/* eslint-disable  @typescript-eslint/restrict-plus-operands  */
import {
  AddedPlan,
  PlanOptions,
  RateSchedule,
  SubscriptionDetail,
} from '../../@types';
import i18n from '../i18n';
import {formatFullDate, parseDateObject} from './dates';

export const formatCurrencyForBilling = (
  value?: number | null,
  options?: Intl.NumberFormatOptions,
): string => {
  const {t} = i18n;
  if (value === undefined) {
    return '--';
  }
  if (value === null) {
    // Cordova uses Math.abs(null) == 0 here
    return formatCurrencyForBilling(0, options);
  }
  return Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: t('units:currency'),
    ...options,
  }).format(value);
};

/** Ex: 6 Months */
export const getStringFromMonths = (
  months: number,
  suffix?: string,
): string => {
  const {t} = i18n;
  const base: string = (() => {
    if (months == 1) {
      return t('subscriptionEnrollment:monthly');
    } else if (months % 12 == 0) {
      return t('subscriptionEnrollment:year', {count: months / 12});
    } else {
      return t('subscriptionEnrollment:month', {count: months});
    }
  })();
  return base + (suffix ? ' ' + suffix : '');
};

/** Ex: 3 Year Free Trial */
export const getPlanDurationString = (plan: SubscriptionDetail): string => {
  const {t} = i18n;
  return getStringFromMonths(
    plan.months,
    plan.trial
      ? t('subscriptionEnrollment:freeTrial')
      : t('subscriptionEnrollment:subscription'),
  );
};

/** Ex: 10 Year - $300.00 */
export const getRatePriceString = (rate: RateSchedule): string => {
  const {t} = i18n;
  if (rate.months == 1 && !rate.masterPlanId.includes('Safety')) {
    const price = formatCurrencyForBilling(rate.price);
    if (isLiveTrafficRate(rate)) {
      return t('trafficConnectSubscription:monthly', {tcMonthlyFee: price});
    } else {
      return (
        t('subscriptionUpgrade:autorenewAsMonthlySubscription') +
        ' ' +
        t('subscriptionUpgrade:perMonth', {
          rate: price,
        })
      );
    }
  } else {
    return getStringFromMonths(
      rate.months,
      '- ' +
        '<b>' +
        (rate.price == 0
          ? t('subscriptionEnrollment:freeTrial')
          : formatCurrencyForBilling(rate.price)) +
        '</b>',
    );
  }
};

export const getMonthsFromRateScheduleId = (
  rateScheduleId: string | undefined,
): number => {
  if (!rateScheduleId) return 1;
  // Copied from subscriptionEnrollment.js, based on GIIMA-5930. Amend as needed.
  const match = rateScheduleId.match(/(\d+)M/);
  const months = match && match.length == 2 ? parseInt(match[1]) : 1;
  return months;
};

export const getUpgradePriceString = (plan: PlanOptions): string => {
  const {t} = i18n;
  return getStringFromMonths(
    getMonthsFromRateScheduleId(plan.rateScheduleId),
    '- ' +
      (plan.price == 0
        ? t('subscriptionEnrollment:freeTrial')
        : formatCurrencyForBilling(plan.price)),
  );
};

export const getExpString = (
  templateString: string,
  addedPlan: AddedPlan | undefined,
): string | undefined => {
  if (!addedPlan) return undefined;
  const {t} = i18n;
  return t(templateString, {
    when: formatFullDate(addedPlan.endDate),
  });
};

/**
 * Are SAFETY and REMOTE linked in UI?
 *
 * This currently only happens in 10-year PHEV free trials.
 * I don't have a better test.
 */
export const isCombinedSafetyAndRemoteTrial = (
  safety: RateSchedule | null | undefined,
  remote: RateSchedule | null | undefined,
): boolean => {
  return (
    safety?.rateScheduleId == 'starlinkSafetyWithTrialRetailPHEV120M' &&
    remote?.rateScheduleId == 'starlinkRemoteServicesWithTrialRetailPHEV120M'
  );
};

export const isLiveTrafficRate = (
  rate: RateSchedule | null | undefined,
): boolean => {
  return rate?.rateScheduleId.includes('TomTom');
};

/** Get expiration (or renewal) formatted string for plan. */
export const getExpirationStringForPlan = (
  plan: SubscriptionDetail,
): string => {
  const {t} = i18n;
  if (plan.automaticRenewal) {
    return t('subscriptionEnrollment:autoRenews', {
      when: formatFullDate(parseDateObject(plan.nextBillingDate)),
    });
  } else {
    return t('subscriptionEnrollment:expireOn', {
      when: formatFullDate(parseDateObject(plan.expirationDate)),
    });
  }
};

/** Get Refund plan name */
export const getRefundPlan = (subscriptionTypes: string[]): string => {
  const {t} = i18n;

  if (
    subscriptionTypes.includes('SAFETY') &&
    subscriptionTypes.includes('REMOTE') &&
    subscriptionTypes.includes('CONCIERGE')
  ) {
    return t('common:starlinkSafetySecurityAndConcierge');
  }
  if (
    subscriptionTypes.includes('SAFETY') &&
    subscriptionTypes.includes('REMOTE')
  ) {
    return t('common:starlinkSafetyAndSecurity');
  }
  if (
    subscriptionTypes.includes('REMOTE') &&
    subscriptionTypes.includes('CONCIERGE')
  ) {
    return t('common:starlinkSecurityAndConcierge');
  }
  if (
    subscriptionTypes.includes('SAFETY') &&
    subscriptionTypes.includes('CONCIERGE')
  ) {
    return t('common:starlinkSafetyAndConcierge');
  }
  if (subscriptionTypes.includes('CONCIERGE')) {
    return t('common:starlinkConcierge');
  }
  if (subscriptionTypes.includes('REMOTE')) {
    return t('common:starlinkSecurityPlus');
  }
  if (subscriptionTypes.includes('SAFETY')) {
    return t('common:starlinkSafetyPlus');
  }
  return '';
};
