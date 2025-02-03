/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';


import { useTranslation } from 'react-i18next';
import { CsfViewProps } from '../../components';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaPage from '../../components/MgaPage';
import CsfTile from '../../components/CsfTile';
import CsfCard from '../../components/CsfCard';
import CsfButton from '../../components/CsfButton';
import CsfAppIcon from '../../components/CsfAppIcon';

export const DemoChildren: React.FC = (props: CsfViewProps) => (
  <CsfView
    borderWidth={1}
    borderColor="copySecondary"
    p={16}
    style={{ borderStyle: 'dashed' }}>
    {props.children || <CsfText>children</CsfText>}
  </CsfView>
);
const DevElements: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MgaPage
      title={t('internalDevelopment:elements')}
      trackingId={'dev-typography'}>
      <CsfView p={16} gap={16}>
        <CsfText variant="heading">CsfTile</CsfText>
        <CsfTile>
          <DemoChildren>
            <CsfText>default</CsfText>
          </DemoChildren>
        </CsfTile>
        <CsfTile flat={true}>
          <DemoChildren>
            <CsfText>flat:true</CsfText>
          </DemoChildren>
        </CsfTile>
        <CsfTile borderColor="error">
          <DemoChildren>
            <CsfText>{"borderColor='error'"}</CsfText>
          </DemoChildren>
        </CsfTile>
        <CsfText variant="heading">CsfCard</CsfText>
        <CsfCard title="title (optional)" subtitle="subtitle (optional)">
          <DemoChildren />
        </CsfCard>
        <CsfCard
          title="title (optional)"
          subtitle="subtitle (optional)"
          action={<CsfButton title={'Action'} variant="inlineLink" />}
          icon={<CsfAppIcon icon="CheckEngine" size="lg" />}>
          <DemoChildren />
        </CsfCard>
        <CsfCard
          borderColor="error"
          flat
          title="title (optional)"
          subtitle="subtitle (optional)"
          action={<CsfButton title={'Action'} variant="inlineLink" />}
          icon={<CsfAppIcon icon="AirCirculationExterior" size="lg" />}>
          <DemoChildren>
            <CsfText>{"borderColor='error'"}</CsfText>
          </DemoChildren>
        </CsfCard>
      </CsfView>
    </MgaPage>
  );
};


export default DevElements;