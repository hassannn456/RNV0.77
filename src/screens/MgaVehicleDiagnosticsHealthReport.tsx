import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVehicleHealthWithReportPeriodQuery } from '../api/vehicle.api'
import { formatFullDate, formatShortTime, formatWeekday } from '../utils/dates'
import { B2CCode, VehicleHealthItem } from '../../@types'
import { pushSchedulerScreen } from './scheduler/MgaScheduler'

import ChargeSystem from '../../content/svg/VehicleHealthReport/charge-system-alert-icon.svg'
import PedAirbag from '../../content/svg/VehicleHealthReport/airbag-icon.svg'
import Telematics from '../../content/svg/VehicleHealthReport/telematics.svg'
import { SvgProps } from 'react-native-svg'
import { CsfColorPalette, useCsfColors } from '../components/useCsfColors'
import { getVehicleNormalItems, getVehicleWarningItems } from '../utils/vehicle'
import { useCurrentVehicle } from '../features/auth/sessionSlice'
import { useTimeZones } from '../features/admin/admin.api'
import { testID } from '../components/utils/testID'
import { CsfAccordionSectionProps, CsfDropdownItem } from '../components'
import CsfAccordionList from '../components/CsfAccordionList'
import { MgaAccordionSection } from '../components/CsfAccordionSection'
import CsfActivityIndicator from '../components/CsfActivityIndicator'
import CsfAppIcon from '../components/CsfAppIcon'
import CsfSelect from '../components/CsfSelect'
import CsfText from '../components/CsfText'
import CsfView from '../components/CsfView'
import MgaButton from '../components/MgaButton'

export interface VehicleHealthItemExtended extends VehicleHealthItem {
  header: string
  description: string
}

export const MgaVehicleDiagnosticsHealthReportLight: React.FC<
  SvgProps & { b2cCode: B2CCode }
> = props => {
  const { b2cCode, fill } = props
  const { colors } = useCsfColors()
  const svgProps = {
    width: 24,
    height: 24,
    fill: colors[(fill as keyof CsfColorPalette) || 'copyPrimary'],
  }
  switch (b2cCode) {
    case 'abs':
      return <CsfAppIcon icon="Abs" color={fill} {...svgProps} />
    case 'ahbl':
      return <CsfAppIcon icon="AutomaticHeadlightBeamLeveler" color={fill} />
    case 'airbag':
      return <CsfAppIcon icon="AirbagSystem" color={fill} />
    case 'awd':
      return <CsfAppIcon icon="Awd" color={fill} />
    case 'blindspot':
      return <CsfAppIcon icon="BlindSpotDetection" color={fill} />
    case 'chargeSystem':
      return <ChargeSystem {...svgProps} />
    case 'ebd':
      return <CsfAppIcon icon="Brake" color={fill} />
    case 'epas':
      return <CsfAppIcon icon="PowerSteering" color={fill} />
    case 'eyesight':
      return <CsfAppIcon icon="EyeSight" color={fill} />
    case 'engineFail':
      return <CsfAppIcon icon="CheckEngine" color={fill} />
    case 'hybridSystem':
      return <CsfAppIcon icon="HybridFail" color={fill} />
    case 'iss':
      return <CsfAppIcon icon="AutoOn" color={fill} />
    case 'oilPres':
      return <CsfAppIcon icon="EngineOilLevel" color={fill} />
    case 'oilTemp':
      return <CsfAppIcon icon="AutomaticTransmissionOilTemp" color={fill} />
    case 'oilWarning':
      return <CsfAppIcon icon="EngineOilLevel" color={fill} />
    case 'passairbag':
      return <CsfAppIcon icon="PassengerAirbagOnOff" color={fill} />
    case 'pedairbag':
      return <PedAirbag {...svgProps} />
    case 'pkgBrake':
      return <CsfAppIcon icon="ParkingBrake" color={fill} />
    case 'revBrake':
      return <CsfAppIcon icon="Rab" color={fill} />
    case 'telematics':
      return <Telematics {...svgProps} />
    case 'shevChargeSystem':
      return <CsfAppIcon icon="ShevChargeSystem" color={fill} />
    case 'shevHybridSystem':
      return <CsfAppIcon icon="ShevHybridSystem" color={fill} />
    case 'srh':
      return <CsfAppIcon icon="Srh" color={fill} />
    case 'tpms':
      return <CsfAppIcon icon="TirePressure" color={fill} />
    case 'vdc':
      return <CsfAppIcon icon="VehicleDynamicControl" color={fill} />
    case 'washer':
      return <CsfAppIcon icon="WindshieldFluid" color={fill} />
    case 'hotSystem':
      return <CsfAppIcon icon="HybridHotSystem" color={fill} />
    default:
      return null
  }
}

