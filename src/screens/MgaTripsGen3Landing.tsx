import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { canAccessScreen } from '../utils/menu';
import {
  useRetrieveTripsQuery,
  // useGetExpirationDateQuery,
} from '../api/drivingJournal.api';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useVehicleValetStatusQuery } from '../api/vehicle.api';
import { formatFullDate } from '../utils/dates';
import { useAppSelector } from '../store';
import { alertNotInDemo, canDemo } from '../features/demo/demo.slice';
import { testID } from '../components/utils/testID';
import { has } from '../features/menu/rules';
import CsfCard from '../components/CsfCard';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaHeroPage from '../components/MgaHeroPage';

const MgaTripsGen3Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const isDemo = useAppSelector(s => s.demo);
  const vParams = { vin: vehicle?.vin ?? '' };
  // const {
  //   isError,
  //   isLoading,
  //   data: tripExpirationDateData,
  // } = useGetExpirationDateQuery(vParams)
  const trips = useRetrieveTripsQuery(vParams)?.data?.data ?? [];
  const now = new Date().toISOString();
  const currentTrip = trips.find(
    trip => trip.tripStartDate <= now && now <= trip.tripStopDate,
  );
  // const [currentTripExpirationDate, setCurrentTripExpirationDate] =
  //   useState<Date | null>(null)
  const valetActive = useVehicleValetStatusQuery(vParams).data?.data == 'VAL_ON';

  const id = testID('TripsLandingGen3');
  return (
    <MgaHeroPage
      theme="dark"
      showVehicleInfoBar={true}

      heroSource={require('../../content/img/trip-tracker-bg.png')}
      title={t('tripLog:myTrips')}>
      <CsfView ph={8} pv={16} testID="TripsLandingGen3">
        <CsfView gap={4} pv={8}>
          <CsfText
            align="center"
            variant="subheading"
            color="copySecondary"
            testID={id('welcome')}>
            {t('tripLog:welcome')}
          </CsfText>
          <CsfText
            align="center"
            color="light"
            variant="title2"
            testID={id('myTrips')}>
            {t('tripLog:myTrips')}
          </CsfText>
        </CsfView>
        <CsfView pv={16}>
          <CsfText align="center" color="light" testID={id('tripTrackerText')}>
            {t('tripLog:tripTrackerText')}
          </CsfText>
        </CsfView>

        <CsfView standardSpacing gap={8}>
          {canAccessScreen('TripsLanding') && (
            <MgaButton
              trackingId="TripsPlanATrip"
              title={t('tripLog:planATripCTA')}
              onPress={() => navigation.push('TripsLanding')}
            />
          )}

          {!currentTrip &&
            !valetActive &&
            has('flg:mga.remote.tripTracker') && (
              <MgaButton
                trackingId="TripsTripTracker"
                title={t('tripLog:tripTracker')}
                onPress={() => navigation.push('TripTrackingLanding')}
              />
            )}

          {currentTrip && has('flg:mga.remote.tripTracker') && (
            <CsfView theme="light">
              <CsfCard>
                <CsfView flexDirection="row" justify="space-between">
                  <CsfView>
                    <CsfText variant="heading" testID={id('tripTracker')}>
                      {t('tripLog:tripTracker')}
                    </CsfText>
                    <CsfText
                      variant="body2"
                      testID={id('tripDate')}
                      color="copySecondary">{`${formatFullDate(
                        currentTrip.tripStartDate,
                      )} - ${formatFullDate(currentTrip.tripStopDate)}`}</CsfText>
                  </CsfView>
                  <MgaButton
                    trackingId="TripsTripTrackerStatusButton"
                    title={
                      valetActive
                        ? t('tripLog:tripPaused')
                        : t('tripLog:viewCurrentTrip')
                    }
                    icon={valetActive ? 'Pause' : undefined}
                    iconPosition={'start'}
                    onPress={() => navigation.push('TripTrackingLanding')}
                  />
                </CsfView>
              </CsfCard>
            </CsfView>
          )}

          <MgaButton
            trackingId="TripsPlanATripButton"
            title={t('tripLog:planATripCTA')}
            onPress={() =>
              !isDemo || canDemo('TripsLanding')
                ? navigation.push('TripsLanding')
                : alertNotInDemo()
            }
            variant="secondary"
          />
        </CsfView>
      </CsfView>
    </MgaHeroPage>
  );
};

export default MgaTripsGen3Landing;
