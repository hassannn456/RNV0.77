// cSpell:ignore callcenter , VALRESETPINRESPONSE , VALSETTINGSRESPONSE,VALONRESPONSE,VALOFFRESPONSE
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import i18n from '../i18n';
import {
  GeneratedUsageReport,
  useUsageReportEventUserListQuery,
  useUsageReportQuery,
} from '../api/usage.api';
import { RemoteCommandName } from '../features/remoteService/remoteService.api';
import { TeleServiceUsageIngest } from '../../@types';
import { CsfIcon } from '../../core/res/assets/icons';
import { canAccessScreen } from '../utils/menu';
import { formatFullDate, formatShortTime } from '../utils/dates';
import { testID } from '../components/utils/testID';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfRule from '../components/CsfRule';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSelect from '../components/CsfSelect';
import CsfTableViewCell from '../components/CsfTableViewCell';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const dateFmt = (d: number) => {
  return formatFullDate(new Date(d));
};

interface ReportStructure {
  dataKey: keyof GeneratedUsageReport

  icon?: CsfIcon
  i18n?: string
}

const reportData: ReportStructure[] = [
  { dataKey: 'Boundary Alert', icon: 'BoundaryAlert' },
  { dataKey: 'Curfew Alert', icon: 'CurfewAlert' },
  {
    dataKey: 'Remote Climate Control Start',
    icon: 'EngineStart',
  },
  {
    dataKey: 'Remote Climate Control Stop',
    icon: 'EngineStop',
  },
  { dataKey: 'Remote Door Lock', icon: 'DoorLock' },
  { dataKey: 'Remote Door Unlock', icon: 'DoorUnlock' },
  { dataKey: 'Remote Engine Start', icon: 'EngineStart' },
  { dataKey: 'Remote Engine Stop', icon: 'EngineStop' },
  { dataKey: 'Remote Horn and Lights', icon: 'HornLights' },
  { dataKey: 'Vehicle Locate', icon: 'LocateVehicle' },
  { dataKey: 'Security Alarm Notification', icon: 'SecurityAlarm' },
  { dataKey: 'Speed Alert', icon: 'SpeedAlert' },
  { dataKey: 'Trip Logs', icon: 'TripLogs' },
  { dataKey: 'Valet Mode', icon: 'ValetMode' },
];
const reportColumnWidths = {
  status: '24%',
  requestMethod: '35%',
  submitDate: '29%',
  disclosureArrow: '12%',
};

