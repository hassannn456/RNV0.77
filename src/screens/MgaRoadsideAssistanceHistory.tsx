import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  roadsideAssistanceApi,
  roadsideAssistanceHistoryInfo,
  useRoadsideAssistanceDetailQuery,
} from '../api/roadsideAssistance.api';
import { useAppRoute } from '../Controller';
import { store } from '../store';
import { formatFullDateTime } from '../utils/dates';
import { testID } from '../components/utils/testID';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaRoadsideAssistanceHistory: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'RoadsideAssistanceHistory'>();
  const historyQuery = useRoadsideAssistanceDetailQuery(route.params.rsaId);
  const { data: response } = historyQuery;
  const roadsideAssistanceInfoData: roadsideAssistanceHistoryInfo[] =
    response?.data || [];
  const [isRefreshing, setRefreshing] = useState(false);
  const id = testID('RoadsideAssistanceHistory');

  return (
    <MgaPage
      title={t('roadsideAssistance:roadsideAssistance')}
      showVehicleInfoBar>
      <MgaPageContent
        title={route.params.reason}
        isLoading={historyQuery.isLoading}>
        <CsfView gap={8} testID={id('detailsContainer')}>
          <CsfText variant="heading" testID={id('details')}>
            {t('roadsideAssistance:details')}
          </CsfText>
          <CsfRuleList testID={id('list')}>
            <CsfDetail
              label={t('common:vin')}
              value={route.params.vin}
              testID={id('vin')}
            />
            <CsfDetail
              label={t('roadsideAssistance:requestId')}
              value={route.params.rsaId}
              testID={id('requestId')}
            />
          </CsfRuleList>
        </CsfView>

        <CsfView testID={id('statusContainer')}>
          <CsfView gap={8} testID={id('statusInnerContainer')}>
            <CsfText variant="heading" testID={id('statusHistory')}>
              {t('roadsideAssistance:statusHistory')}
            </CsfText>

            <CsfRuleList testID={id('list')}>
              {roadsideAssistanceInfoData?.map((status, i) => (
                <CsfDetail
                  key={i}
                  testID={id(`status-${i}`)}
                  label={status.ageroStatus}
                  value={formatFullDateTime(status.timeSubmitted)}
                />
              ))}
            </CsfRuleList>
          </CsfView>
        </CsfView>
        <MgaButton
          trackingId="RoadsideAssistanceRefreshStatusButton"
          title={t('roadsideAssistance:refreshRequestStatus')}
          isLoading={isRefreshing}
          onPress={async () => {
            setRefreshing(true);
            await store
              .dispatch(
                roadsideAssistanceApi.endpoints.roadsideAssistanceDetail.initiate(
                  route.params.rsaId,
                ),
              )
              .unwrap();
            setRefreshing(false);
          }}
        />
        <CsfText testID={id('youWillReceiveCommunication')}>
          {t('roadsideAssistance:youWillReceiveCommunication')}
        </CsfText>
      </MgaPageContent>
    </MgaPage>
  );
};


export default MgaRoadsideAssistanceHistory;
