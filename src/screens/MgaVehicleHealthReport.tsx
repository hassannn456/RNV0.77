import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVehicleHealthQuery } from '../api/vehicle.api';
import { VehicleHealthItem } from '../../@types';
import { pushSchedulerScreen } from './scheduler/MgaScheduler';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  MgaVehicleDiagnosticsHealthReportItemSection,
  VehicleHealthItemExtended,
} from './MgaVehicleDiagnosticsHealthReport';
import { getVehicleNormalItems, getVehicleWarningItems } from '../utils/vehicle';
import { testID } from '../components/utils/testID';
import CsfAccordionList from '../components/CsfAccordionList';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

/** Simplified health report (no historical data) uses by Gen1 */
export const MgaVehicleHealthReport: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vehicleHealthMap = useVehicleHealthQuery({ vin: vehicle?.vin }).data
    ?.data;

  const loadItem = (item: VehicleHealthItem): VehicleHealthItemExtended => {
    const description: string = t(
      `vehicleDiagnostics:${item.b2cCode}.description`,
    );
    return {
      ...item,
      header: t(`vehicleDiagnostics:${item.b2cCode}.header`),
      description: item.isTrouble
        ? t(`vehicleHealth:${item.b2cCode}.warning`, {
          defaultValue: description,
        })
        : description,
    };
  };
  const compareItem = (a: { header: string }, b: { header: string }) =>
    a.header.localeCompare(b.header);
  const normalItems = [
    ...getVehicleNormalItems(vehicleHealthMap).map(loadItem),
  ].sort(compareItem);
  const warningItems = [
    ...getVehicleWarningItems(vehicleHealthMap).map(loadItem),
  ].sort(compareItem);

  const id = testID('VehicleHealthReport');
  return vehicleHealthMap ? (
    <MgaPage title={t('vehicleHealth:title')} showVehicleInfoBar>
      <CsfView ph={16} pv={24} testID={id()}>
        <CsfView testID={id('titleContainer')}>
          <CsfText align="center" variant="title2" testID={id('title')}>
            {t('vehicleHealth:title')}
          </CsfText>
        </CsfView>
        {/* Note: Commenting as part of MGA-1645 */}
        {/* <CsfView flexDirection="row" justify="space-between" align="center">
          <CsfView width={20}></CsfView>
          <CsfText variant="title3">
            {t('vehicleDiagnostics:systemIndicators')}
          </CsfText>
          <CsfInfoButton
            title={t('vehicleDiagnostics:systemIndicators')}
            text={t('vehicleDiagnostics:disclaimer')}
          />
        </CsfView> */}
        {warningItems.length > 0 && (
          <CsfView gap={4} testID={id('warningItemsContainer')}>
            <CsfText
              align="center"
              variant="subheading"
              color="error"
              testID={id('reportIssue')}>
              {t('vehicleDiagnostics:reportIssue', {
                count: warningItems.length,
              })}
            </CsfText>

            <CsfAccordionList testID={id('list')}>
              {warningItems.map((item, i) => (
                <MgaVehicleDiagnosticsHealthReportItemSection
                  trackingId={`HealthReportWarningAccordion-${i}`}
                  key={item.b2cCode}
                  item={item}
                />
              ))}
            </CsfAccordionList>
            <CsfText
              align="center"
              variant="title3"
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
            <CsfView pv={4}>
              <CsfRule orientation="horizontal" color="copyPrimary" />
            </CsfView>
          </CsfView>
        )}
        <CsfView pb={4}>
          <CsfText
            align="center"
            variant="subheading"
            color="success"
            testID={id('systemsFunctioningNormally')}>
            {t('vehicleDiagnostics:systemsFunctioningNormally')}
          </CsfText>
        </CsfView>
        <CsfView>
          <CsfAccordionList testID={id('list')}>
            {normalItems.map((item, i) => (
              <MgaVehicleDiagnosticsHealthReportItemSection
                key={item.b2cCode}
                trackingId={`HealthReportNormalAccordion-${i}`}
                item={item}
              />
            ))}
          </CsfAccordionList>
        </CsfView>
      </CsfView>
      <CsfText align="center" color="copySecondary" testID={id('disclaimer')}>
        {t('vehicleDiagnostics:disclaimer')}
      </CsfText>
      <CsfView p={16}>
        <MgaRetailerEmbed />
      </CsfView>
    </MgaPage>
  ) : (
    <CsfView p={20}>
      <CsfActivityIndicator />
    </CsfView>
  );
};

export default MgaVehicleHealthReport;
