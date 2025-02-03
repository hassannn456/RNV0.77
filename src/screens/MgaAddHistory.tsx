import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceHistory } from '../../@types';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { useMaintenanceScheduleIntervalsQuery } from '../api/maintenanceSchedule.api';
import { CsfDropdownItem } from '../components/CsfSelect';
import { serviceHistoryApi } from '../api/serviceHistory.api';
import { store } from '../store';
import { MgaServiceHistoryItem } from './MgaServiceHistory';
import { CsfFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import MgaButton from '../components/MgaButton';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';

export interface MgaAddHistoryState {
  isEditing: boolean
  record: Partial<ServiceHistory>
}

const MgaAddHistory: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'AddHistory'>();
  const { data } = useMaintenanceScheduleIntervalsQuery(undefined);

  const isInsert =
    !!route?.params?.vehicleOwnerServiceId ||
    route?.params?.vehicleOwnerServiceId === undefined;

  const isEditHistory = !!route?.params?.mileage;
  const isDealer = route?.params?.serviceType != 'USER_ENTERED_SERVICE';

  const required: Record<string, string> = {
    message: t('common:required'),
  };

  // Backend removes "used" intervals, re-adding selected item here
  const maintenanceScheduleIntervals: CsfDropdownItem[] = (data?.data ?? [])
    .concat(route?.params?.maintenanceInterval)
    .sort((a, b) => a - b)
    .filter(v => !!v)
    .map(value => ({ label: String(value), value: String(value) }));

  const fields: CsfFormItemProps[] = [
    {
      name: 'preview',
      componentProps: { editing: true },
      component: MgaServiceHistoryItem,
      meta: 'edit|dealer',
    },
    {
      name: 'serviceProvider',
      type: 'text',
      label: t('addHistory:serviceProvider'),
      componentProps: {
        maxLength: 100,
      },
      rules: {
        required,
        alphanumericSpace: {
          message: t('validation:alphanumericSpace'),
        },
      },
      meta: 'add',
    },
    {
      name: 'maintenanceInterval',
      type: 'select',
      options: maintenanceScheduleIntervals,
      label: t('serviceHistory:serviceInterval'),
      rules: {
        required,
      },
      meta: 'add',
    },
    {
      name: 'serviceDate',
      type: 'date',
      componentProps: { inputType: 'date', maximumDate: new Date() },
      label: t('addHistory:dateOfService'),
      rules: {
        required,
      },
      meta: 'add',
    },
    {
      name: 'mileage',
      type: 'numeric',
      label: t('units:odometer'),
      rules: { required },
      meta: 'edit|add',
    },
    {
      name: 'vehicleNotes',
      type: 'text',
      label: t('common:notes'),
      rules: {
        required,
        alphanumericSpace: {
          message: t('validation:alphanumericSpace'),
        },
      },
      meta: 'add',
    },
    {
      name: 'comments',
      type: 'text',
      label: t('serviceHistory:comments'),
      meta: 'edit|dealer',
    },
  ];

  const getFields: () => CsfFormItemProps[] = () => {
    const newFields: CsfFormItemProps[] = fields.filter(
      (item: CsfFormItemProps) => {
        if (
          (!maintenanceScheduleIntervals ||
            maintenanceScheduleIntervals?.length === 0) &&
          item.name === 'maintenanceInterval'
        ) {
          return false;
        }
        if (isDealer && !isInsert && item.meta?.includes('edit')) {
          return item.meta?.includes('dealer');
        } else if (!isInsert && item.meta?.includes('edit')) {
          return item;
        }
        if (isInsert) return item.meta?.includes('add');
      },
    );

    return newFields;
  };

  // Make sure the editor shows the correct date
  // by adding 12 hours to the service date
  const serviceDate = route?.params?.serviceDate
    ? new Date(route?.params.serviceDate)
    : undefined;
  if (serviceDate !== undefined) {
    serviceDate.setHours(serviceDate.getHours() + 12);
  }

  return (
    <MgaPage
      title={
        route?.params
          ? t('serviceLanding:enterService')
          : t('serviceHistory:addServiceHistory')
      }
      focusedEdit>
      <MgaPageContent>
        <MgaForm
          trackingId="enterServiceHistory"
          initialValues={{
            preview: route?.params,
            vehicleId: route?.params?.vehicleId || '',
            vehicleOwnerServiceId: route?.params?.vehicleOwnerServiceId || '',
            ownerRepairServiceId: route?.params?.ownerRepairServiceId || '',
            serviceProvider: route?.params?.serviceProvider || '',
            serviceHeaderKey: route?.params?.serviceHeaderKey || '',
            serviceType: route?.params?.serviceType || '',
            maintenanceInterval: route?.params?.maintenanceInterval || '',
            mileage: route?.params?.mileage || '',
            serviceDate: serviceDate,
            vehicleNotes:
              (route?.params?.notes &&
                route.params.notes[0]?.replace('+', ' ')) ||
              '',
            comments: route?.params?.comments || '',
          }}
          fields={getFields()}
          onSubmit={async data => {
            const newData: ServiceHistory = { ...(data as ServiceHistory) };
            if (newData.serviceDate !== undefined) {
              const date = new Date(newData.serviceDate);
              const newDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0,
                0,
                0,
              );
              newData.serviceDate = newDate.getTime();
            }
            const call = (
              !isEditHistory
                ? serviceHistoryApi.endpoints.addServiceEntry
                : isDealer
                  ? serviceHistoryApi.endpoints.updateServiceDealer
                  : serviceHistoryApi.endpoints.updateServiceUser
            ).initiate(newData);

            const response = await store.dispatch(call).unwrap();

            if (response.success) {
              successNotice({
                title: t('common:success'),
                subtitle: !isEditHistory
                  ? t('services:serviceEntryAdded')
                  : t('services:serviceEntryUpdated'),
              });
              navigation.navigate('ServiceHistory');
            } else {
              // TODO:AG:20230807: Need requirements. Cordova app has no error handler.
            }
          }}
          onCancel={() => navigation.pop()}
        />
        {route.params && !isDealer && (
          <MgaButton
            trackingId="AddHistoryRemove"
            variant="link"
            title={t('common:remove')}
            onPress={async () => {
              const title = t('common:remove');
              const message: string = t('services:verifyRemoval');
              const yes: string = t('common:delete');
              const no: string = t('common:cancel');
              const response = await promptAlert(title, message, [
                { title: yes, type: 'primary' },
                { title: no, type: 'secondary' },
              ]);
              if (response == yes) {
                const routeValues = { ...route.params };
                if (!route?.params?.maintenanceInterval) {
                  delete routeValues.maintenanceInterval;
                }
                const response = await store
                  .dispatch(
                    serviceHistoryApi.endpoints.removeService.initiate(
                      routeValues as ServiceHistory,
                    ),
                  )
                  .unwrap();
                if (response.success) {
                  await promptAlert(
                    t('common:success'),
                    t('services:serviceEntryRemoved'),
                    [{ title: t('common:continue'), type: 'primary' }],
                    { type: 'success' },
                  );
                  popIfTop(navigation, 'AddHistory');
                } else {
                  // TODO:AG:20230807: Need requirements. Cordova app has no error handler.
                }
              }
            }}
          />
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAddHistory;
