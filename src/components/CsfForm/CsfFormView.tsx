/* eslint-disable eol-last */
import React from 'react';
import CsfTile, { CsfTileProps } from '../CsfTile';

const CsfFormView = (props: CsfTileProps): JSX.Element => {
  return <CsfTile>{props.children}</CsfTile>;
};

export default CsfFormView;