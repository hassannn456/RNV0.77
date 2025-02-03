import React from 'react';

import { useTranslation } from 'react-i18next';
import { VehicleSoftwareUpdateParams } from './MgaOTASoftwareUpdateLanding';
import { parse, differenceInHours } from 'date-fns';
import CsfView from '../../components/CsfView';
import CsfCard from '../../components/CsfCard';
import CsfAppIcon from '../../components/CsfAppIcon';
import CsfText from '../../components/CsfText';
import { CsfMarkdown } from '../../components/CsfMarkdown';
import MGANoSoftwareUpdate from './MGANoSoftwareUpdate';

function getDifferenceInHoursFromNow(dateString: string | null | undefined) {
  if (typeof dateString === 'string') {
    const completedDate = parse(dateString, 'dd-MMM-yy HH:mm:ss', new Date());
    const currentDate = new Date();
    return differenceInHours(currentDate, completedDate);
  } else {
    return 0;
  }
}

export interface MgaOTAUpdateCompleteProps {
  item: VehicleSoftwareUpdateParams
}

const MgaOTAUpdateComplete: React.FC<MgaOTAUpdateCompleteProps> = ({
  item,
}) => {
  const { t } = useTranslation();

  const differenceInHours = getDifferenceInHoursFromNow(item?.completedOnHarman);

  const statusCompleted24Hours =
    item &&
    item?.harmanStatus.toLowerCase() == 'completed' &&
    differenceInHours <= 24;

  const before24Completed = () => {
    return (
      <CsfView p={12} pt={0}>
        <CsfCard p={8}>
          <CsfView align="center" justify="center" mv={12}>
            <CsfAppIcon icon="CircleCheckComplete" color="clear" size="lg" />

            <CsfView mv={8}>
              <CsfText variant="heading" color="success">
                {t('OTASoftwareUpdate:softwareInstalled')}
              </CsfText>
            </CsfView>

            <CsfText variant="subheading" align="center" color="copySecondary">
              {t('OTASoftwareUpdate:thankYouForUpdating')}
            </CsfText>
          </CsfView>
        </CsfCard>
        <CsfView gap={4} mv={20}>
          <CsfText variant="heading">{item?.customerFacingName.trim()}</CsfText>
          <CsfText variant="caption" color="copySecondary">
            {t('OTASoftwareUpdate:releaseDate') + (item?.startDate || '')}
          </CsfText>
          <CsfView mv={12}>
            <CsfText variant="caption">
              {t('OTASoftwareUpdate:newUpdateDescription')}
            </CsfText>
          </CsfView>
          <CsfMarkdown>{item?.customerFacingCampaignDescription}</CsfMarkdown>
        </CsfView>
      </CsfView>
    );
  };

  const after24Completed = () => {
    return <MGANoSoftwareUpdate />;
  };

  return statusCompleted24Hours ? before24Completed() : after24Completed();
};

export default MgaOTAUpdateComplete;
