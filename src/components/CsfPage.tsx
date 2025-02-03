import React from 'react';
import {
  StatusBar,
  KeyboardAvoidingView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { CsfColorPalette, useCsfColors } from './useCsfColors';
import CsfView, { CsfViewProps } from './CsfView';
import { CsfScrollView, CsfScrollViewProps } from './CsfScrollView';

import { testID } from './utils/testID';
export interface CsfPageProps extends CsfViewProps, CsfScrollViewProps {
  title?: string
  /**
   * Whether navigation shows header.
   *
   * Default is true. Must match screen options in controller.
   **/
  headerShown?: boolean
  noScroll?: boolean
  stickyHeader?: () => JSX.Element
  stickyFooter?: () => JSX.Element
}

const defaultProps: CsfPageProps = {
  handleScroll: () => { },
  throttle: 0,
  bg: 'background',
  noScroll: false,
  headerShown: true,
};

export const CsfPageStyles = StyleSheet.create({
  contentView: { height: '100%' },
});

/** Page level view. */
const CsfPage = (props: CsfPageProps): JSX.Element => {
  const {
    bg,
    noScroll,
    stickyFooter,
    stickyHeader,
    handleScroll,
    throttle,
    isLoading,
    headerShown,
    children,
  } = { ...defaultProps, ...props };
  const { colors } = useCsfColors();
  const backgroundStyle: ViewStyle = {
    backgroundColor: colors[bg as keyof CsfColorPalette],
  };
  const safeAreaEdges = [
    stickyHeader || headerShown ? '' : 'top',
    stickyFooter ? '' : 'bottom',
  ].filter(e => e) as Edge[];

  const id = testID(props.testID);
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={backgroundStyle}
      testID={id('safeArea')}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors[bg as keyof CsfColorPalette]}
      />
      {!isLoading ? (
        <KeyboardAvoidingView behavior="height" testID={id('keyboardView')}>
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
      ) : (
        <CsfView height={'100%'} align="center" testID={id('loading')}>
          <CsfActivityIndicator />
        </CsfView>
      )}
    </SafeAreaView>
  );
};

export default CsfPage;