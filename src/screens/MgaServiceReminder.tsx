import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMaintenanceScheduleQuery } from '../api/maintenanceSchedule.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { gen1Plus, gen2Plus, has, subSafetyPlus } from '../features/menu/rules';
import { testID } from '../components/utils/testID';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfCard from '../components/CsfCard';
import CsfInfoButton from '../components/CsfInfoButton';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

const MgaServiceReminder: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const maintenanceSchedule = useMaintenanceScheduleQuery(vParams);
  const schedule = maintenanceSchedule.data?.data?.maintenaceScheduleList;
  const isServiceDue = maintenanceSchedule?.data?.data?.isServiceDue;
  const id = testID('ServiceReminder');

  return (
    <MgaPage title={t('serviceReminder:title')}>
      <MgaPageContent
        title={t('serviceReminder:title')}
        isLoading={maintenanceSchedule.isLoading}>
        <CsfView testID={id()}>
          {!schedule || schedule[0]?.editService || !isServiceDue ? (
            <CsfText testID={id('noServiceReminders')}>
              {t('serviceReminder:noServiceReminders')}
            </CsfText>
          ) : (
            <>
              <CsfView gap={16} testID={id('mileageContainer')}>
                <CsfText testID={id('vehicleEstimatedMileagePart1')}>
                  {t('serviceReminder:vehicleEstimatedMileagePart1')}
                  <CsfView height={18} testID={id('intervalContainer')}>
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
                  </CsfView>
                </CsfText>

                <CsfText testID={id('vehicleEstimatedMileagePart2')}>
                  {t('serviceReminder:vehicleEstimatedMileagePart2')}
                </CsfText>
              </CsfView>
              {schedule && schedule.length > 0 && (
                <CsfView pt={16} testID={id('schedule')}>
                  <CsfCard testID={id('scheduleCard')}>
                    <MgaAccordionSection
                      trackingId="ServiceDescriptionAccordion"
                      title={schedule[0]?.serviceDescription}
                      renderBody={() => (
                        <CsfView p={16} gap={12} testID={id('scheduleCard')}>
                          <CsfText
                            variant="subheading"
                            testID={id('recommendedMaintenance')}>
                            {t('serviceReminder:recommendedMaintenance')}
                          </CsfText>
                          <CsfBulletedList testID={id('bulletList')}>
                            {schedule[0].recommendedMaintenance.map(
                              (recommendation, i) => (
                                <CsfText
                                  key={i}
                                  testID={id(`recommendation-${i}`)}>
                                  {recommendation}
                                </CsfText>
                              ),
                            )}
                          </CsfBulletedList>
                        </CsfView>
                      )}
                    />
                  </CsfCard>
                </CsfView>
              )}
            </>
          )}
        </CsfView>
        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaServiceReminder;
