import React from 'react';
import CsfButton from './CsfButton';
import CsfSimpleAlert from './CsfSimpleAlert';
import promptAlert, { CsfAlertAction } from './CsfAlert';

interface CsfInfoButtonProps {
  title: string;
  text?: string;
  actions?: CsfAlertAction[];
  handlePrompt?: (v: string) => void;
  testID?: string;
}

const CsfInfoButton: React.FC<CsfInfoButtonProps> = ({
  title,
  text,
  actions,
  handlePrompt,
  testID,
}) => {
  const onPress = async () => {
    if (actions?.length) {
      const result = await promptAlert(title, text, actions);
      if (handlePrompt) { handlePrompt(result); }
    } else {
      CsfSimpleAlert(title, text, { type: 'information' });
    }
  };

  return (
    <CsfButton
      variant="inlineLink"
      icon="Information"
      onPress={onPress}
      testID={testID}
    />
  );
};

export default CsfInfoButton;
