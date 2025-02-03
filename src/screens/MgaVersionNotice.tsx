import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppHistoryItem } from '../../@types';
import { Platform } from 'react-native';
import { formatFullDate } from '../utils/dates';
import CsfListItem from '../components/CsfListItem';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

/** Modal to request choice from user. */
const MgaVersionNotice: React.FC = () => {
  const { t } = useTranslation();
  const history = t('appVersion:history', { returnObjects: true }) as
    | [AppHistoryItem]
    | undefined;

  const os = Platform.OS as 'ios' | 'android';
  // TODO:UA:20240920 think about whether we need additional filtering for vehicle/account rules
  // this would mean adding a rules property to the AppHistoryItem type and consuming it here.
  const platformMessage = (currentHistoryItem: AppHistoryItem) =>
    currentHistoryItem?.[`changes-${os}`] ||
    currentHistoryItem?.changes ||
    t('appVersion:alertMessageDefault', { version: currentHistoryItem.version });

  return (
    <MgaPage focusedEdit>
      <MgaPageContent title={t('appVersion:title')}>
        <CsfRuleList>
          {history?.map((historyItem, index) => (
            <CsfView key={index} pv={16}>
              <CsfListItem
                title={historyItem.version}
                subtitle={formatFullDate(historyItem.date)}
                ph={0}
                pv={8}
              />
              <CsfText>{platformMessage(historyItem)}</CsfText>
            </CsfView>
          ))}
        </CsfRuleList>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaVersionNotice;
