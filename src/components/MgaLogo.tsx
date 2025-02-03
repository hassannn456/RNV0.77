import React, { useState } from 'react';
import { SvgProps } from 'react-native-svg';
import { Pressable } from 'react-native';
import MainLogo from '../../content/svg/Logo';

/**
 * Scalable version of MySubaru Logo for login page and navigation title.
 *
 * SVG is boxed to 240x83. Default size is 50% scaled.
 **/
const MgaLogo: React.FC<SvgProps> = props => {
  const [pressed, setPressed] = useState(false);
  if (props.onPress) {
    return (
      <Pressable
        onPress={props.onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole={props.accessibilityRole || 'image'}>
        <MainLogo
          {...props}
        />
      </Pressable>
    );
  } else {
    return (
      <MainLogo
        {...props}
      />
    );
  }
};

export default MgaLogo;
