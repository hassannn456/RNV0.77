import React from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { isValidPostalCode } from '../utils/postalCode';
import { regions, Region } from '../utils/regions';
import {
  CustomerProfileResponse,
  EditAddressParameters,
  useUpdateAddressMutation,
} from '../features/profile/contact/contactApi';
import { checkStreetAddress } from '../utils/streetAddress';
import { tomTomFindByPostalCode } from '../features/geolocation/tomtom.api';
import { isCurrentVehicleRightToRepairByState } from '../features/menu/rules';
import { SessionData, useCurrentVehicle } from '../features/auth/sessionSlice';
import { useRefreshVehiclesMutation } from '../api/account.api';
import { testID } from '../components/utils/testID';
import { checkAlphabetSpace } from '../utils/validate';
import { cNetworkError } from '../api';
import { hasActiveStarlinkSubscription } from '../utils/vehicle';
import { ClientSessionVehicle, NormalResult } from '../../@types';
import { MgaFormItemProps, CsfAlertAction } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfView from '../components/CsfView';
import { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import { successNotice } from '../components/notice';

export interface UpdateAddressParams {
  address: string
  address2?: string
  city: string
  state: string
  zip5Digits: string
  countryCode: string
}

const MgaEditAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [refreshVehicleRequest, vehicleStatus] = useRefreshVehiclesMutation();
  const route = useAppRoute<'EditAddress'>();
  const address: UpdateAddressParams = route.params?.address;
  const [request, status] = useUpdateAddressMutation();
  const regionsData: Region[] = regions();
  const currentVin = useCurrentVehicle()?.vin;
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'address',
      label: t('common:address'),
      type: 'text',
      componentProps: {
        maxLength: 50,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
        validate: {
          message: t('validation:required'),
          validator: checkStreetAddress,
        },
      },
    },
    {
      name: 'address2',
      label: t('common:address2'),
      type: 'text',
    },
    {
      name: 'city',
      label: t('common:city'),
      type: 'text',
      rules: {
        required: {
          message: t('validation:required'),
        },
        validate: {
          message: t('validation:alphaSpace'),
          validator: v => !v || checkAlphabetSpace(v as string),
        },
      },
    },
    {
      name: 'state',
      label: t('geography:state'),
      type: 'select',
      //TODO:UA:20230622: Fetch states and pass data as options below
      options: regionsData,
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'zip5Digits',
      label: t('geography:zipcode'),
      type: 'text',
      rules: {
        required: {
          message: t('validation:required'),
        },
        anything: {
          //TODO: UA:20230628: Might need more countries/translations in future
          validator: (v: unknown) =>
            // TODO:AG:20240828: Remove the eslint-disable-line once rules.validate is fixed
            // eslint-disable-next-line
            isValidPostalCode(address.countryCode, v?.toString()),
          message: t('validation:zipCode'),
        },
      },
    },
  ];
  const id = testID('editAddress');
  return (
    <MgaPage title={t('myProfile:editAddress')} focusedEdit>
      <CsfView style={{ flex: 1 }} ph={16} pv={24} testID={id('container')}>
        <MgaForm
          initialValues={{ ...address }}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          trackingId={'editAddress'}
          testID={id('editForm')}
          submitLabel={t('common:save')}
          fields={fieldsToRender}
          scrollEnabled={false}
          isLoading={status.isLoading || vehicleStatus.isLoading}
          onSubmit={async (data: UpdateAddressParams) => {
            const payload: EditAddressParameters = {
              ...data,
              updateAction: 'ADDRESS_UPDATE',
            };
            await request(payload).then(response => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const successResponse: CustomerProfileResponse = response?.data;
              if (successResponse?.success) {
                refreshVehicleRequest(undefined)
                  .then(async response => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const vehicleResponse: NormalResult<SessionData> =
                      response?.data;

                    const vehicle = vehicleResponse.data?.vehicles.find(
                      (value: ClientSessionVehicle) => {
                        return value.vin === currentVin;
                      },
                    );
                    if (hasActiveStarlinkSubscription(vehicle)) {
                      const location = await tomTomFindByPostalCode(
                        data.zip5Digits,
                      );
                      if (
                        isCurrentVehicleRightToRepairByState(
                          vehicle,
                          location?.address.countrySubdivision,
                        ) ||
                        isCurrentVehicleRightToRepairByState(
                          vehicle,
                          data.state,
                        )
                      ) {
                        const contactInfoText: string = t(
                          'myProfile:contactInformationUpdated',
                        );
                        const subscriptionNotAvailableInfoText: string = t(
                          'myProfile:rightToRepairCancelWarning',
                        );
                        const actions: CsfAlertAction[] = [
                          {
                            title: t('common:ok'),
                            type: 'primary',
                          },
                        ];
                        await promptAlert(
                          t('subscriptionCancel:subscriptionCancelled'),
                          `${contactInfoText}.${subscriptionNotAvailableInfoText}`,
                          actions,
                        );
                      }
                    }
                    popIfTop(navigation, 'EditAddress');
                    successNotice({
                      title: t('myProfile:editAddress'),
                      subtitle: t('myProfile:contactInformationUpdated'),
                    });
                  })
                  .catch(() => {
                    CsfSimpleAlert(
                      t('myProfile:editAddress'),
                      t('myProfile:profileUpdateError'),
                      { type: 'error' },
                    );
                  });
              } else if (successResponse?.errorCode == cNetworkError) {
                alertBadConnection();
              } else {
                CsfSimpleAlert(
                  t('myProfile:editAddress'),
                  t('myProfile:profileUpdateError'),
                  { type: 'error' },
                );
              }
            });
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaEditAddress;