const toTitleCase = (s: string) => {
  return s
    .toLowerCase()
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const getStatusIcon = (
  status: TeleServiceUsageIngest['status'],
): JSX.Element | null => {
  switch (status) {
    case 'Successful':
      return <CsfAppIcon icon="Success" color="success" />;
    case 'cancelled':
      return <CsfAppIcon icon="Cancel" color="copySecondary" />;
    case 'Failed':
      return <CsfAppIcon color="warning" icon="WarningAttentionFill" />;
    default:
      return null;
  }
};

export const getSubmitDateStrings = (
  line: TeleServiceUsageIngest,
): [string, string] => {
  const d = new Date(line.eventCreatedTime);
  return [formatFullDate(d), formatShortTime(d)];
};

export const getRequestMethod = (line: TeleServiceUsageIngest): string => {
  if (line.initiator == 'OEM') { return 'Agent'; }
  if (line.initiator == 'USER' && line.userId == 'callcenter') { return 'Agent'; }
  return toTitleCase(line.initiator);
};
export const getCommandName = (line: TeleServiceUsageIngest): string => {
  return line?.serviceMessageName ? line.serviceMessageName : '';
};
export const getServiceName = (line: TeleServiceUsageIngest): string => {
  return line?.serviceName ? line.serviceName : '';
};
export const mapUsageReportCommandToRemoteCommand = (
  command: keyof GeneratedUsageReport,
  line?: TeleServiceUsageIngest,
): RemoteCommandName | null => {
  const commandName = line ? getCommandName(line) : undefined;
  const serviceName = line ? getServiceName(line) : undefined;
  switch (command) {
    case 'Boundary Alert':
      return 'boundaryAlert';
    case 'Curfew Alert':
      return 'curfewAlert';
    case 'Remote Climate Control Start':
      return 'climateControlStart';
    case 'Remote Climate Control Stop':
      return 'climateControlStop';
    case 'Remote Door Lock':
      return 'lockDoors';
    case 'Remote Door Unlock': {
      switch (serviceName?.toUpperCase()) {
        case 'TAILGATE_DOOR_CMD':
          return 'unlockTailgate';
        default:
          return 'unlockDoors';
      }
    }
    case 'Remote Engine Start':
      return 'remoteEngineStart';
    case 'Remote Engine Stop':
      return 'remoteEngineStop';
    case 'Remote Horn and Lights': {
      switch (serviceName?.toUpperCase()) {
        case 'HORN AND LIGHTS':
          return 'hornLights';
        case 'LIGHTS ONLY':
          return 'lightsOnly';
        default:
          return 'hornLights';
      }
    }
    case 'Speed Alert':
      return 'speedAlert';
    case 'Vehicle Locate':
      return 'locateVehicle';
    case 'Valet Mode': {
      switch (commandName?.toUpperCase()) {
        case 'VALRESETPINRESPONSE':
          return 'valetModeReset';
        case 'VALSETTINGSRESPONSE':
          return 'valetModeSaveSettings';
        case 'VALONRESPONSE':
          return 'valetModeStart';
        case 'VALOFFRESPONSE':
          return 'valetModeStop';
        default:
          return 'valetMode';
      }
    }
    default:
      return null;
  }
};

const translateUsageReportCommand = (
  command: keyof GeneratedUsageReport,
): string => {
  const remoteCommand = mapUsageReportCommandToRemoteCommand(command);
  if (remoteCommand) {
    const { t } = i18n;
    return toTitleCase(t(`command:${remoteCommand}.name`));
  } else {
    /** TODO:UA:20230308: Need official strings for: 'Security Alarm Notification', 'Trip Logs' */
    return command;
  }
};

const MgaUsageReport: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [dateRangeIndex, setDateRangeIndex] = useState(0);
  const usageReport = useUsageReportQuery({
    dateRangeIndex,
  });
  // Called here to force caching, used in detail screen
  const usageReportUsers = useUsageReportEventUserListQuery(undefined);
  const periods = (usageReport.data?.data?.reportTimePeriods ?? []).map(
    rtp => ({
      label: `${dateFmt(rtp.startDate)} - ${dateFmt(rtp.endDate)} `,
      value: String(rtp.monthsAgo),
    }),
  );
  const reports = usageReport.data?.data?.usageReport ?? {};

  const id = testID('UsageReport');
  return (
    <MgaPage title={t('usageReport:title')} showVehicleInfoBar>
      <MgaPageContent
        title={t('usageReport:title')}
        isLoading={usageReport.isLoading || usageReportUsers.isLoading}>
        <CsfView flex={1} gap={16} testID={id()}>
          <CsfView gap={16}>
            <CsfSelect
              label={t('usageReport:selectDateRange')}
              testID={id('dateRange')}
              options={periods}
              value={String(dateRangeIndex)}
              onSelect={value => setDateRangeIndex(parseInt(value))}
              outsideLabel
            />
            <CsfView flexDirection="row" justify="space-between">
              <CsfView flexDirection="row" gap={8} align="center">
                {getStatusIcon('Successful')}
                <CsfText variant="caption" testID={id('successful')}>
                  {t('usageReport:successful')}
                </CsfText>
              </CsfView>
              <CsfView flexDirection="row" gap={8} align="center">
                {getStatusIcon('Failed')}
                <CsfText variant="caption" testID={id('unsuccessful')}>
                  {t('usageReport:unsuccessful')}
                </CsfText>
              </CsfView>
              <CsfView flexDirection="row" gap={8} align="center">
                {getStatusIcon('cancelled')}
                <CsfText variant="caption" testID={id('cancelled')}>
                  {t('usageReport:cancelled')}
                </CsfText>
              </CsfView>
            </CsfView>
          </CsfView>
          <CsfView isLoading={usageReport.isFetching}>
            <CsfTile p={0} gap={0}>
              <CsfRuleList testID={id('list')}>
                {reportData
                  .filter(item => reports[item.dataKey])
                  .filter(item => {
                    if (item.dataKey == 'Valet Mode') {
                      return canAccessScreen('ValetMode');
                    }
                    return true;
                  })
                  .map((item, i) => {
                    const count: number = reports[item.dataKey]?.length || 0;
                    const countLabel = count > 0 ? `(${count})` : '';
                    return (
                      <MgaAccordionSection
                        trackingId={`UsageReportAccordion-${i}`}
                        key={item.dataKey}
                        icon={<CsfAppIcon icon={item.icon} />}
                        title={`${translateUsageReportCommand(
                          item.dataKey,
                        )} ${countLabel}`}
                        renderBody={
                          reports[item.dataKey]?.length ?? 0
                            ? () => (
                              <CsfView>
                                <CsfView>
                                  <CsfView flexDirection="row">
                                    <CsfView
                                      width={reportColumnWidths.status}>
                                      <CsfText
                                        style={{ fontWeight: 'bold' }}
                                        testID={id(
                                          `UsageReportAccordion-${i}`,
                                        )}>
                                        {t('usageReport:status')}
                                      </CsfText>
                                    </CsfView>
                                    <CsfView
                                      width={
                                        reportColumnWidths.requestMethod
                                      }>
                                      <CsfText testID={id('requestMethod')}>
                                        {t('usageReport:requestMethod')}
                                      </CsfText>
                                    </CsfView>
                                    <CsfView
                                      width={reportColumnWidths.submitDate}>
                                      <CsfText testID={id('submitDate')}>
                                        {t('usageReport:submitDate')}
                                      </CsfText>
                                    </CsfView>
                                    <CsfView
                                      width={
                                        reportColumnWidths.disclosureArrow
                                      } />
                                  </CsfView>
                                  <CsfRule orientation="horizontal" />
                                </CsfView>
                                {reports[item.dataKey]?.map((line, index) => {
                                  const [date, time] =
                                    getSubmitDateStrings(line);
                                  return (
                                    <CsfTableViewCell
                                      key={String(index)}
                                      onPress={() => {
                                        const data = {
                                          ...line,
                                          command: item.dataKey,
                                        };
                                        navigation.push(
                                          'UsageReportDetail',
                                          data,
                                        );
                                      }}>
                                      <CsfView
                                        flexDirection="row"
                                        align="center">
                                        <CsfView
                                          width={reportColumnWidths.status}>
                                          {getStatusIcon(line.status)}
                                        </CsfView>
                                        <CsfView
                                          width={
                                            reportColumnWidths.requestMethod
                                          }>
                                          <CsfText
                                            testID={id('requestedMethod')}>
                                            {getRequestMethod(line)}
                                          </CsfText>
                                        </CsfView>
                                        <CsfView
                                          width={
                                            reportColumnWidths.submitDate
                                          }>
                                          <CsfText testID={id('date')}>
                                            {date}
                                          </CsfText>
                                          <CsfText testID={id('time')}>
                                            {time}
                                          </CsfText>
                                        </CsfView>
                                        <CsfView
                                          align="flex-end"
                                          width={
                                            reportColumnWidths.disclosureArrow
                                          }>
                                          <CsfAppIcon icon="BackForwardArrow" />
                                        </CsfView>
                                      </CsfView>
                                    </CsfTableViewCell>
                                  );
                                })}
                              </CsfView>
                            )
                            : undefined
                        }
                      />
                    );
                  })}
              </CsfRuleList>
            </CsfTile>
          </CsfView>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaUsageReport;
