import React from 'react';
import { bluetoothCompatibilityResultsResponseInfo } from '../api/bluetoothCompatibility.api';
import { useAppNavigation, useAppRoute } from '../Controller';
import { useTranslation } from 'react-i18next';
import AvailabilityNoIcon from '../../content/svg/bluetooth/cross-icon.svg';
import AvailabilityYesIcon from '../../content/svg/bluetooth/check-success.svg';
import BluetoothIcon from '../../content/svg/bluetooth/bluetooth-icon.svg';
import { testID } from '../components/utils/testID';
import CsfListItem from '../components/CsfListItem';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

export interface BluetoothResultsParam {
  response: bluetoothCompatibilityResultsResponseInfo
  nickname: string
}

const MgaBluetoothResults: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'BluetoothResults'>();
  const { response, nickname } = route.params;
  const data = response.data;
  const modelName = nickname ? nickname : data.nickname;
  const bluetoothFeaturesList: string[] = t(
    'bluetoothCompatibility:bluetoothFeaturesList',
    {
      returnObjects: true,
    },
  );

  const id = testID('BluetoothResults');

  return (
    <MgaPage
      title={t('bluetoothCompatibility:bluetoothCompatibility')}
      focusedEdit>
      <MgaPageContent
        title={t('bluetoothCompatibility:bluetoothCompatibility')}>
        <CsfText variant="title3" testID={id('checkYourPhoneCompatibility')}>
          {t('bluetoothCompatibility:checkYourPhoneCompatibility')}
        </CsfText>
        <CsfView>
          <CsfRule />
          <CsfListItem
            ph={0}
            title={
              <CsfView>
                <CsfText variant="body2" testID={id('deviceDetails')}>
                  {data.serviceProvider +
                    ' ' +
                    data.manufacturer +
                    ' ' +
                    data.phoneModel}
                </CsfText>
                <CsfText variant="body2" testID={id('modelName')}>
                  {modelName}
                </CsfText>
                <CsfText variant="body2" testID={id('headUnit')}>
                  {data.headUnit}
                </CsfText>
              </CsfView>
            }
            action={<BluetoothIcon height={38} width={38} />}
            titleTextVariant="subheading"
          />
          <CsfRule />
          <CsfView mt={8} ml={16} mr={8}>
            <CsfText variant="heading2" testID={id('bluetoothFeatures')}>
              {t('bluetoothCompatibility:bluetoothFeatures')}
            </CsfText>

            {data.results.map((feature, index) => {
              const itemTestId = testID(id(`feature-${index}`));
              return (
                <CsfView key={feature.code} gap={4}>
                  <CsfView mt={8} flexDirection="row" justify="space-between">
                    <CsfText testID={itemTestId('feature')}>
                      {bluetoothFeaturesList[Number(feature.code)]}
                    </CsfText>
                    {feature.availability == 'yes' ? (
                      <AvailabilityYesIcon height={18} width={18} />
                    ) : feature.availability == 'no' ? (
                      <AvailabilityNoIcon height={18} width={18} />
                    ) : (
                      <CsfText testID={itemTestId('bluetoothCompatibility')}>
                        {' '}
                        {t('bluetoothCompatibility:nt')}
                      </CsfText>
                    )}
                  </CsfView>
                </CsfView>
              );
            })}
          </CsfView>
        </CsfView>
        <MgaButton
          trackingId="BluetoothPairingInstructions"
          title={t('bluetoothCompatibility:viewPairingInstructions')}
          variant="primary"
          onPress={() => {
            navigation.navigate('BluetoothPairingInfo');
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaBluetoothResults;
