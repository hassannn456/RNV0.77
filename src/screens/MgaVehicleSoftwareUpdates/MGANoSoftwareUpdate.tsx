import React from 'react';
import { useTranslation } from 'react-i18next';
import CsfView from '../../components/CsfView';
import CsfAppIcon from '../../components/CsfAppIcon';
import CsfText from '../../components/CsfText';

const MGANoSoftwareUpdate: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CsfView align="center" gap={16} justify="center" mt={24}>
      <CsfAppIcon icon="CircleCheckComplete" color="clear" size="xxl" />
      <CsfView width={'60%'}>
        <CsfText variant="display3" align="center" color="success">
          {t('OTASoftwareUpdate:softwareUptoDate')}
        </CsfText>

        <CsfView align="center" mt={32} mb={48} justify="center">
          <CsfView width={'60%'}>
            <CsfText variant="button2" align="center" color="copySecondary">
              {t('OTASoftwareUpdate:noSoftwareUpdate')}
            </CsfText>
          </CsfView>
        </CsfView>
      </CsfView>
    </CsfView>
  );
};

export default MGANoSoftwareUpdate;
