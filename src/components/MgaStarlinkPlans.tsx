/* eslint-disable react/self-closing-comp */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentVehicle } from '../features/auth/sessionSlice'
import { formatFullDate, parseDateObject } from '../utils/dates'
import CsfCard from './CsfCard'
import { CsfRuleList } from './CsfRuleList'
import CsfDetail from './CsfDetail'

/** List subscriptions plans for current vehicle. Embed in screens as needed. */
const MgaStarlinkPlans: React.FC = () => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const plans = vehicle?.subscriptionPlans ?? []
  return (
    plans.length > 0 && (
      <CsfCard title={t('vehicleInformation:starlink')}>
        <CsfRuleList>
          <CsfDetail
            label={t('vehicleInformation:currentPlan')}
            value={t('common:expiration')}
          />
          {plans.map((plan, index) => {
            const expireDate = plan.expireDateLocal
              ? parseDateObject(plan.expireDateLocal)
              : plan.expireDate
                ? new Date(plan.expireDate)
                : undefined
            return (
              <CsfDetail
                key={index}
                label={plan.description}
                value={formatFullDate(expireDate)}
              />
            )
          })}
        </CsfRuleList>
      </CsfCard>
    )
  )
}

export default MgaStarlinkPlans
