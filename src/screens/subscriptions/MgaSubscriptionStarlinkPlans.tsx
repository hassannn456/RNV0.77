/* eslint-disable react/self-closing-comp */
/* eslint-disable  @typescript-eslint/restrict-plus-operands */
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useRateSchedulesQuery } from '../../api/initialEnrollment.api'
import {
  formatCurrencyForBilling,
  getRatePriceString,
} from '../../utils/subscriptions'
import { RateSchedule } from '../../../@types'
import MgaSubscriptionFeatureListRemote from './MgaSubscriptionFeatureListRemote'
import MgaSubscriptionFeatureListSafety from './MgaSubscriptionFeatureListSafety'
import { testID } from '../../components/utils/testID'
import CsfActivityIndicator from '../../components/CsfActivityIndicator'
import CsfView, { CsfViewProps } from '../../components/CsfView'
import CsfText from '../../components/CsfText'
import { CsfCheckBox } from '../../components/CsfCheckbox'
import CsfTile from '../../components/CsfTile'
import CsfRule from '../../components/CsfRule'

/** Safety Plan Description + Selection **/
export const MgaSubscriptionStarlinkSafetyPlans: React.FC<
  CsfViewProps & {
    /**
     * Event fires when selecting a **SAFETY** plan.
     *
     * MGA-1971: On selection of a **SAFETY** plan,
     * **REMOTE** and **CONCIERGE** should always update.
     * In all cases *except* PHEV **SAFETY**+**REMOTE** trial,
     * they should update to `null`.
     * **CONCIERGE** currently always returns `null`.
     **/
    onSelect?: (
      safety: RateSchedule | null,
      remote: RateSchedule | null,
      concierge: null,
    ) => void
    selected?: string
  }
> = ({ onSelect, selected, ...props }) => {
  const { t } = useTranslation()
  const rateSchedules = useRateSchedulesQuery({ starlinkPackage: 'SAFETY' })
    .data?.data
  const eligibleForTrial =
    rateSchedules?.eligibleForTrial && !rateSchedules.cpoEligible
  const id = testID('SubscriptionStarlingSafetyPlans')

  if (!rateSchedules) {
    return <CsfActivityIndicator />
  } else if (
    eligibleForTrial &&
    rateSchedules?.phevSafetyRateSchedule &&
    rateSchedules.phevRemoteRateSchedule
  ) {
    // NOTE: Cordova also checks Vehicle == PHEV (checked on backend) and Package == SAFETY (checked before loading control)
    return (
      <CsfView gap={8} {...props}>
        <CsfText
          align="center"
          variant="heading"
          testID={id('starlinkSafetyAndSecurityPHEV')}>
          {t('subscriptionEnrollment:starlinkSafetyAndSecurityPHEV')}
        </CsfText>
        <CsfText
          align="center"
          variant="body2"
          testID={id('receiveTenYearsFree')}>
          {t('subscriptionEnrollment:receiveTenYearsFree')}
        </CsfText>
        <CsfTile gap={4}>
          <CsfText
            variant="subheading"
            testID={id('chooseTheLengthOfYourPlan')}>
            {t('subscriptionModify:chooseTheLengthOfYourPlan')}
          </CsfText>
          <CsfView>
            {[rateSchedules.phevSafetyRateSchedule].map((s, index) => {
              const itemTestId = testID(id(`schedule-${index}`))
              return (
                <CsfCheckBox
                  key={s.rateScheduleId}
                  testID={itemTestId()}
                  label={getRatePriceString(s)}
                  checked={s.rateScheduleId == selected}
                  onChangeValue={value => {
                    onSelect &&
                      rateSchedules?.phevSafetyRateSchedule &&
                      rateSchedules.phevRemoteRateSchedule &&
                      onSelect(
                        value ? rateSchedules.phevSafetyRateSchedule : null,
                        value ? rateSchedules.phevRemoteRateSchedule : null,
                        null,
                      )
                  }}
                />
              )
            })}
          </CsfView>
        </CsfTile>
        <CsfText variant="subheading" testID={id('takeAdvantage')}>
          {t('subscriptionUpgrade:takeAdvantage')}
        </CsfText>
        <CsfView>
          <MgaSubscriptionFeatureListSafety />
          <MgaSubscriptionFeatureListRemote hideSafetyIntro />
        </CsfView>
      </CsfView>
    )
  } else {
    return (
      <CsfView gap={8} {...props}>
        <CsfText
          align="center"
          variant="heading"
          testID={id('safetyComesFirst')}>
          {t('subscriptionModify:safetyComesFirst')} {' - '}
          {t('common:starlinkSafetyPlus')}
        </CsfText>
        <CsfText
          align="center"
          variant="body2"
          testID={id('safetyPlusDescription')}>
          {t('subscriptionModify:safetyPlusDescription')}
        </CsfText>
        <CsfTile gap={4}>
          <CsfText
            variant="subheading"
            testID={id('chooseTheLengthOfYourPlan')}>
            {t('subscriptionModify:chooseTheLengthOfYourPlan')}
          </CsfText>
          <CsfView>
            {rateSchedules.rateSchedules.map((s, index) => {
              const itemTestId = testID(id(`schedule-${index}`))
              return (
                <CsfCheckBox
                  key={s.rateScheduleId}
                  testID={itemTestId()}
                  label={getRatePriceString(s)}
                  checked={selected == s.rateScheduleId}
                  onChangeValue={value => {
                    onSelect && onSelect(value ? s : null, null, null)
                  }}
                />
              )
            })}
          </CsfView>
          {eligibleForTrial && (
            <CsfText variant="caption" testID={id('includesFree3YearTrial')}>
              {t('subscriptionModify:includesFree3YearTrial')}
            </CsfText>
          )}
        </CsfTile>
        <CsfText variant="subheading" testID={id('newFeaturesInclude')}>
          {t('subscriptionUpgrade:newFeaturesInclude')}
        </CsfText>
        <MgaSubscriptionFeatureListSafety />
      </CsfView>
    )
  }
}

