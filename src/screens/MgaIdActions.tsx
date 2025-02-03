import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { store } from '../store';
import CsfTableViewCell from '../components/CsfTableViewCell';
import CsfText from '../components/CsfText';
import MgaPage from '../components/MgaPage';

type Action = {
  key: string
  fn: () => void
}
const actions: Action[] = [
  {
    key: 'internalDevelopment:clearSession',
    fn: () => {
      store.dispatch({ type: 'session/replace', payload: { sessionId: '0' } });
    },
  },
];

const MgaIdActions: React.FC = () => {
  const { t } = useTranslation();
  return (
    <MgaPage noScroll={true} title={t('internalDevelopment:actions')}>
      <FlatList
        data={actions}
        renderItem={({ item }) => (
          <CsfTableViewCell key={item.key} onPress={item.fn}>
            <CsfText>{t(item.key)}</CsfText>
          </CsfTableViewCell>
        )}
      />
    </MgaPage>
  );
};

export default MgaIdActions;
