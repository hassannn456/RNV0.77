import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MgaHeroPage from '../../components/MgaHeroPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfButton from '../../components/CsfButton';

/* cSpell:disable */
const sample =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
/* cSpell:enable */

const DevHero: React.FC = () => {
  const { t } = useTranslation();

  const [text, setText] = useState('Add more text to test layout changes.');
  // const [infoBar, setInfoBar] = useState(false)

  return (
    <MgaHeroPage
      showVehicleInfoBar={true}
      title={t('internalDevelopment:hero')}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      heroSource={require('../../../content/img/trip-tracker-bg.png')}>
      <CsfView gap={16}>
        <CsfText variant="title2" align="center">
          Lorem Ipsum
        </CsfText>
        <CsfText>{text} </CsfText>
        <CsfButton
          title="Add Text"
          onPress={() => {
            setText(`${text}  ${sample}`);
          }}
        />
        <CsfButton
          title="Clear Text"
          onPress={() => setText('Cleared!')}
          variant="secondary"
        />
      </CsfView>
    </MgaHeroPage>
  );
};

export default DevHero;
