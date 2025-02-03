import React from 'react';

import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../../Controller';
import {
  useValetModeSetupQuery,
  useValetModeSettingsQuery,
  updateValetModeSpeedSettings,
  RemoteValetSettingsRequest,
  valetModeApi,
} from '../../features/remoteService/valetMode';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { defaultSpeedLimitMPS } from '../../utils/valetMode';
import { store } from '../../store';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfCard from '../../components/CsfCard';
import CsfDetail from '../../components/CsfDetail';
import CsfButton from '../../components/CsfButton';

const DevValetMode: React.FC = () => {
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };
  const navigation = useAppNavigation();
  const { data: valetModeSetting } = useValetModeSettingsQuery(vParams);
  const { data: valetModeSetup } = useValetModeSetupQuery(vParams);
  const { t } = useTranslation();
  return (
    <MgaPage title={t('internalDevelopment:valet')}>
      <MgaPageContent>
        <CsfCard gap={16}>
          <CsfRuleList>
            <CsfDetail
              stacked
              label="Valet Settings"
              value={JSON.stringify(valetModeSetting?.data)}
            />
            <CsfDetail
              stacked
              label="Valet Setup"
              value={JSON.stringify(valetModeSetup?.data)}
            />
          </CsfRuleList>

          <CsfButton
            title="Restore Default"
            onPress={async () => {
              const params: RemoteValetSettingsRequest = {
                maxSpeedMPS: Number(defaultSpeedLimitMPS),
                hysteresisSec: 0,
                speedType: 'absolute',
                enableSpeedFence: true,
                vin: '',
                pin: '',
              };

              await updateValetModeSpeedSettings(params);

              await store
                .dispatch(
                  valetModeApi.endpoints.valetModeSettings.initiate(vParams),
                )
                .unwrap();
            }}
          />

          <CsfButton
            title="Valet Mode"
            onPress={() => navigation.navigate('ValetMode')}
          />
        </CsfCard>
      </MgaPageContent>
    </MgaPage>
  );
};

export default DevValetMode;
