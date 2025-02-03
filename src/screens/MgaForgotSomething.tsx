import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { MgaFormItemProps } from '../components';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaForgotSomething: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'forgotSomething',
      options: [
        {
          label: t('forgotSomething:forgotUsername'),
          value: 'forgotUsername',
        },
        {
          label: t('forgotSomething:forgotPassword'),
          value: 'forgotPassword',
        },
        {
          label: t('forgotSomething:notSureAccount'),
          value: 'notSureAccount',
        },
      ],
      value: 'forgotUsername',
      type: 'radio',
    },
  ];

  return (
    <MgaPage title={t('forgotSomething:howCanWeHelp')} focusedEdit>
      <MgaPageContent>
        <MgaForm
          trackingId="forgotSomething"
          submitLabel={t('common:next')}
          scrollEnabled={false}
          fields={fieldsToRender}
          onSubmit={(data: { forgotSomething: string }) => {
            const value = data?.forgotSomething;
            if (value == 'forgotUsername' || value == 'notSureAccount') {
              navigation.push('ForgotUsername', { titleKey: value });
            }
            if (value == 'forgotPassword') {
              navigation.push('ForgotPassword');
            }
          }}
          onCancel={() => navigation.pop()}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotSomething;
