import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ScreenList, useAppNavigation, useAppRoute } from '../../Controller';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { usePreferredDealerQuery } from '../../api/account.api';
import { schedulerApi } from '../../api/schedule.api';
import { store } from '../../store';

import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import MgaDealerInfo from './MgaDealerInfo';
import CsfView from '../../components/CsfView';
import MgaAppointmentInfo from './MgaAppointmentInfo';
import MgaButton from '../../components/MgaButton';
import promptAlert from '../../components/CsfAlert';
import mgaOpenURL from '../../components/utils/linking';
import CsfText from '../../components/CsfText';

const MgaScheduleSummary: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ScheduleSummary'>();
  const vehicle = useCurrentVehicle();
  const dealerResponse = usePreferredDealerQuery({ vin: vehicle?.vin ?? '' });
  const [isConfirming, setConfirming] = useState(false);
  const preferredDealer = dealerResponse.data?.data?.preferredDealer;
  const phoneNumber = preferredDealer?.servicePhoneNumber
    ? preferredDealer?.servicePhoneNumber
    : preferredDealer?.phoneNumber;
  const callURL = phoneNumber ? 'tel://' + phoneNumber : '';

  const id = testID('ScheduleSummary');
  return (
    <MgaPage showVehicleInfoBar title={t('common:service')}>
      <MgaPageContent title={t('scheduleSummary:reviewDetails')}>
        <MgaDealerInfo dealer={preferredDealer} />
        {route.params.appointmentDateLocal && (
          <CsfView standardSpacing>
            <MgaAppointmentInfo {...route.params} />
            <MgaButton
              trackingId="ScheduleServiceConfirmAppointmentButton"
              isLoading={isConfirming}
              title={t('scheduleSummary:confirmAppointment')}
              onPress={async () => {
                if (isConfirming) return;
                setConfirming(true);
                const request =
                  schedulerApi.endpoints.confirmAppointment.initiate(
                    route.params,
                  );
                const response = await store.dispatch(request).unwrap();
                if (response.success && response.data) {
                  navigation.push('ScheduleConfirm', {
                    ...route.params,
                    appointment: response.data,
                  });
                } else {
                  const call: string = t('common:error');
                  const cancel: string = t('common:cancel');
                  const answer = await promptAlert(
                    t('common:error'),
                    t('scheduler:technicalIssues'),
                    callURL
                      ? [
                        {
                          title: call,
                          type: 'primary',
                        },
                        { title: cancel, type: 'secondary' },
                      ]
                      : [],
                  );
                  if (answer == call) {
                    void mgaOpenURL(callURL);
                  }
                }
                setConfirming(false);
              }}
            />
            <CsfText align="center" testID={id('rentalsAvailable')}>
              {t('scheduleSummary:rentalsAvailable')}
            </CsfText>
            <CsfText align="center" testID={id('appointmentConfirmation')}>
              {t('scheduleSummary:appointmentConfirmation')}
            </CsfText>
            <CsfText align="center" testID={id('giveUsACall')}>
              {t('scheduleSummary:giveUsACall')}
            </CsfText>
            {callURL && (
              <MgaButton
                trackingId="ScheduleServiceCallButton"
                onPress={() => mgaOpenURL(callURL)}
                title={t('common:call')}
              />
            )}
            {route.params.parentPage && (
              <MgaButton
                trackingId="ScheduleServiceCancelButton"
                title={t('common:cancel')}
                variant="secondary"
                onPress={() =>
                  navigation.navigate(
                    route.params.parentPage as keyof ScreenList,
                  )
                }
              />
            )}
          </CsfView>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaScheduleSummary;
