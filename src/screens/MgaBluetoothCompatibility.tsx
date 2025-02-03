/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validate } from '../utils/validate';
import { store, useAppSelector } from '../store';
import {
  BluetoothCompatibilityInfo,
  ServiceProviderInfo,
  useCheckBluetoothCompatibilityQuery,
  useLazyGetHeadUnitsAndCarrierQuery,
  useLazyGetHeadUnitsAndCarriersByVinQuery,
  useLazyGetManufacturerQuery,
  useLazyGetModalNamesQuery,
  useLazyGetModalPhonesQuery,
  useLazyGetTrimsQuery,
  bluetoothCompatibilityApi,
} from '../api/bluetoothCompatibility.api';
import { useAppNavigation } from '../Controller';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import CsfModal from '../components/CsfModal';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSelect from '../components/CsfSelect';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';

const MgaBluetoothCompatibility: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [query, dataModal] = useLazyGetModalNamesQuery();
  const [queryHead, dataTrim] = useLazyGetTrimsQuery();
  const [queryManufacturer, dataManufacturer] = useLazyGetManufacturerQuery();
  const [queryPhone, dataPhone] = useLazyGetModalPhonesQuery();
  const [queryHeadUnit, dataHeadUnit] = useLazyGetHeadUnitsAndCarrierQuery();
  const [queryByVin, dataQueryByVin] =
    useLazyGetHeadUnitsAndCarriersByVinQuery();

  const vehicles = useAppSelector(state => state.session?.vehicles ?? []);
  const selected = useAppSelector(
    state => state.session?.currentVehicleIndex ?? -1,
  );
  const bluetoothQuery = useCheckBluetoothCompatibilityQuery(undefined);
  const { data: response } = bluetoothQuery;
  const bluetoothInfo: BluetoothCompatibilityInfo | undefined | null =
    response?.data;

  const isLoading =
    dataModal?.isFetching ||
    dataTrim?.isLoading ||
    dataManufacturer.isLoading ||
    dataPhone.isLoading ||
    dataHeadUnit.isLoading ||
    dataQueryByVin.isFetching;

  const [showErrors, setShowErrors] = useState(false);
  const [state, setState] = useState({
    carrier: '',
    headUnit: '',
    headUnitCode: '',
    headUnitResponse: [] as { name: string; code: string }[],
    manufacture: '',
    modal: '',
    modelNameTextDisplay: '',
    phone: '',
    requiredHeadUnit: '',
    requiredManufacturer: '',
    requiredModelName: '',
    requiredPhoneModel: '',
    requiredServiceProvider: '',
    requiredTrim: '',
    requiredYear: '',
    trim: '',
    trimTextDisplay: '',
    vin: vehicles[selected].vin,
    vinModalName: vehicles[selected].vehicleName,
    year: '',
  });

  function setHeadUnit(connections: object) {
    const headUnitInfo: { name: string; code: string }[] = [];
    Object.keys(connections).forEach(key => {
      const value = connections[key as keyof typeof connections];
      headUnitInfo.push({
        name: value.name as string,
        code: value.code as string,
      });
    });
    return headUnitInfo;
  }

  useEffect(() => {
    const connections = dataHeadUnit?.data?.data?.connections;
    if (connections != undefined) {
      const data = setHeadUnit(connections);
      setState(prevState => {
        return {
          ...prevState,
          headUnit: data.length == 1 ? data[0].name : '',
          requiredHeadUnit: data.length == 1 ? data[0].name : '',
          headUnitCode: data.length == 1 ? data[0].code : '',
          headUnitResponse: [...data],
        };
      });
    }
  }, [dataHeadUnit]);

  useEffect(() => {
    const connections = dataQueryByVin?.data?.data?.connections;
    if (connections != undefined) {
      const data = setHeadUnit(connections);
      setState(prevState => {
        return {
          ...prevState,
          headUnit: data.length == 1 ? data[0].name : '',
          requiredHeadUnit: data.length == 1 ? data[0].name : '',
          headUnitResponse: [...data],
        };
      });
    }
  }, [dataQueryByVin]);

  useEffect(() => {
    const connections = bluetoothInfo?.bluetoothCompatibility?.connections;
    if (connections != undefined) {
      const data = setHeadUnit(connections);
      setState(prevState => {
        return {
          ...prevState,
          headUnit: data.length == 1 ? data[0].name : '',
          headUnitResponse: [...data],
          requiredYear: bluetoothInfo
            ? bluetoothInfo?.currentVehicleModelYear
            : '',
          requiredTrim: bluetoothInfo ? bluetoothInfo?.currentVehicleTrim : '',
          requiredModelName: bluetoothInfo
            ? bluetoothInfo?.currentVehicleModelCode
            : '',
        };
      });
    }
  }, [bluetoothInfo]);

  const errors = validate(
    state,
    {
      requiredModelName: 'required',
      requiredTrim: 'required',
      requiredHeadUnit: 'required',
      requiredServiceProvider: 'required',
      requiredManufacturer: 'required',
      requiredPhoneModel: 'required',
    },
    (key, error) => {
      return t(`validation:${error as string}`);
    },
  );

  const modelYear = state.requiredYear ? state.requiredYear : state.year;
  const modelName = state.requiredModelName
    ? state.requiredModelName
    : state.modal;
  const trim = state.requiredTrim ? state.requiredTrim : state.trim;
  const carrierList: ServiceProviderInfo[] | undefined =
    bluetoothInfo?.bluetoothCompatibility?.serviceProviders ||
    dataQueryByVin?.data?.data?.serviceProviders;

  const id = testID('BluetoothCompatibility');
  return (
    <MgaPage
      title={t('bluetoothCompatibility:bluetoothCompatibility')}
      isLoading={bluetoothQuery.isFetching}
      showVehicleInfoBar>
      <CsfCard>
        {isLoading && (
          <CsfModal
            backgroundStyle={{ backgroundColor: '#00000011' }}
            modalInnerStyle={{ backgroundColor: 'transparent' }}>
            <CsfActivityIndicator size={'large'} />
          </CsfModal>
        )}
        <CsfText
          variant="title2"
          align="center"
          testID={id('bluetoothCompatibility')}>
          {t('bluetoothCompatibility:bluetoothCompatibility')}
        </CsfText>

        <CsfRuleList>
          <CsfView mv={16}>
            <CsfText
              variant="title3"
              align="center"
              testID={id('checkYourPhoneCompatibility')}>
              {t('bluetoothCompatibility:checkYourPhoneCompatibility')}
            </CsfText>
          </CsfView>
          <CsfView standardSpacing pv={16}>
            <CsfText
              variant="body"
              align="center"
              testID={id('constantlyTestingNewPhoneCheckBackSoon')}>
              {t(
                'bluetoothCompatibility:constantlyTestingNewPhoneCheckBackSoon',
              )}
            </CsfText>
          </CsfView>

          <CsfView mv={16} pt={8}>
            <CsfText variant="heading" testID={id('selectYourVehicle')}>
              {t('bluetoothCompatibility:selectYourVehicle')}
            </CsfText>
          </CsfView>
        </CsfRuleList>

        <CsfSelect
          label={t('common:vin')}
          value={`${state.vinModalName}code::${state.vin}`}
          errors={false}
          testID={id('vehiclesSelect')}
          options={vehicles.map(e => ({
            label: e.vehicleName,
            value: e.vehicleName + 'code::' + e.vin,
          }))}
          onSelect={async value => {
            const selectedVinValue = value.split('code::');
            setState({
              ...state,
              vin: selectedVinValue[1],
              vinModalName: selectedVinValue[0],
              headUnit: '',
              requiredHeadUnit: '',
              headUnitCode: '',
              manufacture: '',
              requiredManufacturer: '',
              phone: '',
              requiredPhoneModel: '',
              carrier: '',
              requiredServiceProvider: '',
            });
            const para = {
              vin: selectedVinValue[1],
            };
            const response = await queryByVin(para).unwrap();
            if (!response.success && !isLoading) {
              const alertTimeout = setTimeout(() => {
                CsfSimpleAlert(
                  t('common:error'),
                  t('remoteServiceCommunications:fatalMessage'),
                  { type: 'error' },
                );
                clearTimeout(alertTimeout);
              }, 1);
            }
          }}
        />
        <CsfView mv={12} pt={8} gap={12}>
          <CsfText
            variant="heading"
            align="center"
            testID={id('compatibilityOr')}>
            {t('bluetoothCompatibility:or')}
          </CsfText>
          <CsfText
            variant="heading"
            align="center"
            testID={id('searchOtherVehicles')}>
            {t('bluetoothCompatibility:searchOtherVehicles')}
          </CsfText>
        </CsfView>

        <CsfSelect
          label={t('bluetoothCompatibility:year')}
          value={state.year}
          errors={false}
          testID={id('yearSelect')}
          options={bluetoothInfo?.yearsList.map(e => ({
            label: e.year,
            value: e.year,
          }))}
          onSelect={async value => {
            setState({
              ...state,
              year: value,
              requiredYear: value,
              modal: '',
              requiredModelName: '',
              trim: '',
              requiredTrim: '',
              modelNameTextDisplay: '',
              trimTextDisplay: '',
            });
            if (Number(value) < 2010) {
              const alertTimeout = setTimeout(() => {
                CsfSimpleAlert(
                  t('bluetoothCompatibility:attention'),
                  `${t('bluetoothCompatibility:notAvailableForThisModel')}${t(
                    'bluetoothCompatibility:notApply3rdParty',
                  )}`,
                  { type: 'warning' },
                );
                clearTimeout(alertTimeout);
              }, 1);
              return false;
            }
            const para = {
              modelYear: value,
            };
            await query(para).unwrap();
          }}
        />
        <CsfSelect
          label={t('bluetoothCompatibility:model')}
          value={state.modal}
          testID={id('modelSelect')}
          errors={showErrors && errors.requiredModelName}
          options={dataModal?.data?.data.map(e => ({
            label: e.name,
            value: e.name + 'code::' + e.code,
          }))}
          onSelect={async value => {
            const selectedModalValue = value.split('code::');
            setState({
              ...state,
              modal: value,
              requiredModelName: selectedModalValue[1],
              modelNameTextDisplay: selectedModalValue[0],
              trim: '',
              requiredTrim: '',
              trimTextDisplay: '',
            });
            const para = {
              modelYear: state.year,
              modelName: selectedModalValue[1],
            };
            await queryHead(para).unwrap();
          }}
        />
        <CsfSelect
          label={t('bluetoothCompatibility:trim')}
          testID={id('trimSelect')}
          value={state.trim}
          errors={showErrors && errors.requiredTrim}
          options={dataTrim?.data?.data?.map(e => ({
            label: e.name,
            value: e.name + 'code::' + e.code,
          }))}
          onSelect={async value => {
            const selectedTrimValue = value.split('code::');
            setState({
              ...state,
              trim: value,
              requiredTrim: selectedTrimValue[1],
              trimTextDisplay: selectedTrimValue[0],
            });
            const para = {
              modelYear: modelYear,
              modelName: modelName,
              trim: selectedTrimValue[1],
            };
            await queryHeadUnit(para).unwrap();
          }}
        />

        <CsfView mv={16} pt={8}>
          <CsfText variant="heading" testID={id('headUnit')}>
            {t('Head Unit*')}
          </CsfText>
        </CsfView>
        <CsfSelect
          label={t('bluetoothCompatibility:headUnit')}
          testID={id('headUnitSelect')}
          value={state.headUnit}
          errors={showErrors && errors.requiredHeadUnit}
          options={state.headUnitResponse.map(e => ({
            label: e.name,
            value: e.name + 'code::' + e.code,
          }))}
          // editable={!(state.trim && state.headUnit)}
          onSelect={value => {
            const selectedHeadUnitValue = value.split('code::');
            setState({
              ...state,
              headUnit: value,
              requiredHeadUnit: selectedHeadUnitValue[0],
              headUnitCode: selectedHeadUnitValue[1],
            });
          }}
        />

        <CsfView mv={16} pt={8}>
          <CsfText variant="heading" testID={id('selectYourPhone')}>
            {t('bluetoothCompatibility:selectYourPhone')}
          </CsfText>
        </CsfView>
        <CsfSelect
          label={t('bluetoothCompatibility:carrier')}
          value={state.carrier}
          testID={id('carrierSelect')}
          errors={showErrors && errors.requiredServiceProvider}
          options={
            carrierList &&
            carrierList.map(e => ({
              label: e.name,
              value: e.name,
            }))
          }
          onSelect={async value => {
            setState({
              ...state,
              carrier: value,
              requiredServiceProvider: value,
            });

            const para = {
              modelYear: modelYear,
              modelName: modelName,
              trim: trim,
              serviceProvider: value,
            };
            await queryManufacturer(para).unwrap();
          }}
        />

        <CsfSelect
          label={t('bluetoothCompatibility:manufacturer')}
          value={state.manufacture}
          testID={id('manufactureSelect')}
          errors={showErrors && errors.requiredManufacturer}
          options={dataManufacturer?.data?.data?.map(e => ({
            label: e.name,
            value: e.name,
          }))}
          onSelect={async value => {
            setState({
              ...state,
              manufacture: value,
              requiredManufacturer: value,
            });
            const para = {
              modelYear: modelYear,
              modelName: modelName,
              trim: trim,
              serviceProvider: state.carrier,
              manufacturer: value,
            };
            await queryPhone(para).unwrap();
          }}
        />
        <CsfSelect
          label={t('bluetoothCompatibility:phone')}
          value={state.phone}
          testID={id('phoneSelect')}
          errors={showErrors && errors.requiredPhoneModel}
          options={dataPhone?.data?.data?.map(e => ({
            label: e.name,
            value: e.name,
          }))}
          onSelect={value =>
            setState({
              ...state,
              phone: value,
              requiredPhoneModel: value,
            })
          }
        />
        <CsfView pt={16}>
          <MgaButton
            title={t('bluetoothCompatibility:checkCompatibility')}
            trackingId="BluetoothCheckCompatibility"
            variant="primary"
            disabled={isLoading}
            onPress={async () => {
              setShowErrors(true);
              if (Object.keys(errors).length > 0) { return; }
              const para = {
                headUnit: state.headUnitCode,
                headUnitTextDisplay: state.requiredHeadUnit,
                manufacturer: state.requiredManufacturer,
                modelName:
                  state.requiredModelName ||
                  bluetoothInfo?.currentVehicleModelCode,
                modelNameTextDisplay:
                  state.modelNameTextDisplay || state.vinModalName,
                modelYear: state.year || bluetoothInfo?.currentVehicleModelYear,
                phoneModel: state.requiredPhoneModel,
                serviceProvider: state.requiredServiceProvider,
                trim: state.requiredTrim || bluetoothInfo?.currentVehicleTrim,
                trimTextDisplay: state.trimTextDisplay,
              };

              const response = await store
                .dispatch(
                  bluetoothCompatibilityApi.endpoints.bluetoothCompatibilityResults.initiate(
                    para,
                  ),
                )
                .unwrap();
              if (response.success) {
                navigation.navigate('BluetoothResults', {
                  response: response,
                  nickname: state.modelNameTextDisplay
                    ? ''
                    : state.vinModalName,
                });
              } else {
                CsfSimpleAlert(
                  t('common:failed'),
                  t('remoteServiceCommunications:fatalMessage'),
                  { type: 'error' },
                );
              }
            }}
          />
        </CsfView>
      </CsfCard>
    </MgaPage>
  );
};

export default MgaBluetoothCompatibility;
