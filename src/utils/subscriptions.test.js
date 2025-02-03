jest.mock('../i18n', () => ({
  t: (key, params) => `${key}${params ? JSON.stringify(params) : ''}`,
}));

jest.mock('../api/userAttributes.api', () => ({
  userAttributesApi: {
    injectEndpoints: jest.fn(),
  },
}));

import {getRefundPlan} from './subscriptions';

describe('getRefundPlan', () => {
  it('returns the correct refund plan for all subscription types', () => {
    const subscriptionTypes = ['SAFETY', 'REMOTE', 'CONCIERGE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSafetySecurityAndConcierge');
  });

  it('returns the correct refund plan for SAFETY and REMOTE', () => {
    const subscriptionTypes = ['SAFETY', 'REMOTE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSafetyAndSecurity');
  });

  it('returns the correct refund plan for REMOTE and CONCIERGE', () => {
    const subscriptionTypes = ['REMOTE', 'CONCIERGE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSecurityAndConcierge');
  });

  it('returns the correct refund plan for SAFETY and CONCIERGE', () => {
    const subscriptionTypes = ['SAFETY', 'CONCIERGE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSafetyAndConcierge');
  });

  it('returns the correct refund plan for SAFETY only', () => {
    const subscriptionTypes = ['SAFETY'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSafetyPlus');
  });

  it('returns the correct refund plan for REMOTE only', () => {
    const subscriptionTypes = ['REMOTE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkSecurityPlus');
  });

  it('returns the correct refund plan for CONCIERGE only', () => {
    const subscriptionTypes = ['CONCIERGE'];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('common:starlinkConcierge');
  });

  it('returns an empty string when no subscription types are provided', () => {
    const subscriptionTypes = [];
    const result = getRefundPlan(subscriptionTypes);
    expect(result).toBe('');
  });
});
