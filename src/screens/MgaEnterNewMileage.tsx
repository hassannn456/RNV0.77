/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { submitMileage } from './MgaAcceptMileage';
import { reDigits } from '../utils/validate';
import { testID } from '../components/utils/testID';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfPressable from '../components/CsfPressable';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';

const MgaEnterNewMileage: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'AcceptMileage'>();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const screen = route.params?.screen;
  const vehicleMileage = route.params?.vehicleMileage;
  const id = testID('EnterNewMileage');

  const exit = () => {
    if (screen) {
      navigation.replace(screen);
    } else {
      popIfTop(navigation, 'EnterNewMileage');
    }
  };
  useEffect(() => {
    navigation.setOptions({
      presentation: 'modal',
      headerRight: () => (
        <CsfPressable
          onPress={exit}
          testID={id('close')}
          accessibilityLabel={t('common:close')}>
          <CsfAppIcon icon="Close" />
        </CsfPressable>
      ),
    });
  });

  return (
    <MgaPage title={t('mileageUpdate:timeToUpdateYourMileage')}>
      <CsfView edgeInsets standardSpacing>
        <CsfText align="center" testID={id('updateYourMileage')}>
          {t('mileageUpdate:updateYourMileage')}
        </CsfText>
        <MgaForm
          isLoading={isLoading}
          trackingId="changeMileageUpdateForm"
          fields={[
            {
              name: 'enterYourMileage',
              type: 'numeric',
              label: t('mileageUpdate:enterYourMileage'),
              editable: true,

              rules: {
                required: {
                  message: t('validation:required'),
                },
                regex: {
                  message: t('validation:digits'),
                  value: reDigits,
                },
              },
            },
            {
              name: 'confirmYourMileage',
              type: 'numeric',
              label: t('mileageUpdate:confirmYourMileage'),
              editable: true,

              rules: {
                required: {
                  message: t('validation:required'),
                },
                regex: {
                  message: t('validation:digits'),
                  value: reDigits,
                },
                equalsField: {
                  message: t('validation:equalTo', {
                    label: t('mileageUpdate:enterYourMileage'),
                  }),
                  value: 'enterYourMileage',
                },
              },
            },
          ]}
          initialValues={{
            enterYourMileage: vehicleMileage?.toString(),
            confirmYourMileage: '',
          }}
          onSubmit={async (data: { enterYourMileage?: string }) => {
            setLoading(true);
            const ok = await submitMileage(parseInt(data?.enterYourMileage));
            setLoading(false);
            if (ok) { exit(); }
          }}
          onCancel={exit}
          submitLabel={'common:update'}
        />
        <CsfText align="center" testID={id('updatingThisMileageText')}>
          {t('mileageUpdate:updatingThisMileageText')}
        </CsfText>
      </CsfView>
    </MgaPage>
  );
};

export default MgaEnterNewMileage;
