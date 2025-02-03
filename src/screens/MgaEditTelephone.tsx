import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { MgaFormItemProps } from '../components';
import { formatPhone } from '../utils/phone';
import { validPhone } from '../utils/phone';
import { Keyboard } from 'react-native';
import { testID } from '../components/utils/testID';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';

export interface UpdateTelephoneParams {
  cellularPhone: string
  homePhone: string
  workPhone: string
  mfaRequired?: boolean
}

const MgaEditTelephone: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'EditTelephone'>();
  const routeData: UpdateTelephoneParams = route.params?.data;
  const noData =
    routeData?.cellularPhone?.length === 0 &&
    routeData?.homePhone?.length === 0 &&
    routeData?.workPhone?.length === 0;

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'cellularPhone',
      label: t('common:mobilePhone'),
      type: 'phone',
      rules: {
        required: {
          message: t('validation:required'),
        },
        phone: {
          message: t('validation:phone'),
        },
      },
    },
    {
      name: 'homePhone',
      label: t('myProfile:homePhone'),
      type: 'phone',
      rules: {
        validate: {
          validator: v => !v || validPhone(v),
          message: t('validation:phone'),
        },
      },
    },
    {
      name: 'workPhone',
      label: t('myProfile:workPhone'),
      type: 'phone',
      rules: {
        validate: {
          validator: v => !v || validPhone(v),
          message: t('validation:phone'),
        },
      },
    },
  ];
  const id = testID('editTelephone');
  return (
    <MgaPage title={t('myProfile:updateMobilePhone')} focusedEdit>
      <CsfView ph={16} pv={24} testID={id('container')}>
        <MgaForm
          initialValues={routeData}
          trackingId={'editTelephone'}
          testID={id('editForm')}
          submitLabel={t('common:save')}
          fields={fieldsToRender}
          scrollEnabled={false}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          onSubmit={(data: UpdateTelephoneParams) => {
            let mfaRequired = false;
            if (
              (routeData?.cellularPhone &&
                routeData?.cellularPhone.length != 0 &&
                formatPhone(routeData?.cellularPhone) !==
                formatPhone(data?.cellularPhone)) ||
              noData
            ) {
              mfaRequired = true;
            }
            const updateTelephone = {
              ...data,
              mfaRequired,
            };
            const route = mfaRequired ? 'SaveTelephoneWithMfa' : 'SaveTelephone';
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }
            setTimeout(() => {
              navigation.push(route, { data: updateTelephone });
            });
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaEditTelephone;
