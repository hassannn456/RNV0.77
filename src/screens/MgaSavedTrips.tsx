// cSpell:ignore pois
import React from 'react';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useTranslation } from 'react-i18next';
import {
  useRetrieveAllTripsQuery,
  tripsApi,
  sendPOIToVehicle,
  RemoteSendPOIToVehicleRequest,
} from '../api/trips.api';
import { useAppNavigation } from '../Controller';
import { store } from '../store';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import { CsfListItemActions } from '../components/CsfListItemActions';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice, errorNotice } from '../components/notice';

export const MAX_TRIP_COUNT = 10;

const MgaSavedTrips: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const { refetch: refetchAllTrips, data: allTrips } =
    useRetrieveAllTripsQuery(vParams);

  const id = testID('SavedTrips');
  return (
    <MgaPage title={t('tripPlan:savedTrips')} showVehicleInfoBar>
      <MgaPageContent title={t('tripPlan:savedTrips')}>
        {allTrips?.data?.length === 10 && (
          <CsfText
            variant="body2"
            align="center"
            testID={id('maxTripsMessage')}>
            {t('tripPlan:maxTripsReachedMessage2')}
          </CsfText>
        )}
        <CsfView gap={12} testID={id()}>
          {allTrips?.data ? (
            <>
              {allTrips.data.length === 0 ? (
                <CsfTile>
                  <CsfView align="center" gap={12}>
                    <CsfAppIcon icon="TripPlanFill" size="xl" />
                    <CsfText align="center" testID={id('createSavedTrip')}>
                      {t('tripPlan:createSavedTrip')}
                    </CsfText>
                    <MgaButton
                      variant="primary"
                      title={t('tripPlan:findDestinations')}
                      trackingId="AllTripFindDestinations"
                      onPress={() => {
                        navigation.push('TripsDestinationSearch', {});
                      }}
                    />
                  </CsfView>
                </CsfTile>
              ) : (
                <>
                  <CsfTile p={0}>
                    <CsfRuleList testID={id('list')}>
                      {allTrips.data.map((trip, i) => {
                        return (
                          <CsfListItem
                            onPress={() =>
                              navigation.push('TripsDestinationSearch', {
                                trip,
                                mode: 'TRIP',
                              })
                            }
                            testID={id(`trip-${i}`)}
                            key={trip.tripId}
                            icon={<></>}
                            title={trip.name}
                            subtitle={t('tripPlan:destinationsCount', {
                              count: trip.pois.length,
                            })}
                            action={
                              <CsfListItemActions
                                trackingId={`SavedTripActions-${i}`}
                                title={trip.name}
                                options={[
                                  {
                                    label: t('tripPlan:sendTripToVehicle'),
                                    value: 'send',
                                    variant: 'primary',
                                    handleSelect: () => {
                                      const params: RemoteSendPOIToVehicleRequest =
                                      {
                                        pois: trip.pois.map(item => item.poi),
                                        pin: '',
                                        vin: '',
                                      };
                                      sendPOIToVehicle(params).catch(
                                        console.error,
                                      );
                                    },
                                  },
                                  {
                                    label: t('common:edit'),
                                    value: 'edit',
                                    variant: 'secondary',
                                    handleSelect: () =>
                                      navigation.push(
                                        'TripsDestinationSearch',
                                        {
                                          trip,
                                          mode: 'TRIP',
                                        },
                                      ),
                                  },
                                  {
                                    label: t('common:delete'),
                                    value: 'delete',
                                    variant: 'link',
                                    icon: 'Delete',
                                    handleSelect: async () => {
                                      const title = t('tripPlan:deleteTrip');
                                      const message: string = t(
                                        'tripPlan:wantDelete',
                                        {
                                          name: trip.name,
                                        },
                                      );
                                      const yes: string = t('common:delete');
                                      const no: string = t('common:cancel');
                                      const response = await promptAlert(
                                        title,
                                        message,
                                        [
                                          {
                                            title: yes,
                                            type: 'primary',
                                          },
                                          { title: no, type: 'secondary' },
                                        ],
                                      );
                                      if (response === yes) {
                                        await store
                                          .dispatch(
                                            tripsApi.endpoints.deleteTrip.initiate(
                                              { tripId: trip.tripId },
                                            ),
                                          )
                                          .unwrap()
                                          .then(_ => {
                                            successNotice({
                                              title: t('common:success'),
                                              subtitle: t(
                                                'tripPlan:deletedSuccessfully',
                                              ),
                                            });
                                          })
                                          .catch(e => {
                                            console.error(e);
                                            errorNotice({
                                              title: t('common:failed'),
                                              subtitle: t(
                                                'tripPlan:errorDeleting',
                                              ),
                                            });
                                          });
                                        await refetchAllTrips();
                                      }
                                    },
                                  },
                                ]}
                              />
                            }
                          />
                        );
                      })}
                    </CsfRuleList>
                  </CsfTile>
                  <CsfView flexDirection="column" gap={12}>
                    <MgaButton
                      variant="primary"
                      trackingId="SavedTripFindDestinations"
                      title={t('tripPlan:findDestinations')}
                      onPress={() => {
                        navigation.push('TripsDestinationSearch', {});
                      }}
                    />
                    <MgaButton
                      variant="link"
                      trackingId="SavedTripDeleteAll"
                      title={t('tripPlan:deleteAll')}
                      icon="Delete"
                      onPress={async () => {
                        const title = t('tripPlan:deleteAll');
                        const message: string = t('tripPlan:wantDeleteAllTrips');
                        const yes: string = t('common:delete');
                        const no: string = t('common:cancel');
                        const response = await promptAlert(title, message, [
                          {
                            title: yes,
                            type: 'primary',
                          },
                          { title: no, type: 'secondary' },
                        ]);
                        if (response === yes) {
                          await store
                            .dispatch(
                              tripsApi.endpoints.deleteAllTrips.initiate(
                                vParams,
                              ),
                            )
                            .unwrap()
                            .then(() => {
                              successNotice({
                                title: t('common:success'),
                                subtitle: t(
                                  'tripPlan:allTripsDeletedSuccessfully',
                                ),
                              });
                            })
                            .catch(e => {
                              console.error(e);
                              errorNotice({
                                title: t('common:failed'),
                                subtitle: t('tripPlan:errorDeleting'),
                              });
                            });
                          await refetchAllTrips();
                        }
                      }}
                    />
                  </CsfView>
                </>
              )}
            </>
          ) : null}
          <CsfText
            variant="body2"
            align="center"
            testID={id('maxTripsMessage')}>
            {t('tripPlan:maxTripsMessage', { count: MAX_TRIP_COUNT })}
          </CsfText>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaSavedTrips;
