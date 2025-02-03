import React from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useTradeUpEventQuery } from '../api/tradeUp.api';
import { testID } from '../components/utils/testID';
import CsfText from '../components/CsfText';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

/** TODO:UA:20230915: Trade-Up Advantage */
const MgaTradeUpAdvantage: React.FC = () => {
  const { t } = useTranslation();
  const tradeUpInfo = useTradeUpEventQuery(undefined)?.data?.data;
  const vehicle = useCurrentVehicle();
  const tradeUpQuoteUrl: string = tradeUpInfo?.resourceUrl
    ? tradeUpInfo.resourceUrl
    : t('messageCenterLanding:tradeUpUrlPage', {
      url: vehicle?.preferredDealer?.url,
    }) || '';

  const id = testID('TradeUpAdvantage');
  return (
    <MgaPage
      title={t('messageCenterLanding:tradeUpProgram')}
      showVehicleInfoBar>
      <MgaPageContent title={t('messageCenterLanding:tradeUpProgram')}>
        {
          /* TODO:NN:20231220 Analytics  */
          // var tradeUpInfo = json.data,
          // responseCodeMessage = '';
          // if(tradeUpInfo.responseCode == '0') {
          //   responseCodeMessage = 'Call Successful'
          // } else if(tradeUpInfo.responseCode == '1') {
          //   responseCodeMessage = 'AutoLoop Issue'
          // } else if(tradeUpInfo.responseCode == '2') {
          //   responseCodeMessage = 'Invalid Request'
          // } else if(tradeUpInfo.responseCode == '3') {
          //   responseCodeMessage = 'Insufficient Input'
          // }
          // $cdvHelper.adobe.trackEvents("eVar37:Response Code - " + tradeUpInfo.responseCode + ' | ' + responseCodeMessage); */
        }
        {tradeUpInfo && tradeUpInfo?.resourceUrl ? (
          <>
            <CsfText testID={id('tradeUpDescription')}>
              {t('messageCenterLanding:tradeUpDescription')}
            </CsfText>
            <MgaButton
              trackingId="TradeUpOfferButton"
              title={t('messageCenterLanding:tradeUpOfferBtn')}
              onPress={() => Linking.openURL(tradeUpQuoteUrl)}
              icon="OutboundLink"
              iconPosition="end"
            />
            <CsfText testID={id('tradeUpDisclaimer')}>
              {t('messageCenterLanding:tradeUpDisclaimer')}
            </CsfText>
          </>
        ) : (
          <>
            <CsfText testID={id('tradeUpNoQuoteDescription')}>
              {t('messageCenterLanding:tradeUpNoQuoteDescription')}
            </CsfText>
            <MgaButton
              trackingId="TradeUpLearnMoreButton"
              title={t('messageCenterLanding:tradeUpLearnMoreBtn')}
              onPress={() => Linking.openURL(tradeUpQuoteUrl)}
              icon="OutboundLink"
              iconPosition="end"
            />
          </>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaTradeUpAdvantage;
