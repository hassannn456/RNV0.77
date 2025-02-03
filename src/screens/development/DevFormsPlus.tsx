import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CsfInputControlTypes,
  CsfFormFieldFunctionPayload,
} from '../../components';
import { CsfFormFieldGroup } from '../../components/CsfForm/CsfForm';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import MgaForm from '../../components/MgaForm';

const DevFormsPlus: React.FC = () => {
  const { t } = useTranslation();
  const text: CsfInputControlTypes = 'text';

  const initialValues = {
    name: 'Iron Man',
    agree: false,
    name2: '',
  };

  const fieldsToRender: (
    arg0: CsfFormFieldFunctionPayload,
  ) => CsfFormFieldGroup[] = () => [
    {
      fieldGroupTitle: 'group 1',
      fields: [
        {
          name: 'name',
          label: t('devForms:name'),
          type: text,
        },
      ],
    },
    {
      fieldGroupTitle: 'group 2',
      fields: [
        {
          name: 'name',
          label: t('devForms:name'),
          type: text,
        },
      ],
    },
  ];

  return (
    <MgaPage title={t('internalDevelopment:forms')} trackingId={'dev-forms'}>
      <MgaPageContent title="Field Groups">
        <MgaForm
          trackingId={'demoForm'}
          fields={fieldsToRender}
          initialValues={initialValues}
          onSubmit={data => console.log('FORM OK', data)}
          onCancel={() => console.log('RESET THE FORM')}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default DevFormsPlus;
