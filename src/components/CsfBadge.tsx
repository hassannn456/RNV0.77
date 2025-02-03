/* eslint-disable eol-last */
import React from 'react';
import CsfView, { CsfViewProps } from './CsfView';
import CsfText, { CsfTextProps } from './CsfText';

const CsfBadge: React.FC<
  CsfViewProps & { textProps?: CsfTextProps }
> = props => {
  const { textProps, ...viewProps } = props;
  return (
    <CsfView justify="center" pl={1} {...viewProps}>
      <CsfText variant="heading" color="error" {...textProps}>
        •
      </CsfText>
    </CsfView>
  );
};

export default CsfBadge;