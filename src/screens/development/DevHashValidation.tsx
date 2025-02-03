/* eslint-disable react/self-closing-comp */
import React, { useState } from 'react';
import { loadLocalesFromS3 } from '../../features/localization/localization.api';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfButton from '../../components/CsfButton';

const CsfDevI18nTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onButtonPressed = async () => {
    setIsLoading(true);
    try {
      await loadLocalesFromS3();
    } catch (error) {
      console.warn('Error validating hashes: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MgaPage title={'i18n Tester'} trackingId={'dev-hash'}>
      <CsfView justify="center" align="center" p={8}>
        <CsfText align="center">Tap to download content:</CsfText>
      </CsfView>
      <CsfView justify="center" align="center" p={8}>
        <CsfButton
          isLoading={isLoading}
          key={'primary'}
          title={isLoading ? 'Loading....' : 'Run'}
          width={150}
          onPress={onButtonPressed}></CsfButton>
      </CsfView>
    </MgaPage>
  );
};

export default CsfDevI18nTester;
