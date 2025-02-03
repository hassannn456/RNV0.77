import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { useServiceHistoryQuery } from '../api/serviceHistory.api';
import { ServiceHistory } from '../../@types';
import { testID } from '../components/utils/testID';
import { formatFullDate } from '../utils/dates';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

export interface MgaServiceHistoryItemProps {
  value: ServiceHistory
  editing?: boolean
  testID?: string
}

export const MgaServiceHistoryItem = (
  props: MgaServiceHistoryItemProps,
): JSX.Element => {
  const { value: item, editing } = props;
  const { t } = useTranslation();
  const id = testID(props.testID);
  return (
    <CsfRuleList testID={id()}>
      <CsfDetail
        label={t('addHistory:serviceProvider')}
        value={item?.serviceProvider}
        testID={id('serviceProvider')}
      />
      {item?.maintenanceInterval && (
        <CsfDetail
          label={t('serviceHistory:serviceInterval')}
          value={item?.maintenanceInterval}
          testID={id('serviceInterval')}
        />
      )}
      <CsfDetail
        label={t('addHistory:dateOfService')}
        value={formatFullDate(item.serviceDate, { timeZone: 'UTC' })}
        testID={id('serviceDate')}
      />
      <CsfDetail label={t('common:mileage')} value={item?.mileage} />
      {item?.notes && item?.notes.length > 0 && (
        <CsfDetail
          stacked
          label={t('common:notes')}
          value={item?.notes?.join(', ')}
          testID={id('notes')}
        />
      )}
      {item?.comments && !editing && (
        <CsfDetail
          stacked
          label={t('serviceHistory:comments')}
          value={item?.comments}
          testID={id('comments')}
        />
      )}
    </CsfRuleList>
  );
};

const MgaServiceHistory: React.FC = () => {
  const { t } = useTranslation();
  const mileService: string = t('serviceHistory:mileService');
  const navigation = useAppNavigation();
  const { data, isLoading } = useServiceHistoryQuery(undefined);
  // const completed: string = t('common:completed') ?? 'completed'

  const id = testID('ServiceHistory');
  return (
    <MgaPage
      isLoading={isLoading}
      title={t('serviceLanding:serviceHistory')}
      showVehicleInfoBar>
      <MgaPageContent title={t('serviceLanding:serviceHistory')}>
        {data && data.errorCode == 'repairOrdersServiceError' && (
          <CsfText testID={id('repairOrderError')}>
            {t('serviceHistory:repairOrderErrorMessage')}
          </CsfText>
        )}

        <MgaButton
          trackingId="AddServiceHistoryButton"
          onPress={() => {
            navigation.push('AddHistory');
          }}
          testID={id('addServiceHistory')}
          title={t('serviceHistory:addServiceHistory')}
          icon="Edit"
        />

        {data && data.success && (
          <CsfAccordionList testID={id()}>
            <CsfView p={16} testID={id('noteContainer')}>
              <CsfText variant="caption" testID={id('noteDescription')}>
                {t('serviceHistory:noteDescription')}
              </CsfText>
            </CsfView>
            {data?.data?.map((item, i) => (
              <MgaAccordionSection
                trackingId={`ServiceHistoryAccordion-${i}`}
                title={`${item.mileage?.toLocaleString() || '??'
                  } ${mileService}`}
                subtitle={`${formatFullDate(item.serviceDate, {
                  timeZone: 'UTC',
                })}`}
                key={item.vehicleOwnerServiceId}
                renderBody={() => (
                  <CsfView
                    gap={16}
                    p={16}
                    testID={id(`serviceHistoryAccordion-${i}`)}>
                    <MgaServiceHistoryItem
                      value={item}
                      testID={id(`serviceHistoryItem-${i}`)}
                    />
                    <MgaButton
                      trackingId="EditServiceHistoryButton"
                      variant="secondary"
                      onPress={() => {
                        navigation.push('AddHistory', item);
                      }}
                      title={t('common:edit')}
                    />
                  </CsfView>
                )}
              />
            ))}
          </CsfAccordionList>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaServiceHistory;
