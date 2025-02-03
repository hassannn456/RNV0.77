/* eslint-disable eol-last */
import React from 'react';
import CsfView, { CsfViewProps } from '../CsfView';
import CsfText, { CsfTextVariant } from '../CsfText';
import CsfInputDetails from './CsfIInputDetails';
import { CsfColorPalette } from '../useCsfColors';
import { Dimension } from '../types';
import { testID } from '../utils/testID';

export interface CsfFormInputViewProps
  extends Pick<CsfViewProps, 'children' | 'pt' | 'gap' | 'testID'> {
  label?: string
  hint?: string
  errors?: false | string | string[]
}

export const CsfFormInputViewStyles = {
  outerView: { gap: 4 as Dimension },
  labelText: {
    variant: 'caption' as CsfTextVariant,
    color: 'copyPrimary' as keyof CsfColorPalette,
  },
};

const CsfFormInputView = (props: CsfFormInputViewProps): JSX.Element => {
  const { label, hint, errors, gap, ...viewProps } = props;
  const id = testID(props.testID);
  return (
    <CsfView {...CsfFormInputViewStyles.outerView} testID={id()}>
      <CsfView flexDirection="row" gap={4} justify="flex-start" align="center">
        {label && (
          <CsfText {...CsfFormInputViewStyles.labelText} testID={id('label')}>
            {label}
          </CsfText>
        )}
      </CsfView>
      <CsfView gap={gap === 0 ? gap : gap || 12} {...viewProps}>
        {props.children}
      </CsfView>
      <CsfInputDetails
        errors={errors == false ? [] : errors}
        hint={hint}
        testID={id('details')}
      />
    </CsfView>
  );
};

export default CsfFormInputView;