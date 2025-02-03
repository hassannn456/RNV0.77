import React, { ReactNode } from 'react';
import CsfView, { CsfFlexProps } from './CsfView';
import CsfText from './CsfText';
import { testID } from './utils/testID';

export type CsfDetailProps = Pick<CsfFlexProps, 'align'> & {
  label: string | number | ReactNode | React.FC | JSX.Element;
  value: string | number | ReactNode | React.FC | JSX.Element;
  stacked?: boolean;
  testID?: string;
};

const CsfDetail: React.FC<CsfDetailProps> = props => {
  const id = testID(props.testID);
  return (
    <CsfView
      flex={1}
      flexDirection={props.stacked ? 'column' : 'row'}
      justify="space-between"
      align={props.align || props.stacked ? 'flex-start' : 'center'}
      gap={props.stacked ? 4 : 16}
      pv={4}
      minHeight={32}
      testID={id()}>
      <CsfView testID={id('labelContainer')}>
        {typeof props.label === 'string' || typeof props.label === 'number' ? (
          <CsfView testID={id('labelInnerContainer')}>
            <CsfText color="copySecondary" testID={id('label')}>
              {props.label}
            </CsfText>
          </CsfView>
        ) : (
          <CsfView align="flex-start" testID={id('labelInnerContainer')}>
            {props.label}
          </CsfView>
        )}
      </CsfView>

      <CsfView flex={1} testID={id('valueContainer')}>
        {typeof props.value === 'string' || typeof props.value === 'number' ? (
          <CsfText
            align={props.stacked ? 'left' : 'right'}
            testID={id('value')}>
            {props.value.toString()}
          </CsfText>
        ) : (
          <CsfView align="flex-end" testID={id('valueInnerContainer')}>
            {props.value}
          </CsfView>
        )}
      </CsfView>
    </CsfView>
  );
};

// Default export for CsfDetail
export default CsfDetail;
