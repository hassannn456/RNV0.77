/* eslint-disable no-void */
/* eslint-disable eqeqeq */
// cSpell:ignore AUTOLOOP, SCHED, Xtime

import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  getCurrentVehicle,
  useCurrentVehicle,
} from '../../features/auth/sessionSlice';
import { has } from '../../features/menu/rules';
import { navigate, navigationRef, useAppNavigation } from '../../Controller';
import { store } from '../../store';
import { schedulerApi, useAppointmentByVinQuery } from '../../api/schedule.api';
import { formatFullDateTime } from '../../utils/dates';
import {
  CsfLandingMenuList,
  CsfLandingMenuListItem,
} from '../../components/CsfListItemLanding';
import { MgaRetailerEmbed, RetailerScheduleService } from '../../components/MgaRetailerComponents';
import { testID } from '../../components/utils/testID';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfTile from '../../components/CsfTile';
import MgaAddress, { getServiceAddressFromDealer } from '../../components/MgaAddress';
import CsfListItem from '../../components/CsfListItem';
import { CsfListItemActions } from '../../components/CsfListItemActions';
import { CsfLinkToMapApp } from '../../components/CsfMapLink';
import mgaOpenURL from '../../components/utils/linking';
import promptAlert from '../../components/CsfAlert';

/** There are a few different screens loaded depending on vehicle and current dealer. */
export const pushSchedulerScreen = (): void => {
  const vehicle = getCurrentVehicle();
  const dealer = vehicle?.preferredDealer;
  if (has('reg:HI', vehicle)) {
    navigate('RetailerHawaii');
  } else if (dealer == null) {
    const zip = vehicle?.customer.zip;
    navigate('RetailerSearch', { zip: zip });
  } else {
    const enableXtime = store.getState().session?.enableXtime;
    const appSchedule = dealer.flags.some(
      item =>
        (item.dealerFlagCode == 'SCHED' || item.dealerFlagCode == 'SCHEDULE') &&
        (item.dealerFlagSubCode == 'AUTOLOOP' ||
          (item.dealerFlagSubCode == 'XTIME' && enableXtime)),
    );
    if (appSchedule) {
      const routes = navigationRef.getState().routes;
      const parentPage = routes[routes.length - 1].name;
      navigate('ChooseService', { parentPage });
    } else {
      const phone = dealer.servicePhoneNumber
        ? dealer.servicePhoneNumber
        : dealer.phoneNumber;
      mgaOpenURL(`tel:${phone}`).then().catch(console.error);
    }
  }
};

