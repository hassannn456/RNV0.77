import React, { useState } from 'react';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import {
  SpeedFence,
  speedFenceSaveAndSend,
} from '../features/alerts/speedAlert.api';
import { useTranslation } from 'react-i18next';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';

interface AllowedValues {
  exceedMinimumSeconds: string[]
  maxSpeedKph: string[]
  maxSpeedMph: string[]
}

const getAllowedValues: () => AllowedValues = () => {
  return {
    exceedMinimumSeconds: ['30', '60', '90', '120'],
    maxSpeedKph: Array.from({ length: (150 - 40) / 5 + 1 }, (_, i) =>
      String(i * 5 + 40),
    ),
    maxSpeedMph: Array.from({ length: 90 - 25 + 1 }, (_, i) => String(i + 25)),
  };
};

const getDefaultValues: (units: 'KPH' | 'MPH') => SpeedFence = units => {
  if (units == 'MPH') {
    return {
      name: '',
      active: true,
      exceedMinimumSeconds: '30',
      maxSpeedMph: '25',
    };
  } else {
    return {
      name: '',
      active: true,
      exceedMinimumSeconds: '30',
      maxSpeedKph: '40',
    };
  }
};

const MgaSpeedAlertSetting: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'SpeedAlertSetting'>();
  const navigation = useAppNavigation();
  const alerts = route.params.alerts;
  const index = route.params.index;
  const target = route.params.target ?? getDefaultValues(t('units:speedUnits'));
  const [isLoading, setIsLoading] = useState(false);
  const options = getAllowedValues();

  return (
    <MgaPage focusedEdit title={t('speedAlertLanding:title')}>
      <CsfView ph={16} pv={24}>
        <MgaForm
          initialValues={
            route.params.target ?? getDefaultValues(t('units:speedUnits'))
          }
          submitLabel={t('speedAlertSetting:labels.submit')}
          onCancel={() => navigation.pop()}
          cancelLabel={t('common:cancel')}
          trackingId="SpeedAlertSetting"
          fields={[
            {
              name: 'name',
              type: 'text',
              label: t('speedAlertSetting:labels.name'),
              componentProps: {
                maxLength: 20,
              },
              rules: {
                required: {
                  message: t('validation:required'),
                },
                alphanumericSpace: {
                  message: t('validation:alphanumericSpace'),
                },
                validate: {
                  // value is same as target.name, or doesn't match any alert names.
                  validator: (v: string) =>
                    v == target.name || alerts.every(alert => alert.name != v),
                },
              },
            },
            {
              name: target.maxSpeedMph ? 'maxSpeedMph' : 'maxSpeedKph',
              type: 'select',
              label: t('speedAlertSetting:labels.maxSpeed'),
              options: options?.[
                target.maxSpeedMph ? 'maxSpeedMph' : 'maxSpeedKph'
              ].map(option => ({
                label: t(
                  target.maxSpeedMph
                    ? 'speedAlertSetting:values.maxSpeedMph'
                    : 'speedAlertSetting:values.maxSpeedKph',
                  {
                    speed: option,
                  },
                ),
                value: option,
              })),
            },
            {
              name: 'exceedMinimumSeconds',
              type: 'select',
              label: t('speedAlertSetting:labels.exceedMinimumSeconds'),
              options: options.exceedMinimumSeconds.map(option => ({
                label: t('speedAlertSetting:values.exceedMinimumSeconds', {
                  seconds: option,
                }),
                value: option,
              })),
            },
          ]}
          isLoading={isLoading}
          onSubmit={async values => {
            setIsLoading(true);
            const response = await speedFenceSaveAndSend(alerts, index, {
              ...values,
              active: true,
            });
            if (response.success) {
              popIfTop(navigation, 'SpeedAlertSetting');
            }
            setIsLoading(false);
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaSpeedAlertSetting;
