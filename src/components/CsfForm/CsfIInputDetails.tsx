import React from 'react';
import { hasErrors, wrapErrors } from './formUtils';
import { testID } from '../utils/testID';
import CsfText from '../CsfText';

export interface CsfDetailsProps {
  /** prop of the hint */
  hint?: string
  /** prop to display error/errors */
  errors?: string | string[]
  testID?: string
};

const CsfInputDetails = (props: CsfDetailsProps): JSX.Element => {
  const id = testID(props.testID);
  const errors = wrapErrors(props.errors);
  const renderError = hasErrors(errors);
  return renderError || props.hint ? (
    <CsfText
      color={renderError ? 'error' : 'copySecondary'}
      variant="caption"
      testID={id(renderError ? 'error' : 'hint')}>
      {renderError ? errors.join('\n') : props.hint}
    </CsfText>
  ) : (
    <></>
  );
};

export default CsfInputDetails;
