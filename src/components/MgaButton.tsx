/* eslint-disable curly */
import React from 'react';
import CsfButton, { CsfButtonProps } from './CsfButton';
import useTracking, { Evars } from './useTracking';
import { testID } from './utils/testID';
export interface MgaButtonProps extends CsfButtonProps {
  trackingId?: string
  trackingVars?: Evars
}

const MgaButton: React.FC<MgaButtonProps> = (
  props: MgaButtonProps,
): JSX.Element => {
  const { trackButton } = useTracking();
  const { onPress, ...rest } = props;

  function handlePress() {
    if (onPress) {
      if (props.trackingId)
        trackButton({
          title: props.title,
          trackingId: props.trackingId,
          trackingVars: props?.trackingVars,
        });
      onPress();
    }
  }

  // if we have a tracking id, we can use it to generate a testID
  const derivedTestID = testID(props?.testID || props?.trackingId);

  return <CsfButton {...rest} testID={derivedTestID()} onPress={handlePress} />;
};

export default MgaButton;
