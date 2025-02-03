//cSpell:ignore pois
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useAppNavigation } from '../Controller';
import { tripsApi } from '../api/trips.api';
import { store } from '../store';
import { testID } from '../components/utils/testID';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfCard from '../components/CsfCard';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaTripsLanding: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const vParams = { vin: vehicle?.vin ?? '' };

  useEffect(() => {
    store
      .dispatch(tripsApi.endpoints.retrieveFavoritePOIs.initiate(vParams))
      .unwrap()
      .catch(console.error);
  }, []);

  const id = testID('TripsLanding');

  return (
    <MgaPage title={t('tripSearch:trips')} showVehicleInfoBar>
      <MgaPageContent title={t('tripPlan:landingTitle')}>
        <CsfCard gap={16} testID="TripsLanding">
          <CsfView align="center">
            <CsfAppIcon icon="TripPlanFill" size="xl" />
          </CsfView>

          <CsfText align="center" variant="body2" testID={id('intro1')}>
            {t('tripPlan:intro1')}
          </CsfText>

          <CsfText align="center" variant="body2" testID={id('intro2')}>
            {t('tripPlan:intro2')}
          </CsfText>
        </CsfCard>

        <CsfView gap={12}>
          <MgaButton
            trackingId="TripsDestinationSearchButton"
            variant="primary"
            title={t('tripPlan:findDestinations')}
            onPress={() => {
              navigation.push('TripsDestinationSearch', {});
            }}
          />
          <MgaButton
            trackingId="TripsDestinationFavoritesButton"
            variant="secondary"
            title={t('tripPlan:favoriteDestinations')}
            onPress={() => {
              navigation.push('FavoriteDestinations');
            }}
          />
          <MgaButton
            trackingId="TripsSavedTripsButton"
            variant="secondary"
            title={t('tripPlan:savedTrips')}
            onPress={() => {
              navigation.push('SavedTrips');
            }}
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaTripsLanding;
