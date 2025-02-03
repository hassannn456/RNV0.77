import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { Image } from 'react-native';
import { testID } from '../components/utils/testID';
import { CsfDropdownItem } from '../components';
import CsfListItem from '../components/CsfListItem';
import CsfRule from '../components/CsfRule';
import CsfSelect from '../components/CsfSelect';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaBluetoothPairingInfo: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [starlinkNavigation, setStarlinkNavigation] = useState(
    'starlinkWithNavigation',
  );
  const starlinkNavigationOptions: CsfDropdownItem[] = [
    'starlinkWithNavigation',
    'starlinkWithoutNavigation',
  ].map(option => ({
    label: t(`bluetoothCompatibility:${option}`),
    value: option,
  }));

  interface BluetoothSteps {
    stepNo: string
    description: string
    imageName: string
    access?: string
  }

  const bluetoothConnectionSteps: BluetoothSteps[] = t(
    'bluetoothCompatibility:bluetoothConnectionSteps',
    {
      returnObjects: true,
    },
  );

  const visibleBluetoothConnectionSteps = bluetoothConnectionSteps.filter(
    step => !step.access || step.access == starlinkNavigation,
  );


  const imageUrls: number[] = [
    require('../../content/png/bluetooth/bluetooth-with-nav-step-1.png'),
    require('../../content/png/bluetooth/bluetooth-with-nav-step-2.png'),
    require('../../content/png/bluetooth/bluetooth-with-nav-step-3.png'),
    starlinkNavigation == 'starlinkWithNavigation'
      ? require('../../content/png/bluetooth/bluetooth-with-nav-step-4.png')
      : require('../../content/png/bluetooth/bluetooth-without-nav-step-4.png'),
    require('../../content/png/bluetooth/bluetooth-with-nav-step-5.png'),
    starlinkNavigation == 'starlinkWithNavigation'
      ? require('../../content/png/bluetooth/bluetooth-with-nav-step-6.png')
      : require('../../content/png/bluetooth/bluetooth-without-nav-step-6.png'),
  ];

  const id = testID('BluetoothPairingInfo');

  return (
    <MgaPage
      title={t('bluetoothCompatibility:tips&Information')}
      showVehicleInfoBar>
      <MgaPageContent title={t('bluetoothCompatibility:tips&Information')}>
        <CsfText variant="title3" testID={id('pairYourPhone')}>
          {t('bluetoothCompatibility:pairYourPhone')}
        </CsfText>
        <CsfView gap={4}>
          <CsfRule />
          <CsfText testID={id('followStepsToPair')}>
            {t('bluetoothCompatibility:followStepsToPair')}
          </CsfText>
          <CsfSelect
            label={t('bluetoothCompatibility:options')}
            value={starlinkNavigation}
            options={starlinkNavigationOptions}
            testID={id('options')}
            onSelect={value => {
              setStarlinkNavigation(value);
            }}
          />
        </CsfView>
        <CsfView gap={4}>
          <CsfRule />
          {visibleBluetoothConnectionSteps.map((data, i) => {
            const itemTestId = testID(id(`connectionStep-${i}`));
            return (
              <CsfView key={data.description}>
                <CsfListItem
                  testID={itemTestId('list')}
                  icon={
                    <Image
                      source={imageUrls[Number(data.stepNo) - 1]}
                      style={{ height: 50, width: 35 }}
                      resizeMode="contain"
                    />
                  }
                  title={
                    <CsfView flexDirection="row">
                      <CsfText
                        variant="subheading"
                        testID={itemTestId('stepNo')}>
                        {data.stepNo}
                        {'. '}
                      </CsfText>
                      <CsfText
                        variant="body2"
                        testID={itemTestId('description')}>
                        {data.description}
                      </CsfText>
                    </CsfView>
                  }
                />
                <CsfRule />
              </CsfView>
            );
          })}
        </CsfView>
        <MgaButton
          trackingId="BluetoothCompatibilityCheckDevice"
          title={t('bluetoothCompatibility:checkAnotherDevice')}
          variant="primary"
          onPress={() => {
            navigation.pop(2);
            navigation.replace('BluetoothCompatibility');
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaBluetoothPairingInfo;