export const MgaVehicleDiagnosticsHealthReportItemSection: React.FC<
  CsfAccordionSectionProps & {
    item: VehicleHealthItemExtended
    trackingId: string
  }
> = props => {
  const { t } = useTranslation()
  const { item, ...accordionProps } = props
  const vehicle = useCurrentVehicle()
  const timeZones = useTimeZones()
  const selectedTimeZone = timeZones?.find(
    (item: CsfDropdownItem) => item.value === vehicle?.timeZone,
  )
  const derivedId = testID(
    props.trackingId || props.testID || 'VehicleHealthReportItem',
  )
  return (
    <MgaAccordionSection
      icon={
        <MgaVehicleDiagnosticsHealthReportLight
          b2cCode={item.b2cCode}
          fill={item.isTrouble ? 'error' : 'copyPrimary'}
        />
      }
      testID={derivedId()}
      title={item.header}
      // TODO:UA:discuss inline error w/ CL

      renderBody={() => (
        <CsfView
          flexDirection="column"
          p={16}
          gap={4}
          testID={derivedId('body')}>
          <CsfText testID={derivedId('description')}>
            {item.description}
          </CsfText>
          {item.isTrouble && (
            <CsfView gap={4} testID={derivedId('trouble')}>
              <CsfText variant="subheading" testID={derivedId('occurrences')}>
                {t('vehicleDiagnostics:occurrences')}
              </CsfText>

              {item.onDates.map((date, index) => {
                const itemTestId = testID(derivedId(`date-${index}`))
                return (
                  <CsfView
                    key={index}
                    flexDirection="row"
                    testID={itemTestId()}>
                    <CsfView minWidth={24}>
                      <CsfText testID={itemTestId('dateCount')}>
                        {item.onDates.length - index}.
                      </CsfText>
                    </CsfView>
                    <CsfText testID={itemTestId('selectedTimezone')}>
                      {formatWeekday(date)}
                      {', '}
                      {formatFullDate(date)}
                      {'\n'}
                      {formatShortTime(new Date(date).toISOString())}{' '}
                      {selectedTimeZone?.label}
                    </CsfText>
                  </CsfView>
                )
              })}
            </CsfView>
          )}
        </CsfView>
      )}
      {...accordionProps}
    />
  )
}

