/* eslint-disable semi */
import React from 'react'
import { ScheduleForm } from '../../../@types'
import { formatFullDateTime, formatWeekday } from '../../utils/dates'
import { useTranslation } from 'react-i18next'
import CsfView from '../../components/CsfView'
import CsfText from '../../components/CsfText'

/**
 * Paragraph view containing appointment info
 *
 * Used in various scheduler screens
 **/
const MgaAppointmentInfo: React.FC<ScheduleForm> = ({
  appointmentDateLocal,
  transportType,
}) => {
  const { t } = useTranslation()
  const transportTypes = [
    '',
    t('scheduleSummary:dropOffVehicle'),
    t('scheduleSummary:waitAtDealership'),
  ]
  return (
    <CsfView align="center">
      <CsfText>{t('scheduleSummary:appointmentFor')}</CsfText>
      <CsfText bold>
        {formatWeekday(appointmentDateLocal)}
        {', '}
        {formatFullDateTime(appointmentDateLocal)}
      </CsfText>
      <CsfText>{transportTypes[transportType ?? 0]}</CsfText>
    </CsfView>
  )
}

export default MgaAppointmentInfo
