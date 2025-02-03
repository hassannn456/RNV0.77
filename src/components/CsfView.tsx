/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ViewProps, ViewStyle, View, DimensionValue } from 'react-native';
import { CsfColorPalette, csfThemes, useCsfColors } from './useCsfColors';
import CsfActivityIndicator from './CsfActivityIndicator';
import { Dimension } from './types';
import { CsfThemeContext } from './CsfThemeContext';
/** Convenience properties for flex layouts. */
interface MyBorderProps {
  borderColor?: keyof CsfColorPalette
  borderRadius?: Dimension
  borderWidth?: number
}

/** Translate from flex props to react native styles */
export const borderStyle = (props: MyBorderProps): ViewStyle => {
  const borderRadius = props.borderRadius || 0;
  return {
    borderRadius: borderRadius,
    borderWidth: props.borderWidth,
  };
};

/** Convenience properties for box layouts. */
export interface CsfBoxProps {
  m?: Dimension
  mv?: Dimension
  mh?: Dimension
  mt?: Dimension
  ml?: Dimension
  mb?: Dimension
  mr?: Dimension
  p?: Dimension
  pv?: Dimension
  ph?: Dimension
  pt?: Dimension
  pl?: Dimension
  pb?: Dimension
  pr?: Dimension
}

/** Translate from box props to react native styles */
export const boxStyle = (props: CsfBoxProps): ViewStyle => {
  return {
    marginTop: props.mt ?? props.mv ?? props.m,
    marginBottom: props.mb ?? props.mv ?? props.m,
    marginLeft: props.ml ?? props.mh ?? props.m,
    marginRight: props.mr ?? props.mh ?? props.m,
    paddingTop: props.pt ?? props.pv ?? props.p,
    paddingBottom: props.pb ?? props.pv ?? props.p,
    paddingLeft: props.pl ?? props.ph ?? props.p,
    paddingRight: props.pr ?? props.ph ?? props.p,
  };
};

/** Convenience properties for color picking. */
export interface ColorProps {
  bg?: keyof CsfColorPalette
  color?: keyof CsfColorPalette
}

export type CsfFlexDirection =
  | 'row'
  | 'column'
  | 'row-reverse'
  | 'column-reverse'

/** Convenience properties for flex layouts. **/
export interface CsfFlexProps {
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  grow?: number
  justify?:
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  flex?: number
  /** Using 'flexDirection' because of name clash */
  flexDirection?: CsfFlexDirection
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | undefined
  gap?: Dimension
}

/** Translate from flex props to react native styles */
export const flexStyle = (props: CsfFlexProps): ViewStyle => {
  return {
    alignItems: props.align,
    flexDirection: props.flexDirection,
    flexGrow: props.grow,
    flexWrap: props.wrap,
    justifyContent: props.justify,
  };
};
/** Convenience properties for spacing layouts. */
export interface MySizeProps {
  minHeight?: DimensionValue
  height?: DimensionValue
  maxHeight?: DimensionValue
  minWidth?: DimensionValue
  width?: DimensionValue
  maxWidth?: DimensionValue
}

/** Types of edges (to apply padding) */
export type Edge = 'top' | 'bottom' | 'left' | 'right'

/** Translate from flex props to react native styles */
export const sizeStyle = (props: MySizeProps): ViewStyle => {
  return {
    minHeight: props.minHeight,
    height: props.height,
    maxHeight: props.maxHeight,
    minWidth: props.minWidth,
    width: props.width,
    maxWidth: props.maxWidth,
  };
};
export interface CsfViewProps
  extends ViewProps,
  CsfBoxProps,
  MyBorderProps,
  ColorProps,
  CsfFlexProps,
  MySizeProps {
  isLoading?: boolean
  theme?: 'dark' | 'light'
  trackingId?: 'string'
  /**
   * Include a standard edge inset for content.
   *
   * Defaults to false. Use only for outermost views. Separate from Page control for notification bars.
   *
   * References:
   * - https://developer.apple.com/design/human-interface-guidelines/layout#iOS-iPadOS-safe-areas
   * - https://m3.material.io/foundations/layout/understanding-layout/spacing#38a538d7-991f-4c39-8449-195d32caf397
   **/
  edgeInsets?: boolean | Edge[]
  standardSpacing?: boolean
}

/** View with flex, padding and spacing properties. */
const CsfView = (props: CsfViewProps): JSX.Element => {
  const { colors } = useCsfColors();

  const themeColors: CsfColorPalette = props.theme
    ? csfThemes[props.theme]
    : colors;
  const colorStyle = {
    backgroundColor: props.bg ? themeColors[props.bg] : undefined,
    borderColor: props.borderColor ? themeColors[props.borderColor] : undefined,
  };
  if (props.isLoading == true) {
    return (
      <CsfView
        edgeInsets={props.edgeInsets}
        flexDirection="column"
        style={{ flex: 1 }}
        justify="center"
        theme={props.theme}>
        <CsfActivityIndicator size="large" />
      </CsfView>
    );
  }
  const edgeInsets: ViewStyle | undefined =
    props.edgeInsets == false || props.edgeInsets == undefined
      ? undefined
      : props.edgeInsets == true
        ? { marginHorizontal: 20, marginVertical: 20 }
        : {
          marginTop: props.edgeInsets.includes('top') ? 20 : undefined,
          marginBottom: props.edgeInsets.includes('bottom') ? 20 : undefined,
          marginLeft: props.edgeInsets.includes('left') ? 20 : undefined,
          marginRight: props.edgeInsets.includes('right') ? 20 : undefined,
        };
  return (
    <View
      {...props}
      gap={props.gap}
      style={[
        borderStyle(props),
        boxStyle(props),
        colorStyle,
        flexStyle(props),
        sizeStyle(props),
        edgeInsets,
        props.standardSpacing && {
          gap: 16,
        },
        props.style,
      ]}>
      {props.theme ? (
        <CsfThemeContext.Provider value={props.theme}>
          {props.children}
        </CsfThemeContext.Provider>
      ) : (
        props.children
      )}
    </View>
  );
};


export default CsfView