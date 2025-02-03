import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  useMaintenanceScheduleQuery,
  useChangePlanSeverityMutation,
  maintenanceScheduleApi,
} from '../api/maintenanceSchedule.api';
import { MaintenanceSchedule } from '../../@types';
import { gen1Plus, gen2Plus, has, subSafetyPlus } from '../features/menu/rules';
import { store } from '../store';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import { CsfAccordionSectionProps } from '../components';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import promptAlert from '../components/CsfAlert';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfDetail from '../components/CsfDetail';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfRule from '../components/CsfRule';
import { CsfRuleList } from '../components/CsfRuleList';
import { CsfSegmentedButton } from '../components/CsfSegmentedButton';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

const MaintenanceScheduleAccordion: React.FC<
  CsfAccordionSectionProps & {
    info: MaintenanceSchedule
    isCurrentInterval?: boolean
    trackingId: string
  }
> = ({ info, isCurrentInterval, ...props }) => {
  const { t } = useTranslation();
  const derivedId = testID(props.trackingId || props.testID);
  return (
    <MgaAccordionSection
      title={info.serviceDescription}
      renderBody={() => (
        <CsfView p={16} gap={12} testID={derivedId()}>
          {isCurrentInterval && (
            <CsfText
              variant="subheading"
              testID={derivedId('recommendedMaintenance')}>
              {t('serviceReminder:recommendedMaintenance')}
            </CsfText>
          )}
          <CsfBulletedList testID={derivedId('list')}>
            {info.recommendedMaintenance.map((recommendation, i) => (
              <CsfText key={i} testID={derivedId(`recommendation-${i}`)}>
                {recommendation}
              </CsfText>
            ))}
          </CsfBulletedList>
        </CsfView>
      )}
      {...props}
    />
  );
};

