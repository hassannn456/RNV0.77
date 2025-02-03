import React from 'react';
import { useTranslation } from 'react-i18next';
import ValetPump from '../../../content/svg/pumps/valet_pump.svg';
import ValetPumpActivatingDeactivating from '../../../content/svg/pumps/activating_deactivating_pump.svg';
import ValetPumpPending from '../../../content/svg/pumps/pending_pump.svg';
import ValetPumpActive from '../../../content/svg/pumps/active_pump.svg';
import StartPump from '../../../content/svg/pumps/start_pump.svg';
import PhevPump from '../../../content/svg/pumps/phev_pump.svg';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';

const DevPumps: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MgaPage
      title={t('internalDevelopment:pumps')}
      trackingId={'dev-controls'}
      bg="background">
      <CsfView align="center" p={16} gap={24}>
        <CsfView>
          <CsfText variant="heading" align="center">
            StartPump
          </CsfText>
          <StartPump width={180} height={180} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            PhevPump
          </CsfText>
          <PhevPump width={285} height={153} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            ValetPump
          </CsfText>
          <ValetPump width={300} height={300} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            ValetPumpActivating
          </CsfText>
          <ValetPumpActivatingDeactivating width={300} height={300} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            ValetPumpDeActivating
          </CsfText>
          <ValetPumpActivatingDeactivating width={300} height={300} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            ValetPumpPending
          </CsfText>
          <ValetPumpPending width={300} height={300} />
        </CsfView>

        <CsfView>
          <CsfText variant="heading" align="center">
            ValetPumpActive
          </CsfText>
          <ValetPumpActive width={300} height={300} />
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

export default DevPumps;
