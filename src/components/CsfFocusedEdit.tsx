/* eslint-disable eol-last */
import React, { useLayoutEffect } from 'react';
import {
  StatusBar,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  Platform,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { CsfColorPalette, csfThemes, useCsfColors } from './useCsfColors';
import CsfView, { CsfViewProps } from './CsfView';
import { CsfPageStyles } from './CsfPage';
import { useAppNavigation } from '../Controller';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { testID } from './utils/testID';
import { CsfScrollView, CsfScrollViewProps } from './CsfScrollView';

export interface CsfFocusedEditProps extends CsfViewProps, CsfScrollViewProps {
  title?: string
  noScroll?: boolean
  stickyHeader?: () => JSX.Element
  stickyFooter?: () => JSX.Element
}

const defaultProps: CsfFocusedEditProps = {
  handleScroll: () => { },
  throttle: 0,
  bg: 'background',
  noScroll: false,
};

export const CsfFocusedEditStyles = StyleSheet.create({
  contentView: { height: '100%' },
});

/**
 * Update navigation bar to look like CsfFocusedEdit (dark top bar)
 * without including keyboard avoidance, scroll views or safe area management.
 *
 * Most consumers will want to pass { headerTitle }
 **/
export const useCsfFocusedAppearance = (
  options: Partial<NativeStackNavigationOptions>,
): void => {
  const navigation = useAppNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: undefined,
      headerStyle: { backgroundColor: csfThemes.dark.backgroundSecondary },
      headerTintColor: csfThemes.dark.button,
      headerTitleStyle: {
        color: csfThemes.dark.copyPrimary,
      },
      ...options,
    });
  });
};

/** Page level view. */
const CsfFocusedEdit = (props: CsfFocusedEditProps): JSX.Element => {
  const {
    bg,
    noScroll,
    title,
    stickyFooter,
    stickyHeader,
    handleScroll,
    throttle,
    children,
  } = { ...defaultProps, ...props };
  const { colors } = useCsfColors();
  const isDarkMode = useColorScheme() === 'dark';
  useCsfFocusedAppearance({ headerTitle: title });
  const backgroundStyle: ViewStyle = {
    backgroundColor: colors[bg as keyof CsfColorPalette],
  };
  const isIOSDevice = Platform.OS == 'ios';
  const screenHeight = Dimensions.get('window').height;
  const id = testID(props.testID);

  return (
    <SafeAreaView style={backgroundStyle} testID={id('safeArea')}>
      <StatusBar
        barStyle={!isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.dark}
      />
      <KeyboardAvoidingView
        // link to documentation about behavior - https://reactnative.dev/docs/keyboardavoidingview.html#behavior
        behavior={isIOSDevice ? 'padding' : 'height'}
        keyboardVerticalOffset={
          isIOSDevice ? screenHeight * 0.1 : screenHeight * 0.16
        }
        testID={id('keyboardView')}>
        {noScroll ? (
          <CsfView style={CsfPageStyles.contentView} bg={bg} testID={id()}>
            {stickyHeader && stickyHeader()}
            {children}
            {stickyFooter && stickyFooter()}
          </CsfView>
        ) : (
          <CsfView style={CsfPageStyles.contentView} bg={bg} testID={id()}>
            {stickyHeader && stickyHeader()}
            <CsfScrollView handleScroll={handleScroll} throttle={throttle}>
              {children}
            </CsfScrollView>
            {stickyFooter && stickyFooter()}
          </CsfView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default CsfFocusedEdit;