/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { testID } from '../components/utils/testID';
import { MgaFormItemProps } from '../components';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';

export interface UpdateEmailParams {
  email: string
  emailConfirm: string
}

export const MgaEditEmailAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'EditEmailAddress'>();
  const emailAddress: string = route.params?.email || '';


  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'notice',
      component: () => (
        <CsfAlertBar flat title={t('myProfile:changeUsernameAlert')} />
      ),
    },
    {
      name: 'email',
      label: t('myProfile:emailAddress'),
      type: 'email',
      rules: {
        required: {
          message: t('validation:required'),
        },
        userEmail: {
          message: t('validation:email'),
        },
      },
    },
    {
      name: 'emailConfirm',
      label: t('myProfile:confirmEmailAddress'),
      type: 'email',
      rules: {
        required: {
          message: t('validation:required'),
        },
        equalsField: {
          message: t('validation:equalTo', {
            label: t('myProfile:emailAddress'),
          }),
          value: 'email',
        },
      },
    },
  ];

  const id = testID('editEmailAddress');
  return (
    <MgaPage title={t('myProfile:editEmail')} focusedEdit>
      <CsfView ph={16} pv={24} testID={id('container')}>
        <MgaForm
          initialValues={{ email: emailAddress, emailConfirm: '' }}
          trackingId={'editEmailAddress'}
          testID={id('editForm')}
          submitLabel={t('common:save')}
          fields={fieldsToRender}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          onSubmit={(data: UpdateEmailParams) => {
            if (emailAddress != data.email) {
              navigation.push('SaveEmail', { data });
            } else {
              CsfSimpleAlert(
                t('myProfile:editEmail'),
                t('myProfile:emailExists'),
                { type: 'error' },
              );
            }
          }}
        />
      </CsfView>
    </MgaPage>
  );
};