const MgaMaintenanceSchedule: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const maintenanceSchedule = useMaintenanceScheduleQuery(vParams);
  const maintenanceScheduleList =
    maintenanceSchedule.data?.data?.maintenaceScheduleList;
  const isServiceDue = maintenanceSchedule?.data?.data?.isServiceDue;
  const normalSchedulesList =
    maintenanceSchedule.data?.data?.normalScheduleList?.filter(
      normalSchedule => !normalSchedule.editService,
    );
  const severeSchedulesList =
    maintenanceSchedule.data?.data?.severeScheduleList?.filter(
      severeSchedule => !severeSchedule.editService,
    );
  const currentScheduleType =
    maintenanceSchedule.data?.data?.currentScheduleType;
  const schedule =
    currentScheduleType == 'S' ? severeSchedulesList : normalSchedulesList;
  const scheduleType: string | null =
    currentScheduleType == 'S'
      ? t('maintenanceSchedule:severe')
      : t('maintenanceSchedule:normal');
  const scheduleTypeText =
    currentScheduleType == 'S'
      ? t('maintenanceSchedule:currentScheduleTypeSevereDescription')
      : t('maintenanceSchedule:currentScheduleTypeNormalDescription');
  const [tab, setTab] = useState(scheduleType);
  const [requestSeverity, _] = useChangePlanSeverityMutation();
  const editSeverity = maintenanceSchedule.data?.data?.editSeverity;
  const apiNextServiceError =
    maintenanceSchedule.data?.data?.apiNextServiceError;
  const isDealerCareConnect =
    maintenanceSchedule.data?.data?.isDealerCareConnect;

  const showNormalSevereTabs =
    (!maintenanceScheduleList ||
      maintenanceScheduleList[0]?.editService ||
      !isServiceDue) &&
    ((normalSchedulesList && normalSchedulesList?.length > 1) ||
      (severeSchedulesList && severeSchedulesList?.length > 1));

  const changePlanSeverity = async (data: { scheduleType: string }) => {
    try {
      const successResponse = await requestSeverity(data).unwrap();
      if (successResponse?.success) {
        const apiCode = successResponse.data;
        if (apiCode == 0) {
          CsfSimpleAlert(
            t('common:success'),
            t('maintenanceSchedule:apiSuccess'),
            { type: 'success' },
          );
          setTab(
            data.scheduleType == 'S'
              ? t('maintenanceSchedule:severe')
              : t('maintenanceSchedule:normal'),
          );
          await store
            .dispatch(
              maintenanceScheduleApi.endpoints.maintenanceSchedule.initiate(
                vParams,
              ),
            )
            .unwrap();
        } else if (apiCode == 1) {
          CsfSimpleAlert(
            t('common:failed'),
            t('maintenanceSchedule:apiError1'),
            { type: 'error' },
          );
        } else if (apiCode == 2) {
          CsfSimpleAlert(
            t('common:failed'),
            t('maintenanceSchedule:apiError2'),
            { type: 'error' },
          );
        } else {
          CsfSimpleAlert(t('common:failed'), t('message:validationMessage'), {
            type: 'error',
          });
        }
      } else {
        CsfSimpleAlert(t('common:error'), t('message:apiTimeoutMessage'), {
          type: 'error',
        });
      }
    } catch (error) {
      CsfSimpleAlert(
        t('services:maintenanceScheduleError'),
        t('services:errorFetchingMaintenanceSchedules'),
        { type: 'error' },
      );
    }
  };

  const id = testID('MaintenanceSchedule');
  return (
    <MgaPage title={t('common:maintenanceSchedule')} showVehicleInfoBar>
      <MgaPageContent
        title={t('common:service')}
        isLoading={maintenanceSchedule.isFetching}>
        {schedule == null || schedule?.length == 0 ? (
          <CsfText testID={id('serviceError')}>
            {apiNextServiceError
              ? t('maintenanceSchedule:apiNextServiceError')
              : t('maintenanceSchedule:contactRetailer')}
          </CsfText>
        ) : apiNextServiceError ? (
          <CsfText testID={id('contactRetailer')}>
            {apiNextServiceError == 'apiNextServiceUnavailable'
              ? t('maintenanceSchedule:contactRetailer')
              : t('maintenanceSchedule:apiNextServiceError')}
          </CsfText>
        ) : (
          <>
            <CsfText testID={id('maintenanceInterval')}>
              {t('maintenanceSchedule:maintenanceInterval')}
            </CsfText>
            <CsfCard
              p={0}
              title={t('maintenanceSchedule:nextService')}
              action={
                <>
                  {(has('cap:g0', vehicle) ||
                    has([gen1Plus, 'sub:NONE'], vehicle)) && (
                      <CsfInfoButton
                        title={t('serviceReminder:title')}
                        text={t(
                          'maintenanceSchedule:maintenanceIntervalNotSubscribed',
                        )}
                        testID={id('maintenanceIntervalNotSubscribed')}
                      />
                    )}
                  {has(['cap:g1', subSafetyPlus], vehicle) && (
                    <CsfInfoButton
                      title={t('serviceReminder:title')}
                      text={t('maintenanceSchedule:maintenanceIntervalGen1')}
                      testID={id('maintenanceIntervalGen1')}
                    />
                  )}
                  {has([gen2Plus, subSafetyPlus], vehicle) && (
                    <CsfInfoButton
                      title={t('serviceReminder:title')}
                      text={t(
                        'maintenanceSchedule:maintenanceIntervalGen2Gen3',
                      )}
                      testID={id('maintenanceIntervalGen2Gen3')}
                    />
                  )}
                </>
              }>
              <CsfRule />

              {schedule && !schedule[0].editService && (
                <MaintenanceScheduleAccordion
                  trackingId={'MaintenanceScheduleEditAccordion'}
                  isCurrentInterval={true}
                  info={schedule[0]}
                  key={0}
                />
              )}
            </CsfCard>
            {showNormalSevereTabs && (
              <CsfCard
                title={t('common:maintenanceSchedule')}
                action={
                  <CsfInfoButton
                    title={t('common:maintenanceSchedule')}
                    text={scheduleTypeText}
                    testID={id('maintenanceSchedule')}
                  />
                }
                p={0}>
                <CsfView>
                  <CsfView ph={16} gap={24}>
                    <CsfDetail
                      label={t(
                        'maintenanceSchedule:currentMaintenanceSchedule',
                      )}
                      testID={id('currentMaintenanceSchedule')}
                      value={
                        isDealerCareConnect &&
                        editSeverity && (
                          <MgaButton
                            trackingId="MaintenanceScheduleChangeTypeButton"
                            variant="inlineLink"
                            title={scheduleType}
                            onPress={async () => {
                              const title = t(
                                'maintenanceSchedule:maintenanceType',
                              );
                              const message: string =
                                currentScheduleType == 'S'
                                  ? t('maintenanceSchedule:modalChangeToNormal')
                                  : t('maintenanceSchedule:modalChangeToSevere');
                              const yes: string = t('common:confirm');
                              const no: string = t('common:cancel');
                              const changeToType =
                                currentScheduleType == 'S' ? 'N' : 'S';
                              const response = await promptAlert(
                                title,
                                message,
                                [
                                  { title: yes, type: 'primary' },
                                  { title: no, type: 'secondary' },
                                ],
                              );
                              if (response == yes) {
                                await changePlanSeverity({
                                  scheduleType: changeToType,
                                });
                              }
                            }}
                          />
                        )
                      }
                    />

                    <CsfSegmentedButton
                      options={[
                        {
                          label: t('maintenanceSchedule:normal'),
                          value: 'Normal',
                        },
                        {
                          label: t('maintenanceSchedule:severe'),
                          value: 'Severe',
                        },
                      ]}
                      value={tab}
                      onChange={setTab}
                    />
                  </CsfView>

                  {tab == 'Normal' && (
                    //TODO:NN:012624 Accordion add view more link button
                    <CsfRuleList testID={id('listNormal')}>
                      {normalSchedulesList &&
                        normalSchedulesList
                          .slice(1)
                          .map((normalSchedule, i) => (
                            <MaintenanceScheduleAccordion
                              trackingId={`MaintenanceScheduleNormalAccordion-${i}`}
                              info={normalSchedule}
                              key={i}
                            />
                          ))}
                    </CsfRuleList>
                  )}
                  {tab == 'Severe' && (
                    <CsfRuleList testID={id('listSevere')}>
                      {severeSchedulesList &&
                        severeSchedulesList
                          .slice(1)
                          .map((severeSchedule, i) => (
                            <MaintenanceScheduleAccordion
                              trackingId={`MaintenanceScheduleSevereAccordion=${i}`}
                              info={severeSchedule}
                              key={i}
                            />
                          ))}
                    </CsfRuleList>
                  )}
                </CsfView>
              </CsfCard>
            )}
          </>
        )}

        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaMaintenanceSchedule;
