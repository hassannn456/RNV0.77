import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppRoute } from '../Controller';
import {
  GeneratedUsageReport,
  useUsageReportEventUserListQuery,
} from '../api/usage.api';
import {
  getRequestMethod,
  getStatusIcon,
  getSubmitDateStrings,
  mapUsageReportCommandToRemoteCommand,
} from './MgaUsageReport';
import { sxmErrorMessage } from '../features/remoteService/sxmError';
import { TeleServiceUsageIngest } from '../../@types';
import i18n from '../i18n';
import { mpsToRegionalSpeed } from '../utils/conversion';
import { testID } from '../components/utils/testID';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

export type UsageReportLineItem = TeleServiceUsageIngest & {
  command: keyof GeneratedUsageReport
}

export const getStatusText = (
  status: TeleServiceUsageIngest['status'],
): string | null => {
  const { t } = i18n;
  switch (status) {
    case 'Successful':
      return t('usageReport:successful');
    case 'cancelled':
      return t('usageReport:cancelled');
    case 'Failed':
      return t('usageReport:unsuccessful');
    default:
      return null;
  }
};

const renderCommandStatus = (line: UsageReportLineItem) => {
  const serviceType = line.serviceType?.toUpperCase();
  /* cSpell:disable */
  switch (serviceType) {
    case 'RDL':
      return `usageReport:commands.${serviceType}`;
    case 'RDU': {
      const serviceName = line?.serviceName?.toUpperCase();
      switch (serviceName) {
        case 'TAILGATE_DOOR_CMD':
          return 'command:unlockTailgate.name';
        default:
          return `usageReport:commands.${serviceType}`;
      }
    }
    case 'REON':
    case 'REOFF':
      return `usageReport:commands.${serviceType}`;
    case 'HBLFSTOP':
    case 'HBLF': {
      const serviceName = line.serviceName?.toUpperCase();
      switch (serviceName) {
        case 'HORN AND LIGHTS':
          return 'command:hornLights.name';
        case 'LIGHTS ONLY':
          return 'command:lightsOnly.name';
        default:
          return 'usageReport:commands.HBLF';
      }
    }
    case 'RPW':
    case 'RVM':
    case 'RVI':
    case 'SAS':
    case 'SPEED':
    case 'SVT':
      return `usageReport:commands.${serviceType}`;
    case 'SAN':
    case 'TA':
    case 'ALARM NOTIFICATION':
      return 'usageReport:commands.SAN';
    case 'VAL': {
      const serviceMessage = line.serviceMessageName?.toUpperCase();
      switch (serviceMessage) {
        case 'VALONNOTIFICATION':
        case 'VALONRESPONSE':
        case 'VALONREQUEST':
          return 'usageReport:commands.VALON';
        case 'VALOFFNOTIFICATION':
        case 'VALOFFRESPONSE':
        case 'VALOFFREQUEST':
          return 'usageReport:commands.VALOFF';
        case 'VALSETTINGSRESPONSE':
        case 'VALSETTINGSREQUEST':
          return 'usageReport:commands.VALSETTINGS';
        case 'VALVIOLATIONNOTIFICATION':
          return 'usageReport:commands.VALVIOLATION';
        case 'VALRESETPINRESPONSE':
        case 'VALRESETPINREQUEST':
          return 'usageReport:commands.VALRESETPIN';
        default:
          return 'usageReport:commands.DEFAULT';
      }
    }
    case 'TLD':
      return line.activateTripLog
        ? 'usageReport:commands.TLD_A'
        : 'usageReport:commands.TLD_D';
    case 'CURFEW':
    case 'VHS':
    case 'GEO':
    case 'RBC':
    case 'ECALL':
    case 'BCALL':
      return `usageReport:commands.${serviceType}`;
    default:
      return 'usageReport:commands.DEFAULT';
  }
  /* cSpell:enable */
};

const MgaUsageReportDetail: React.FC = () => {
  const route = useAppRoute<'UsageReportDetail'>();
  const { t } = useTranslation();
  const line = route.params;
  const usageReportUser = useUsageReportEventUserListQuery(
    undefined,
  )?.data?.data?.find(status => status.userId === line.userIdAlt);
  const remoteCommand = mapUsageReportCommandToRemoteCommand(line.command, line);
  const command = t(renderCommandStatus(line));
  const [date, time] = getSubmitDateStrings(line);
  const failureReason =
    line?.failureReason && line?.failureDescription
      ? line.failureReason == 'NegativeAcknowledge'
        ? `${line.failureReason}:${line.failureDescription}`
        : `${line.failureReason}`
      : line.failureReason;

  const isSpeedViolation =
    line.serviceMessageName?.toUpperCase() === 'VALVIOLATIONNOTIFICATION';

  const id = testID('UsageReportDetail');

  return (
    <MgaPage title={command} focusedEdit>
      <CsfView edgeInsets standardSpacing testID={id()}>
        {/* Command */}
        <CsfView gap={4}>
          <CsfText testID={id('commandSent')}>
            {t('usageReport:commandSent')}
          </CsfText>
          <CsfText testID={id('command')}>{command}</CsfText>
          <CsfRule orientation="horizontal" />
        </CsfView>
        {/* Status */}
        <CsfView gap={4}>
          <CsfText testID={id('status')}>{t('usageReport:status')}</CsfText>
          <CsfView align="flex-start" flexDirection="row">
            {!isSpeedViolation && (
              <CsfView pr={8}>{getStatusIcon(line.status)}</CsfView>
            )}
            <CsfView gap={4} width={'90%'} style={{ flexShrink: 1 }}>
              {isSpeedViolation ? (
                <CsfText testID={id('speedExceeded')}>
                  {t('usageReport:speedExceeded', {
                    speed: mpsToRegionalSpeed(parseInt(line.maxSpeed), 'MPH'),
                  })}
                </CsfText>
              ) : (
                <CsfText testID={id('status')}>
                  {getStatusText(line.status)}
                </CsfText>
              )}
              {line.status == 'Failed' && (
                <CsfText testID={id('failedStatus')}>
                  {sxmErrorMessage(
                    failureReason,
                    line.failureDescription,
                    remoteCommand,
                  )}
                </CsfText>
              )}
            </CsfView>
          </CsfView>
          <CsfRule orientation="horizontal" />
        </CsfView>
        {/* Request Method */}
        <CsfView gap={4}>
          <CsfText testID={id('requestMethod')}>
            {t('usageReport:requestMethod')}
          </CsfText>
          <CsfText testID={id('line')}>{getRequestMethod(line)}</CsfText>
          {usageReportUser && (
            <CsfText testID={id('userType')}>
              {usageReportUser.userType}
            </CsfText>
          )}
          <CsfRule orientation="horizontal" />
        </CsfView>
        {/* Submit Date */}
        <CsfView gap={4}>
          <CsfText testID={id('submitDate')}>
            {t('usageReport:submitDate')}
          </CsfText>
          <CsfView>
            <CsfText testID={id('date')}>{date}</CsfText>
            <CsfText color="copySecondary" testID={id('time')}>
              {time}
            </CsfText>
          </CsfView>
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

export default MgaUsageReportDetail;
