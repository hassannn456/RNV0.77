import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import {
  getPresentRecalls,
  getPastRecalls,
  useRecallsQuery,
} from '../api/vehicle.api';
import { VehicleRecallInfo } from '../../@types';
import { testID } from '../components/utils/testID';
import { CsfAccordionSectionProps } from '../components';
import CsfAccordionList from '../components/CsfAccordionList';
import { MgaAccordionSection } from '../components/CsfAccordionSection';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfDetail from '../components/CsfDetail';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { MgaRetailerEmbed } from '../components/MgaRetailerComponents';

const Recall: React.FC<
  CsfAccordionSectionProps & { info: VehicleRecallInfo; trackingId: string }
> = ({ info, ...props }) => {
  const { t } = useTranslation();
  const recallStatusOpen =
    info?.recallStatus && info.recallStatus.toLowerCase().startsWith('open');

  const id = testID(props.trackingId);
  return (
    <MgaAccordionSection
      title={info.shortDescription}
      testID={id()}
      subtitle={
        <CsfText
          color={
            recallStatusOpen ? 'error' : 'success'
          }>{`${info.recallStatus}`}</CsfText>
      }
      icon={
        recallStatusOpen ? (
          <CsfAppIcon icon="WarningAttentionFill" color={'error'} />
        ) : (
          <CsfAppIcon icon="SuccessAlertFill" color={'success'} />
        )
      }
      renderBody={() => (
        <CsfView p={16} gap={8}>
          <CsfDetail
            stacked
            label={t('recalls:status')}
            value={info.recallStatus}
            testID={id('recallStatus')}
          />
          <CsfDetail
            stacked
            label={t('recalls:description')}
            value={info.recallDescription}
            testID={id('recallDescription')}
          />
          <CsfDetail
            stacked
            label={t('recalls:safetyRisk')}
            value={info.safetyRiskDescription}
            testID={id('safetyRiskDescription')}
          />
          <CsfDetail
            stacked
            label={t('recalls:remedy')}
            value={info.remedyDescription}
            testID={id('remedyDescription')}
          />
        </CsfView>
      )}
      {...props}
    />
  );
};

const MgaRecalls: React.FC = () => {
  const { t } = useTranslation();
  const vin = useCurrentVehicle()?.vin ?? '';
  const recallQuery = useRecallsQuery({ vin });
  const recallMap = recallQuery.data?.data;
  const openRecalls = getPresentRecalls(recallMap);
  const shutRecalls = getPastRecalls(recallMap);

  const id = testID('Recalls');
  return (
    <MgaPage title={t('recalls:title')}>
      <MgaPageContent
        title={t('recalls:title')}
        isLoading={recallQuery.isLoading || recallQuery.isFetching}>
        <CsfText align="center">{t('recalls:disclaimer', { vin })}</CsfText>

        <CsfView gap={24} testID={id()}>
          {openRecalls.length == 0 && shutRecalls.length == 0 ? (
            <CsfText testID={id('noRecalls')}>{t('recalls:noRecalls')}</CsfText>
          ) : (
            <>
              <CsfView gap={12}>
                <CsfText
                  variant="heading"
                  align="center"
                  testID={id('currentRecalls')}>
                  {t('recalls:currentRecalls')}
                </CsfText>
                <CsfAccordionList>
                  {openRecalls.length == 0 ? (
                    <CsfView p={16}>
                      <CsfText testID={id('noOpenRecalls')}>
                        {t('recalls:noOpenRecalls')}
                      </CsfText>
                    </CsfView>
                  ) : (
                    openRecalls.map((r, i) => (
                      <Recall
                        info={r}
                        key={i}
                        trackingId={`OpenRecallsAccordion-${i}`}
                      />
                    ))
                  )}
                </CsfAccordionList>
              </CsfView>
              <CsfView gap={12}>
                {shutRecalls.length > 0 && (
                  <>
                    <CsfText
                      variant="heading"
                      align="center"
                      testID={id('recallHistory')}>
                      {t('recalls:recallHistory')}
                    </CsfText>
                    <CsfAccordionList>
                      {shutRecalls.map((r, i) => (
                        <Recall
                          info={r}
                          key={i}
                          trackingId={`ShutRecallsAccordion-${i}`}
                        />
                      ))}
                    </CsfAccordionList>
                  </>
                )}
              </CsfView>
            </>
          )}
        </CsfView>

        <MgaRetailerEmbed />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaRecalls;
