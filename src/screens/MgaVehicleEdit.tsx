import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppRoute } from '../Controller';
import { regions, Region } from '../utils/regions';
import { MgaPage } from '../components/MgaPage';
import { useAppNavigation } from '../Controller';
import {
  useIsSiebelProfileExistsQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useVehicleInfoQuery,
} from '../api/vehicle.api';
import { ClientSessionVehicle, VehicleInfoRequest } from '../../@types';
import {
  useStartupPropertiesQuery,
  useTimeZones,
} from '../features/admin/admin.api';
import { gen1Plus, gen2Plus, has } from '../features/menu/rules';
import { useRefreshVehiclesMutation } from '../api/account.api';
import { cNetworkError } from '../api';
import { testID } from '../components/utils/testID';
import { CsfFormItemProps } from '../components';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import MgaBadConnectionCard, { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaForm from '../components/MgaForm';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';
import mgaOpenURL from '../components/utils/linking';

const MgaVehicleEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'VehicleEdit'>();
  const vehicle: ClientSessionVehicle | undefined = route.params?.vehicle;
  const siebelResponse = useIsSiebelProfileExistsQuery(undefined);
  const action = route.params?.action;
  const [updateRequest, updateStatus] = useUpdateVehicleMutation();
  const [addRequest, addStatus] = useAddVehicleMutation();
  const [refreshVehicleRequest, vehicleStatus] = useRefreshVehiclesMutation();
  const request = action === 'add' ? addRequest : updateRequest;
  const status = action === 'add' ? addStatus : updateStatus;
  const regionsData: Region[] = regions();
  const startupProperties = useStartupPropertiesQuery(undefined);
  const timeZones = useTimeZones();
  const { refetch } = useVehicleInfoQuery({
    vin: route.params?.vehicle?.vin,
  });
  const isMileageEditAllowed =
    has('cap:g0', vehicle) ||
    has([gen1Plus, 'sub:NONE', 'car:Provisioned'], vehicle);
  const isConfirmMileageNotAllowed =
    vehicle?.authorizedVehicle || vehicle?.subscriptionStatus === 'ACTIVE';

  const initialValues = {
    nickname: vehicle?.nickname || '',
    mileageEstimate: vehicle?.vehicleMileage?.toString() || '',
    mileageCalculated: vehicle?.vehicleMileage?.toString() || '',
    vin: vehicle?.vin || '',
    licensePlate: vehicle?.licensePlate || '',
    licensePlateState: vehicle?.licensePlateState || '',
    vehicleKey: vehicle?.vehicleKey || '',
    timeZone: vehicle?.timeZone,
  };

  const getMileageFieldLabel = (): string => {
    if (has({ or: ['sub:NONE', 'cap:g0'] })) {
      return t('vehicleInformation:estimatedMileage');
    } else if (has(['cap:g1', { not: 'sub:NONE' }])) {
      return t('vehicleInformation:lastRecordedMileageLabel');
    } else if (has([gen2Plus, { not: 'sub:NONE' }])) {
      return t('vehicleInformation:currentMileage');
    }
    return t('vehicleInformation:currentMileage');
  };

  const required = {
    message: t('validation:required'),
  };

  const fields: CsfFormItemProps[] = [
    {
      name: 'nickname',
      label: t('vehicleInformation:nickname'),
      type: 'text',
      componentProps: {
        maxLength: 50,
      },
      rules: {
        required,
      },
    },
    {
      name: 'mileageEstimate',
      label: getMileageFieldLabel(),
      type: 'numeric',
      rules: {
        required,
      },

      componentProps: {
        editable: isMileageEditAllowed ? true : false,
      },
    },
    {
      name: 'confirmMileage',
      type: 'numeric',
      label: t('mileageUpdate:confirmYourMileage'),
      hint: t('mileageUpdate:updatingThisMileageText'),
      rules: isMileageEditAllowed
        ? {
          required,

          equalsField: {
            message: t('validation:equalTo', {
              label: getMileageFieldLabel(),
            }),
            value: 'mileageEstimate',
          },
        }
        : {},
    },
    {
      name: 'vin',
      label: t('common:vin'),
      type: 'text',
      rules: {
        vin: {
          message: t('validation:vin'),
        },
        minLength: {
          value: 17,
          message: t('validation:minLength', { count: 17 }),
        },
        required,
      },
      componentProps: {
        maxLength: 17,
      },
    },
    {
      name: 'licensePlate',
      type: 'text',
      label: t('vehicleInformation:licensePlate'),
      rules: {
        maxLength: {
          value: 15,
          message: t('validation:maxLength', { count: 15 }),
        },
        validate: {
          message: t('common:required'),
          validator: (v, d) => (d?.licensePlateState ? !!v : true),
        },
      },
      componentProps: {
        maxLength: 15,
      },
    },
    {
      name: 'licensePlateState',
      label: t('vehicleInformation:licensePlateState'),
      type: 'select',
      options: regionsData,
      rules: {
        validate: {
          message: t('common:required'),
          validator: (v, d) => (d?.licensePlate ? !!v : true),
        },
      },
    },
    {
      name: 'timeZone',
      label: t('vehicleInformation:timeZone'),
      rules: {
        required,
      },
      type: 'select',
      options: timeZones,
    },
    {
      name: 'firstName',
      label: t('common:firstName'),
      type: 'text',
      rules: {
        minLength: {
          value: 2,
          message: t('validation:minLength', { count: 2 }),
        },
      },
      componentProps: {
        maxLength: 20,
      },
      meta: 'siebel',
    },
    {
      name: 'lastName',
      label: t('common:lastName'),
      type: 'text',
      rules: {
        minLength: {
          value: 2,
          message: t('validation:minLength', { count: 2 }),
        },
      },
      componentProps: {
        maxLength: 20,
      },
      meta: 'siebel',
    },
    {
      name: 'address',
      label: t('common:address'),
      type: 'text',
      rules: {
        required,
      },
      componentProps: {
        maxLength: 50,
      },
      meta: 'siebel',
    },
    {
      name: 'city',
      label: t('common:city'),
      type: 'text',
      rules: {
        required,
      },
      componentProps: {
        maxLength: 30,
      },
      meta: 'siebel',
    },
    {
      name: 'state',
      label: t('geography:state'),
      type: 'select',
      options: regionsData,
      rules: {
        required,
      },
      meta: 'siebel',
    },
    {
      name: 'zip',
      label: t('geography:zipcode'),
      type: 'text',
      meta: 'siebel',
    },
  ];

  const submit = async (data: VehicleInfoRequest) => {
    const response = await request(data).unwrap();
    if (response.success) {
      refreshVehicleRequest(undefined)
        .then(() => {
          if (response.errorCode) {
            CsfSimpleAlert(
              t('common:alert'),
              t('manageVehicle:vehicleInfoUpdatedAL' + response.errorCode),
              { type: 'error' },
            );
          } else {
            successNotice({
              title: t('common:success'),
              subtitle: t('vehicleInformation:vehicleInfoUpdated'),
            });
          }
        })
        .catch(() => {
          CsfSimpleAlert(
            t('common:error'),
            t(`manageVehicle:${response.errorCode || 'unableCompleteRequest'}`),
            { type: 'error' },
          );
        });
      void refetch();
      popIfTop(navigation, 'VehicleEdit');
    } else if (response.errorCode == 'errorInvalidTSP') {
      const evMessage =
        Platform.OS == 'ios'
          ? {
            buttonTitle: 'manageVehicle:iosButtonTitle',
            buttonUrl: startupProperties?.data?.data?.evIosAppUrl,
          }
          : {
            buttonTitle: 'manageVehicle:androidButtonTitle',
            buttonUrl: startupProperties?.data?.data?.evAndroidAppUrl,
          };
      const appStoreLink = t(evMessage.buttonTitle);
      const appStoreUrl = evMessage.buttonUrl as string;
      const response = await promptAlert(
        t('common:notification'),
        t('manageVehicle:solterraVin'),
        [
          {
            title: appStoreLink,
            type: 'primary',
          },
          {
            title: t('common:cancel'),
            type: 'secondary',
          },
        ],
      );
      if (response == appStoreLink) {
        await mgaOpenURL(appStoreUrl);
        navigation.navigate('Dashboard');
      }
    } else if (response.errorCode == cNetworkError) {
      alertBadConnection();
    } else {
      CsfSimpleAlert(
        t('common:error'),
        t(`manageVehicle:${response.errorCode || 'unableCompleteRequest'}`),
        { type: 'error' },
      );
    }
  };

  const id = testID('VehicleEdit');
  return (
    <MgaPage
      title={vehicle?.nickname || t('manageVehicle:addNewVehicle')}
      isLoading={siebelResponse.isFetching || vehicleStatus.isLoading}
      focusedEdit>
      <MgaPageContent>
        {siebelResponse.isFetching ? (
          <CsfActivityIndicator />
        ) : siebelResponse.data?.errorCode == cNetworkError ? (
          <MgaBadConnectionCard
            onCancel={() => navigation.pop()}
            onRetry={() => siebelResponse.refetch()}
          />
        ) : (
          <MgaForm
            title={t('vehicleInformation:heading')}
            trackingId="tracking"
            testID={id()}
            initialValues={initialValues}
            fields={fields.filter(item => {
              // MGAS-88: Remove license plate in SCI
              if (!has('flg:mga.myVehicle.licensePlate')) {
                if (
                  item.name == 'licensePlate' ||
                  item.name == 'licensePlateState'
                ) {
                  return false;
                }
              }
              // MGA-1922: Remove fields based on vehicle CRM status
              if (action == 'edit' && item.name == 'vin') { return false; }
              if (
                action == 'add' &&
                (item.name == 'mileageEstimate' ||
                  item.name === 'confirmMileage')
              ) { return false; }
              if (
                item.name === 'confirmMileage' &&
                isConfirmMileageNotAllowed
              ) {
                return false;
              }
              if (item.meta == 'siebel' && siebelResponse.data?.data) { return false; }
              // All filters pass
              return true;
            })}
            onSubmit={submit}
            isLoading={status.isLoading || siebelResponse.isFetching}
            onCancel={() => navigation.pop()}
          />
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaVehicleEdit;
