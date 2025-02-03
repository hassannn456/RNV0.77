/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import MgaPage from '../../components/MgaPage';
import { CsfWindowShade, CsfWindowShadeRef } from '../../components/CsfWindowShade';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import CsfButton from '../../components/CsfButton';

const DevWindowShade: React.FC = () => {
  const { t } = useTranslation();
  const testRef = useRef<CsfWindowShadeRef>(null);
  const [state, setState] = useState([]);

  const toggleStateItem = (stateItem: string) => {
    const tempState = [...state];
    if (tempState.includes(stateItem)) {
      setState(tempState.filter(item => item !== stateItem));
    } else {
      tempState.push(stateItem);
      setState(tempState);
    }
  };
  return (
    <MgaPage
      title={t('internalDevelopment:elements')}
      stickyFooter={() => (
        <CsfWindowShade
          title={state.includes('title') ? 'Test Title' : undefined}
          icon={state.includes('icon') ? 'Abs' : undefined}
          ref={testRef}>
          <CsfView p={16} gap={16}>
            <CsfText>...</CsfText>
          </CsfView>
        </CsfWindowShade>
      )}>
      <CsfView p={16} gap={16}>
        <CsfText variant="heading">CsfWindowShade</CsfText>
        <CsfButton
          title="Open With Ref"
          onPress={() => testRef.current?.setShadeOpen(true)}
        />
        <CsfButton
          title="Toggle Title"
          onPress={() => {
            toggleStateItem('title');
          }}
        />
        <CsfButton
          title="Toggle Icon"
          onPress={() => {
            toggleStateItem('icon');
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default DevWindowShade;
