import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { useVehicleOTACampaignQuery } from '../../api/ota.api';
import { MgaOTAUpdateComplete } from './MgaOTAUpdateComplete';
import CsfListItem from '../../components/CsfListItem';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import { CsfChip } from '../../components/CsfChip';
import CsfAppIcon from '../../components/CsfAppIcon';
import MgaOTASingleUpdate from './MgaOTASingleUpdate';
import CsfRule from '../../components/CsfRule';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfPressable from '../../components/CsfPressable';
import MGANoSoftwareUpdate from './MGANoSoftwareUpdate';

export interface VehicleSoftwareUpdateParams {
  campaignName: string
  completedOnHarman: string | null
  customerFacingCampaignDescription: string
  customerFacingName: string
  ecuType: string
  harmanStatus: string
  sourceOfRequestor: string
  startDate: string
}

export interface CampaignDataParams {
  data: VehicleSoftwareUpdateParams[]
  errorMessage: string | null
  success: boolean
}

const MgaOTASoftwareUpdateLanding: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const { data, isFetching, refetch } = useVehicleOTACampaignQuery({
    vin: vehicle?.vin ?? '',
  });
  const campaignData = data?.data as CampaignDataParams;

  const updatedCampaignData =
    campaignData?.data?.filter(
      (item: VehicleSoftwareUpdateParams) => item.harmanStatus !== 'Up-To-Date',
    ) ?? [];

  const [selectedItem, setSelectedItem] =
    useState<VehicleSoftwareUpdateParams | null>(null);

  const renderSoftwareUpdateItem = (item: VehicleSoftwareUpdateParams) => {
    const isSelected =
      selectedItem?.campaignName === item.campaignName &&
      selectedItem?.completedOnHarman === item.completedOnHarman;

    return (
      <React.Fragment key={item.customerFacingCampaignDescription}>
        <CsfListItem
          ph={0}
          title={
            <CsfView flexDirection="row" gap={4} align="center" width={'80%'}>
              <CsfText variant="heading">
                {item.customerFacingName.trim()}
              </CsfText>
              {item.harmanStatus.toLowerCase() == 'update pending' && (
                <CsfChip active label={'New'} color="success" size="small" />
              )}
            </CsfView>
          }
          subtitle={`${t('OTASoftwareUpdate:releaseDate')}${item.startDate}`}
          action={
            <CsfView>
              {item.harmanStatus.toLowerCase() == 'completed' ? (
                <CsfView align="center" flexDirection="row" gap={4}>
                  <CsfAppIcon icon={'CircleCheck'} color="clear" />
                  <CsfText variant="subheading" color="success">
                    {t('OTASoftwareUpdate:complete')}
                  </CsfText>
                </CsfView>
              ) : (
                <CsfView align="center" flexDirection="row" gap={4}>
                  <CsfText variant="subheading" color="button">
                    {t('OTASoftwareUpdate:available')}
                  </CsfText>
                  <CsfAppIcon icon={'RightForwardArrow'} color="clear" />
                </CsfView>
              )}
            </CsfView>
          }
          onPress={() => setSelectedItem(isSelected ? null : item)}
        />
        {isSelected && (
          <CsfView mt={24}>
            {item.harmanStatus.toLowerCase() == 'completed' ? (
              <MgaOTAUpdateComplete item={item} />
            ) : (
              <MgaOTASingleUpdate item={item} />
            )}
          </CsfView>
        )}
        <CsfRule />
      </React.Fragment>
    );
  };

  return (
    <MgaPage title={t('OTASoftwareUpdate:title')} showVehicleInfoBar>
      <MgaPageContent isLoading={isFetching}>
        <CsfView flexDirection="row" justify="flex-end" align="center">
          <CsfView flex={1} align="center">
            <CsfText variant="title2" align="center">
              {t('OTASoftwareUpdate:title')}
            </CsfText>
          </CsfView>
          <CsfPressable
            onPress={async () => {
              await refetch();
            }}>
            <CsfAppIcon color={'copyPrimary'} icon="RefreshIcon" />
          </CsfPressable>
        </CsfView>
        {updatedCampaignData?.map(item => renderSoftwareUpdateItem(item))}
        {updatedCampaignData?.length === 0 && <MGANoSoftwareUpdate />}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaOTASoftwareUpdateLanding;
