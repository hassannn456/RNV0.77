import React from 'react';
import { CsfTileProps } from './CsfTile';
import { testID } from './utils/testID';
import CsfView from './CsfView';
import CsfRule from './CsfRule';

export type CsfRuleListProps = Pick<CsfTileProps, 'children'> & {
  testID?: string
}

const CsfRuleList: React.FC<CsfRuleListProps> = props => {
  const id = testID(props.testID);
  return (
    <CsfView testID={id()}>
      {React.Children.map(props.children, (child, index) => {
        return (
          !!child && (
            <>
              {index != 0 && <CsfRule testID={id(`rule-${index}`)} />}
              {child}
            </>
          )
        );
      })}
    </CsfView>
  );
};


export default CsfRuleList;
