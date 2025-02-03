/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as SvgIcons from '../../../core/res/assets/icons/index';

import { FlatList, ListRenderItem } from 'react-native';
import CsfView from '../../components/CsfView';
import CsfDetail from '../../components/CsfDetail';
import CsfAppIcon from '../../components/CsfAppIcon';
import MgaPage from '../../components/MgaPage';
import { CsfThemeContext } from '../../components/CsfThemeContext';
import CsfRule from '../../components/CsfRule';

const SvgItem: ListRenderItem<string> = ({ item }) => {
  return (
    <CsfView ph={16}>
      <CsfDetail
        label={item}
        value={<CsfAppIcon icon={item} size="lg" color="copySecondary" />}
      />
    </CsfView>
  );
};

const svgList = Object.keys(SvgIcons);

const DevIcons: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MgaPage
      title={t('internalDevelopment:icons')}
      trackingId={'dev-controls'}
      bg="background"
      noScroll>
      <FlatList
        data={svgList}
        ListHeaderComponent={
          <CsfView p={16}>
            <CsfView
              flexDirection="row"
              justify="space-between"
              align="center"
              p={16}>
              <CsfAppIcon icon="Abs" size="xs" />
              <CsfAppIcon icon="Abs" size="sm" color="button" />
              <CsfAppIcon icon="Abs" />
              <CsfAppIcon icon="Abs" size="lg" color="success" />
              <CsfAppIcon icon="Abs" size="xl" color="error" />
            </CsfView>
            <CsfThemeContext.Provider value="dark">
              <CsfView
                flexDirection="row"
                justify="space-between"
                align="center"
                bg="background"
                p={16}
                borderRadius={4}>
                <CsfAppIcon icon="Abs" size="xs" />
                <CsfAppIcon icon="Abs" size="sm" color="button" />
                <CsfAppIcon icon="Abs" />
                <CsfAppIcon icon="Abs" size="lg" color="success" />
                <CsfAppIcon icon="Abs" size="xl" color="error" />
              </CsfView>
            </CsfThemeContext.Provider>
          </CsfView>
        }
        renderItem={SvgItem}
        keyExtractor={item => item}
        ItemSeparatorComponent={() => <CsfRule />}
      />
    </MgaPage>
  );
};

export default DevIcons;
