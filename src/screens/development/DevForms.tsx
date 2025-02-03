import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {

  CsfInputControlTypes,
  CsfFormFieldList,
} from '../../components'
import { CsfFormValues } from '../../components/CsfForm/CsfForm'
import MgaPage from '../../components/MgaPage'
import CsfView from '../../components/CsfView'
import { CsfCheckBox } from '../../components/CsfCheckbox'
import MgaForm from '../../components/MgaForm'

export const DevForms: React.FC = () => {
  const { t } = useTranslation()
  const text: CsfInputControlTypes = 'text'
  const select: CsfInputControlTypes = 'select'
  const checkbox: CsfInputControlTypes = 'checkbox'
  const checkboxGroup: CsfInputControlTypes = 'checkboxGroup'
  const radio: CsfInputControlTypes = 'radio'

  const [isDisabled, setIsDisabled] = useState(false)

  const initialValues: CsfFormValues = {
    name: 'Iron Man',
    email: 'user@subaru.com',
    gender: 'male',
    profession: '',
    linkedIn: 'linkedIn',
    agree: false,
    skills: ['one'],
    password: '',
    passwordConfirmation: '',
  }

  const fieldsToRender: CsfFormFieldList = [
    {
      name: 'name',
      label: t('devForms:name'),
      type: text,
      hint: 'devForms:nameHint',
      placeholder: 'devForms:namePlaceholder',
      rules: {
        required: {
          message: t('validation:required'),
        },
        minLength: {
          value: 2,
          message: t('validation:minLength', { count: 2 }),
        },
        maxLength: {
          value: 9,
          message: t('validation:maxLength', { count: 9 }),
        },
      },
    },
    {
      name: 'multiline',
      label: 'devForms:multiline',
      type: text,
      componentProps: {
        multiline: true,
        maxLength: 500,
        showMaxLength: true,
      },
    },

    {
      name: 'email',
      label: 'common:email',
      type: text,
      value: 'user@subaru.com',
      rules: {
        email: {
          message: 'Email Party time',
        },
      },
    },

    {
      name: 'cheese',
      label: 'common:email',
      hint: '=== Cheese Whiz',
      type: text,
      value: '',
      rules: {
        anything: {
          validator: (v: string) => v === 'Cheese Whiz',
          message: 'Not Cheese Whiz',
        },
      },
    },
    {
      name: 'gender',
      label: 'devForms:gender',
      type: radio,
      options: [
        { label: 'devForms:genderMale', value: 'male' },
        { label: 'devForms:genderFemale', value: 'female' },
      ],
      value: 'female',
    },
    {
      name: 'profession',
      label: 'Profession',
      type: select,
      options: [
        { label: 'devForms:selectFrontend', value: 'frontEnd' },
        { label: 'devForms:selectBackend', value: 'backEnd' },
        { label: 'devForms:selectDevops', value: 'devops' },
      ],
      value: 'frontEnd',
      rules: {
        required: {
          message: 'validation:required',
        },
      },
    },
    {
      name: 'agree',
      type: checkbox,
      label: 'devForms:agree',
      value: false,
      rules: {
        required: {
          message: 'validation:required',
        },
      },
    },
    {
      name: 'agree',
      type: 'toggle',
      label: 'devForms:agree',
      value: false,
      rules: {
        required: {
          message: 'validation:required',
        },
      },
    },
    {
      name: 'skills',
      type: checkboxGroup,
      label: 'Skills',
      options: [
        {
          label: 'devForms:skillOne',
          value: 'one',
        },
        {
          label: 'devForms:skillTwo',
          value: 'two',
        },
      ],
    },

    {
      name: 'password',
      label: ' you gotta have a label',
      type: 'text',
      rules: {
        minLength: {
          value: 8,
          message: t('validation:minLength', { count: 8 }),
        },
      },
    },
    {
      name: 'passwordConfirmation',
      type: 'text',
      label: 'confirm',
      rules: {
        equalsField: {
          value: 'password',
          message: t('validation:equalTo', {
            label: 'Password',
          }),
        },
      },
    },
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone Number',
      rules: {
        phone: {
          message: t('validation:phone'),
        },
      },
    },
  ]

  return (
    <MgaPage title={t('internalDevelopment:forms')} trackingId={'dev-forms'}>
      <CsfView p={16} gap={24}>
        <CsfView flexDirection="row" justify="space-between">
          <CsfView flex={1}>
            <CsfCheckBox
              label="Disable Form"
              onChangeValue={() => setIsDisabled(!isDisabled)}
              checked={isDisabled}
            />
          </CsfView>
        </CsfView>

        <MgaForm
          title="Form with Optional Title"
          trackingId={'demoForm'}
          fields={fieldsToRender}
          initialValues={initialValues}
          onSubmit={data => console.log('FORM OK', data)}
          disabled={isDisabled}
          onCancel={() => console.log('CANCELLED THE FORM')}
        />
      </CsfView>
    </MgaPage>
  )
}
