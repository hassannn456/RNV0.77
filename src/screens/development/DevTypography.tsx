import React from 'react';
import { useTranslation } from 'react-i18next';
import CsfText, { CsfTextStyles } from '../../components/CsfText';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfCard from '../../components/CsfCard';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfDetail from '../../components/CsfDetail';

const styles = Object.keys(CsfTextStyles);

const DevTypography: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MgaPage
      title={t('internalDevelopment:typography')}
      trackingId={'dev-typography'}>
      <CsfView p={16} gap={16}>
        {styles.map((variant, i) => (
          <CsfCard subtitle={variant} key={i}>
            <CsfView gap={16}>
              <CsfText variant={variant}>
                {t('internalDevelopment:sampleText')}
              </CsfText>

              <CsfRuleList>
                {Object.entries(CsfTextStyles[variant]).map((style, ii) => (
                  <CsfDetail label={style[0]} value={style[1]} key={ii} />
                ))}
              </CsfRuleList>
            </CsfView>
          </CsfCard>
        ))}
      </CsfView>
    </MgaPage>
  );
};

export default DevTypography;
