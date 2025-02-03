/* eslint-disable react/no-unstable-nested-components */
// cSpell:ignore autoloop
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnits } from '../utils/units';
import { useAppNavigation, useAppRoute } from '../Controller';
import { vehicleApi } from '../api/vehicle.api';
import { store } from '../store';
import i18n from '../i18n';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfPressable from '../components/CsfPressable';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';

/** Submit mileage to backend. Displays an alert after request. */
export const submitMileage: (mileage: number) => Promise<boolean> = async (
  mileage: number,
) => {
  const request = vehicleApi.endpoints.updateApiMileage.initiate({ mileage });
  const response = await store.dispatch(request).unwrap();
  const { t } = i18n;
  if (response.success) {
    await promptAlert(
      t('common:success'),
      t('mileageUpdate:mileageUpdated'),
      [],
      { type: 'success' },
    );
  } else {
    switch (response.errorCode) {
      case '1':
        await promptAlert(
          t('common:error'),
          t('mileageUpdate:autoloopUpdateError1'),
        );
        break;
      case '2':
        await promptAlert(
          t('common:error'),
          t('mileageUpdate:autoloopUpdateError2'),
        );
        break;
      default:
        await promptAlert(
          t('common:error'),
          t('mileageUpdate:mileageUpdatedError'),
        );
        break;
    }
  }
  return response.success;
};

export const MgaAcceptMileage: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'AcceptMileage'>();
  const { t } = useTranslation();
  const units: string = t('units:distance');
  const screen = route.params?.screen;
  const vehicleMileage = route.params?.vehicleMileage;
  const thatsNotMyMileage = () => {
    navigation.replace('EnterNewMileage', { vehicleMileage, screen });
  };
  const exit = () => {
    if (screen) {
      navigation.replace(screen);
    } else {
      navigation.pop();
    }
  };
  useEffect(() => {
    navigation.setOptions({
      presentation: 'modal',
      headerRight: () => (
        <CsfPressable onPress={exit}>
          <CsfAppIcon icon="Close" />
        </CsfPressable>
      ),
    });
  });

  const id = testID('AcceptMileage');
  return (
    <MgaPage title={t('mileageUpdate:timeToUpdateYourMileage')}>
      <CsfView edgeInsets standardSpacing>
        <CsfText align="center" testID={id('updateYourMileage')}>
          {t('mileageUpdate:updateYourMileage')}
        </CsfText>
        <CsfText align="center" testID={id('weEstimateYourMileage')}>
          {t('mileageUpdate:weEstimateYourMileage')}
        </CsfText>
        <CsfText
          align="center"
          variant="display2"
          testID={id('vehicleMileage')}>
          {vehicleMileage
            ? convertUnits(vehicleMileage, 'mi', units).toLocaleString() +
            ' ' +
            units
            : '--'}
        </CsfText>
        {vehicleMileage ? (
          <CsfView standardSpacing>
            <MgaButton
              trackingId="MileageNotMyMileageButton"
              title={t('mileageUpdate:thatsNotMyMileage')}
              variant="link"
              onPress={thatsNotMyMileage}
            />
            <MgaButton
              trackingId="MileageAcceptMileageButton"
              variant="primary"
              title={t('mileageUpdate:acceptMileage')}
              onPress={async () => {
                const ok = await submitMileage(vehicleMileage);
                if (ok) exit();
              }}
            />
            <MgaButton
              trackingId="MileageCancelButton"
              variant="secondary"
              title={t('common:cancel')}
              onPress={exit}
            />
          </CsfView>
        ) : (
          <CsfView standardSpacing>
            <MgaButton
              title={t('mileageUpdate:thatsNotMyMileage')}
              trackingId="MileageNotMyMileageButton"
              variant="primary"
              onPress={thatsNotMyMileage}
            />
            <MgaButton
              trackingId="MileageCancelButton"
              variant="secondary"
              title={t('common:cancel')}
              onPress={exit}
            />
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  );
};