/** Remote Plan Description + Selection **/
export const MgaSubscriptionStarlinkRemotePlans: React.FC<
  CsfViewProps & {
    onSelect?: (item: RateSchedule | null) => void
    safetyPlan: RateSchedule
    selected?: string
  }
> = ({ onSelect, safetyPlan, selected, ...props }) => {
  const { t } = useTranslation()
  const rateSchedules = useRateSchedulesQuery({
    starlinkPackage: 'REMOTE',
    currentDurationMonths: safetyPlan.months,
  }).data?.data
  const eligibleForTrial =
    rateSchedules?.eligibleForTrial && !rateSchedules.cpoEligible
  const id = testID('SubscriptionStarlinkRemotePlans')
  return rateSchedules ? (
    <CsfView gap={8} {...props}>
      <CsfText align="center" variant="heading" testID={id('giveABoost')}>
        {t('subscriptionUpgrade:giveABoost')}
      </CsfText>
      <CsfText
        align="center"
        variant="body2"
        testID={id('starlinkSecurityPlusServices')}>
        {t('subscriptionUpgrade:starlinkSecurityPlusServices')}
      </CsfText>
      <CsfRule />
      <CsfText
        align="center"
        variant="body2"
        testID={id('accessYourVehicleFeatures')}>
        {t('subscriptionUpgrade:accessYourVehicleFeatures')}
      </CsfText>

      <CsfTile gap={4}>
        <CsfText variant="subheading" testID={id('addYourOptionalUpgrade')}>
          {t('subscriptionUpgrade:addYourOptionalUpgrade')}
        </CsfText>
        <CsfView>
          {rateSchedules.rateSchedules.map((s, index) => {
            const itemTestId = testID(id(`rateSchedule-${index}`))
            return (
              <CsfCheckBox
                key={s.rateScheduleId}
                testID={itemTestId()}
                label={
                  t('subscriptionModify:securityPlus') +
                  '\n' +
                  getRatePriceString(s)
                }
                checked={s.rateScheduleId == selected}
                onChangeValue={value => {
                  onSelect && onSelect(value ? s : null)
                }}
              />
            )
          })}
        </CsfView>
        {eligibleForTrial && (
          <CsfText variant="caption" testID={id('includesFreeTrial')}>
            {t('subscriptionUpgrade:includesFreeTrial')}
          </CsfText>
        )}
      </CsfTile>
      <CsfText variant="subheading" testID={id('newFeaturesInclude')}>
        {t('subscriptionUpgrade:newFeaturesInclude')}
      </CsfText>
      <MgaSubscriptionFeatureListRemote />
    </CsfView>
  ) : (
    <CsfActivityIndicator></CsfActivityIndicator>
  )
}

/** Concierge Plan Description + Selection **/
export const MgaSubscriptionStarlinkConciergePlans: React.FC<
  CsfViewProps & {
    onSelect?: (item: RateSchedule | null) => void
    remotePlan: RateSchedule
    selected?: string
  }
> = ({ onSelect, remotePlan, selected, ...props }) => {
  const { t } = useTranslation()
  const rateSchedules = useRateSchedulesQuery({
    starlinkPackage: 'CONCIERGE',
    currentDurationMonths: remotePlan.months,
  }).data?.data
  const id = testID('SubscriptionStarlinkConciergePlans')
  return rateSchedules ? (
    <CsfView gap={8} {...props}>
      <CsfText
        align="center"
        variant="heading"
        testID={id('enhanceYourRemoteServices')}>
        {t('subscriptionModify:enhanceYourRemoteServices')}
      </CsfText>
      <CsfText align="center" variant="body2" testID={id('starlinkConcierge')}>
        {t('subscriptionUpgrade:starlinkConcierge')}
      </CsfText>
      <CsfRule />
      <CsfText
        align="center"
        variant="body2"
        testID={id('starlinkConciergeDescription1')}>
        {t('subscriptionUpgrade:starlinkConciergeDescription1')}
      </CsfText>

      <CsfTile gap={4}>
        <CsfText variant="subheading" testID={id('addYourOptionalUpgrade')}>
          {t('subscriptionUpgrade:addYourOptionalUpgrade')}
        </CsfText>
        <CsfView>
          {rateSchedules.rateSchedules.map((s, index) => {
            const title =
              s.months != 1
                ? t('subscriptionModify:conciergeService') +
                '\n' +
                getRatePriceString(s)
                : t('subscriptionUpgrade:monthlyConciergeSubscription') +
                '\n' +
                t('subscriptionUpgrade:autorenewAsMonthlySubscription') +
                ' ' +
                t('subscriptionUpgrade:perMonth', {
                  rate: formatCurrencyForBilling(s?.price),
                })
            const itemTestId = testID(id(`rateSchedule-${index}`))
            return (
              <CsfCheckBox
                key={s.rateScheduleId}
                testID={itemTestId()}
                label={title}
                checked={s.rateScheduleId == selected}
                onChangeValue={value => {
                  onSelect && onSelect(value ? s : null)
                }}
              />
            )
          })}
        </CsfView>
      </CsfTile>
    </CsfView>
  ) : (
    <CsfActivityIndicator></CsfActivityIndicator>
  )
}
