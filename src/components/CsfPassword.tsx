import React, { useState } from 'react';
import { testID } from './utils/testID';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';
import Eye from '../../core/res/assets/svg/mga/eye';
import Eye_fill from '../../core/res/assets/svg/mga/eye_fill';

const CsfPassword: React.FC<SharedTextInputProps> = props => {
  const id = testID(props.testID);
  const [hide, setHide] = useState(true);
  return (
    <CsfTextInput
      secureTextEntry={hide}
      autoComplete="password"
      trailingAccessory={
        hide ? (
          <Eye />
        ) : (
          <Eye_fill />
        )
      }
      trailingAccessoryOnPress={() => setHide(!hide)}
      {...props}
    />
  );
};

export default CsfPassword;