export const MgaVehicleDiagnosticsHealthReport: React.FC = () => {
  const { t } = useTranslation()
  const [dateRangeSelectorControl, setDateRangeSelectorControl] = useState('0')
  const vehicleHealth = useVehicleHealthWithReportPeriodQuery({
    dateRangeSelectorControl,
  })

  const reportTimePeriods = vehicleHealth.data?.data?.reportTimePeriods?.map(
    rtp => ({
      // TODO:UA:20231120
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      label:
        rtp.monthsAgo == 0
          ? t('vehicleDiagnostics:current')
          : `${formatFullDate(rtp.startDate)} - ${formatFullDate(
            rtp.endDate,
          )} `,
      value: String(rtp.monthsAgo),
    }),
  )
  const loadItem = (item: VehicleHealthItem): VehicleHealthItemExtended => {
    const description: string = t(
      `vehicleDiagnostics:${item.b2cCode}.description`,
    )
    return {
      ...item,
      header: t(`vehicleDiagnostics:${item.b2cCode}.header`),
      description: item.isTrouble
        ? t(`vehicleHealth:${item.b2cCode}.warning`, {
          defaultValue: description,
        })
        : description,
    }
  }
  const compareItem = (a: { header: string }, b: { header: string }) =>
    a.header.localeCompare(b.header)
  const normalItems = [
    ...getVehicleNormalItems(vehicleHealth.data?.data).map(loadItem),
  ].sort(compareItem)
  const warningItems = [
    ...getVehicleWarningItems(vehicleHealth.data?.data).map(loadItem),
  ].sort(compareItem)
  const id = testID('DiagnosticsHealthReport')
  return reportTimePeriods ? (
    <CsfView p={16} gap={24} testID={id()}>
      {/* <CsfText variant="heading" align="center">
              {t('vehicleDiagnostics:systemIndicators')}
            </CsfText> */}
      <CsfSelect
        label={t('vehicleDiagnostics:dateRange')}
        value={dateRangeSelectorControl}
        options={reportTimePeriods}
        onSelect={setDateRangeSelectorControl}
        outsideLabel
        testID={id('dateRange')}
      />
      {vehicleHealth.isFetching ? (
        <CsfView p={20}>
          <CsfActivityIndicator />
        </CsfView>
      ) : (
        <CsfView gap={24} testID={id('container')}>
          {/* {selectedRTP && selectedRTP.monthsAgo != 0 && (
            <CsfText align="center" color="copySecondary">
              {t('vehicleDiagnostics:representedAlerts', {
                startDate: selectedRTP.startDate,
                endDate: selectedRTP.endDate,
              })}
            </CsfText>
          )}
          */}
          {warningItems.length > 0 && (
            <CsfView gap={8} testID={id('warningItems')}>
              <CsfText
                align="center"
                variant="heading"
                color="error"
                testID={id('reportIssue')}>
                {t('vehicleDiagnostics:reportIssue', {
                  count: warningItems.length,
                })}
              </CsfText>

              <CsfAccordionList>
                {warningItems.map((item, i) => (
                  <MgaVehicleDiagnosticsHealthReportItemSection
                    trackingId={`VehicleDiagnosticsWarningAccordion-${i}`}
                    key={item.b2cCode}
                    item={item}
                  />
                ))}

                <CsfView p={16} gap={16}>
                  <CsfText
                    align="center"
                    testID={id('interestedInIssueCheckOut')}>
                    {t('vehicleDiagnostics:interestedInIssueCheckOut', {
                      count: warningItems.length,
                    })}
                  </CsfText>
                  <MgaButton
                    trackingId="ScheduleServiceButton"
                    title={t('common:scheduleService')}
                    onPress={() => pushSchedulerScreen()}
                  />
                </CsfView>
              </CsfAccordionList>
            </CsfView>
          )}

          <CsfView gap={8}>
            <CsfText
              align="center"
              variant="heading"
              color="success"
              testID={id('systemsFunctioningNormally')}>
              {t('vehicleDiagnostics:systemsFunctioningNormally')}
            </CsfText>

            <CsfAccordionList testID={id('list')}>
              {normalItems.map((item, i) => (
                <MgaVehicleDiagnosticsHealthReportItemSection
                  trackingId={`VehicleDiagnosticNormalAccordion-${i}`}
                  key={item.b2cCode}
                  item={item}
                />
              ))}
            </CsfAccordionList>
          </CsfView>
        </CsfView>
      )}
      <CsfText
        align="center"
        color="copySecondary"
        variant="caption"
        testID={id('disclaimer')}>
        {t('vehicleDiagnostics:disclaimer')}
      </CsfText>
    </CsfView>
  ) : (
    <CsfView p={20}>
      <CsfActivityIndicator />
    </CsfView>
  )
}
