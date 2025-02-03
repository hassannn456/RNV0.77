//cSpell:ignore pois
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfCard from '../components/CsfCard';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaTripNotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  const id = testID('TripNotFound');

  return (
    <MgaPage title={t('tripSearch:tripNotFoundTitle')} showVehicleInfoBar>
      <MgaPageContent title={t('tripPlan:tripNotFoundTitle')}>
        <CsfCard gap={16} testID="TripNotFound">
          <CsfView align="center">
            <CsfAppIcon icon="WarningAttentionFill" size="xl" />
          </CsfView>

          <CsfText
            align="center"
            variant="body2"
            testID={id('tripNotFoundDescription')}>
            {t('tripPlan:tripNotFoundDescription')}
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

export default MgaTripNotFound;