const MgaScheduler: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { data, isFetching, refetch } = useAppointmentByVinQuery({
    vin: vehicle?.vin,
  });

  const id = testID('Scheduler');
  return (
    <MgaPage title={t('common:service')} showVehicleInfoBar>
      <MgaPageContent isLoading={isFetching} title={t('common:service')}>
        <CsfLandingMenuList>
          <CsfLandingMenuListItem
            onPress={() => navigation.push('MaintenanceSchedule')}
            title={t('scheduler:viewMaintenanceSchedule')}
            testID={id('viewMaintenanceSchedule')}
          />

          <CsfLandingMenuListItem
            onPress={() => navigation.push('ServiceHistory')}
            title={t('scheduler:viewServiceHistory')}
            testID={id('viewServiceHistory')}
          />

          <CsfLandingMenuListItem
            onPress={() => navigation.push('AddHistory')}
            title={t('scheduler:recordAService')}
            testID={id('recordAService')}
          />
        </CsfLandingMenuList>

        <RetailerScheduleService
          vehicle={vehicle}
          dealer={vehicle?.preferredDealer}
        />
        {data?.data && data?.data.length > 0 && (
          <CsfTile p={0}>
            {data?.data.map((appointment, i) => {
              const serviceAddress = getServiceAddressFromDealer(
                appointment.dealerInfo,
              );
              const itemTestId = testID(`appointment-${i}`);
              return (
                <>
                  <CsfListItem
                    key={appointment.loopAppointmentId}
                    title={`${formatFullDateTime(
                      appointment.appointmentDateTimeLocal,
                    )}`}
                    testID={itemTestId()}
                    subtitle={
                      serviceAddress && (
                        <MgaAddress
                          textVariant="body2"
                          title={appointment.dealerInfo.name}
                          {...serviceAddress}
                        />
                      )
                    }
                    action={
                      <CsfListItemActions
                        trackingId={`AppointmentActions-${i}`}
                        title={appointment.dealerInfo.name}
                        options={[
                          {
                            label: t('common:getDirectionsLink'),
                            icon: 'TripTracker',
                            value: 'Get Directions',
                            variant: 'link',
                            handleSelect: () => {
                              const dealerLocation: {
                                latitude: number
                                longitude: number
                              } | null = (() => {
                                if (!appointment.dealerInfo) return null;
                                if (
                                  appointment.dealerInfo.serviceLatDeg &&
                                  appointment.dealerInfo.serviceLongDeg
                                ) {
                                  return {
                                    latitude:
                                      appointment.dealerInfo.serviceLatDeg,
                                    longitude:
                                      appointment.dealerInfo.serviceLongDeg,
                                  };
                                } else if (
                                  appointment.dealerInfo.latDeg &&
                                  appointment.dealerInfo.longDeg
                                ) {
                                  return {
                                    latitude: appointment.dealerInfo.latDeg,
                                    longitude: appointment.dealerInfo.longDeg,
                                  };
                                } else {
                                  return null;
                                }
                              })();
                              CsfLinkToMapApp(
                                dealerLocation,
                                null,
                                appointment.dealerInfo?.name,
                              );
                            },
                          },
                          {
                            label: t('scheduler:callService'),
                            icon: 'Phone',
                            value: 'Call Service',
                            variant: 'link',
                            handleSelect: async () => {
                              const serviceNumber = appointment?.dealerInfo
                                ?.servicePhoneNumber
                                ? appointment?.dealerInfo?.servicePhoneNumber
                                : appointment?.dealerInfo?.phoneNumber;
                              await mgaOpenURL(`tel:${serviceNumber}`);
                            },
                          },
                          {
                            label: t('common:cancel'),
                            icon: 'Cancel',
                            value: 'Cancel',
                            variant: 'link',
                            handleSelect: async () => {
                              const title: string = t(
                                'scheduler:cancelDialogTitle',
                              );
                              const message: string = t(
                                'scheduler:wantToCancelAppointment',
                              );
                              const yes: string = t('common:yes');
                              const no: string = t('common:no');
                              const confirmation = await promptAlert(
                                title,
                                message,
                                [
                                  { title: yes, type: 'primary' },
                                  { title: no, type: 'secondary' },
                                ],
                              );
                              if (confirmation != yes) return;
                              const request =
                                schedulerApi.endpoints.cancelAppointment.initiate(
                                  {
                                    requestJson: JSON.stringify({
                                      ...appointment,
                                      appointmentDateTimeLocalDisplayFormat:
                                        undefined,
                                      dealerInfo: undefined,
                                    }),
                                  },
                                );
                              const response = await store
                                .dispatch(request)
                                .unwrap();
                              if (response.success) {
                                void promptAlert(
                                  t(
                                    'scheduler:appointmentCancelledDialogTitle',
                                  ),
                                  t('scheduler:appointmentHasBeenCancelled'),
                                  [],
                                  { type: 'success' },
                                );
                                void refetch();
                              } else {
                                void promptAlert(
                                  t('common:error'),
                                  response.data?.message ??
                                  t('scheduler:unableToCancelAppointment'),
                                );
                              }
                            },
                          },
                        ]}
                      />
                    }
                  />
                </>
              );
            })}
          </CsfTile>
        )}
        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaScheduler;
