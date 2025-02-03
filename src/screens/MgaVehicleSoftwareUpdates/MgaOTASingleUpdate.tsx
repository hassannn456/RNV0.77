/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { navigate } from '../../Controller';
import { VehicleSoftwareUpdateParams } from './MgaOTASoftwareUpdateLanding';
import { useCsfColors } from '../../components/useCsfColors';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import { CsfMarkdown } from '../../components/CsfMarkdown';
import CsfCard from '../../components/CsfCard';
import CsfAppIcon from '../../components/CsfAppIcon';

interface Slide {
  step: string
  imageURL: string
}

export interface CampaignItem {
  slides: Slide[]
}

export interface SoftwareUpdateListParams {
  [campaignName: string]: CampaignItem
}

export interface MgaOTASingleUpdateProps {
  item: VehicleSoftwareUpdateParams
}

const MgaOTASingleUpdate: React.FC<MgaOTASingleUpdateProps> = ({
  item,
}) => {
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const vehicle = useCurrentVehicle();
  const features = vehicle?.features ?? [];

  const softwareUpdateList: SoftwareUpdateListParams = t(
    'OTACampaignSlides:campaignsList',
    {
      returnObjects: true,
    },
  );
  let capabilityCode = '';

  if (item?.ecuType) {
    // // Determine the filter key based on ecuType
    const filterKey = item.ecuType === 'DCM' ? 'DCM' : 'HU';

    // Filtered from features by filterKey to show set of instruction
    capabilityCode = features?.filter((feature: string) =>
      feature.includes(filterKey),
    )?.[0];
  }

  const campaign: CampaignItem =
    softwareUpdateList[capabilityCode?.replace(/ /g, '') ?? ''];

  return (
    <CsfView p={12} pt={0}>
      <CsfText variant="caption" color="copySecondary">
        {item.harmanStatus}
      </CsfText>
      <CsfView mv={32}>
        <CsfMarkdown>{item.customerFacingCampaignDescription}</CsfMarkdown>
      </CsfView>

      {campaign?.slides?.length > 0 && (
        <CsfCard
          title={
            <CsfView align="center" justify="center">
              <CsfView width={'80%'}>
                <CsfText align="center" variant="subheading">
                  {t('OTASoftwareUpdate:updateYourVehicle')}
                </CsfText>
              </CsfView>
            </CsfView>
          }>
          <CsfView
            flexDirection="row"
            justify="center"
            align="center"
            mt={8}
            gap={4}>
            <CsfAppIcon icon={'CircleQuestion'} size="md" color="clear" />
            <CsfView
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.button,
              }}>
              <CsfText
                align="center"
                variant="subheading"
                color="button"
                onPress={() => {
                  navigate('OTAHowToUpdate', campaign as unknown as []);
                }}>
                {t('OTASoftwareUpdate:howToUpdateTitle')}
              </CsfText>
            </CsfView>
          </CsfView>
        </CsfCard>
      )}
    </CsfView>
  );
};

export default MgaOTASingleUpdate;
