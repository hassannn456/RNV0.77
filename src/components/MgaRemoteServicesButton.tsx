/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import CsfAppIcon from './CsfAppIcon';
import CsfText from './CsfText';
import { CsfColorPalette } from './useCsfColors';
import CsfPressable, { CsfPressableProps } from './CsfPressable';
import CsfView from './CsfView';
import { CsfIcon } from '../../core/res/assets/icons';
import useTracking from './useTracking';
import { Dimensions } from 'react-native';
import { testID } from './utils/testID';

export interface MgaRemoteServicesButtonProps extends CsfPressableProps {
  title?: string;
  icon?: CsfIcon;
  vertical?: boolean;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  inline?: boolean;
  variant?: 'dashboard';
  borderless?: boolean;
  bg?: keyof CsfColorPalette;
  maxHeight?: number | `${number}%`;
  trackingId?: string;
}

const MgaRemoteServicesButton = (props: MgaRemoteServicesButtonProps): JSX.Element => {
  const screenDimensions = Dimensions.get('screen');
  const tiny = screenDimensions.width < 375;
  const { trackButton } = useTracking();
  const textColor: keyof CsfColorPalette = 'copyPrimary';
  const hasIcon = !!props.icon;

  // TODO:VV:20240722 - if we have a tracking id, we can use it to generate a testID.
  // Create a one-liner util
  const derivedTestID = testID(props?.testID || props?.trackingId);

  const iconToRender = hasIcon && (
    <CsfAppIcon
      icon={props.icon}
      color={'button'}
      size={'md'}
      testID={derivedTestID('icon')}
    />
  );

  return (
    <CsfPressable
      {...props}
      onPress={e => {
        if (props.onPress) { props.onPress(e); }
        if (props.trackingId) { trackButton({ trackingId: props.trackingId, title: props.title }); }
      }}
      style={{ flex: 1 }}>
      <CsfView
        bg={props.bg}
        borderColor={props.variant === 'dashboard' ? 'button' : 'rule'}
        borderWidth={props.borderless ? 0 : 1}
        borderRadius={props.variant === 'dashboard' ? 4 : 8}
        gap={12}
        style={{
          alignItems: 'center',
          justifyContent:
            props.variant === 'dashboard' ? 'center' : 'space-evenly',
        }}
        height={'100%'}
        minHeight={44}
        testID={derivedTestID()}
        flexDirection={props.vertical ? 'column' : 'row'}>
        {hasIcon && <CsfView justify="center">{iconToRender}</CsfView>}
        {props.title && (
          <CsfText
            testID={derivedTestID('label')}
            color={textColor}
            /* tiny text is TERRIBLE and we should never use it but this design breaks on smaller viewports.
            TODO:AG:20240607 -- make sure redesign requirements include facilitating accessibility features
            */
            variant={
              tiny
                ? 'tiny'
                : props.vertical || props.variant == 'dashboard'
                  ? 'button2'
                  : 'button'
            }
            align="center">
            {props.title}
          </CsfText>
        )}
      </CsfView>
    </CsfPressable>
  );
};

export default MgaRemoteServicesButton;
