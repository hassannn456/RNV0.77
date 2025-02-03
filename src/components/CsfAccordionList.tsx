/* eslint-disable eol-last */
import React from 'react';
import { CsfRuleList } from './CsfRuleList';
import CsfTile, { CsfTileProps } from './CsfTile';
import { testID } from './utils/testID';

export type CsfAccordionListProps = Pick<CsfTileProps, 'children' | 'testID'>

const CsfAccordionList: React.FC<CsfAccordionListProps> = props => {
  const id = testID(props.testID);
  return (
    <CsfTile
      p={0}
      gap={0}
      testID={id()}
      borderColor="rule"
      borderRadius={8}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ overflow: 'hidden' }}
      {...props}>
      <CsfRuleList testID={id('list')}>{props.children}</CsfRuleList>
    </CsfTile>
  );
};

export default CsfAccordionList;