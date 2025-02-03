import React from 'react';
import {
  Text,
  TextProps,
  View,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { parseText, ParseTree } from '../utils/parse';
import { CsfColorPalette, useCsfColors } from './useCsfColors';
import mgaOpenURL from './utils/linking';
import { testID } from './utils/testID';
interface CSS {
  linkColor: string
}

const letterSpacing = -0.1;

export const CsfTextStyles = StyleSheet.create({
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing,
  },
  title2: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing,
  },
  title3: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing,
  },
  display: {
    fontFamily: 'Inter-Medium',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing,
  }, // options
  display2: {
    fontFamily: 'Inter-Medium',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing,
  }, // options
  display3: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing,
  }, //options
  heading: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing,
  },
  heading2: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing,
  }, // optional
  subheading: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing,
  },
  button: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 15,
    letterSpacing,
  },
  button2: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing,
  },
  button3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing,
  },
  body2: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing,
  },
  tiny: {
    // DO NOT EVER USE THIS VARIANT
    // this is kind of silly but CL didn't wan't to figure out how to accommodate browser zoom/small devices
    // TODO:AG:20240607 -- make sure redesign requirements include facilitating accessibility features

    fontFamily: 'Inter-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing,
  },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  pinButton: { fontFamily: 'Inter-Regular', fontSize: 32 },
});

export const getAccessibilityRole = (
  variant?: CsfTextVariant,
): AccessibilityRole => {
  switch (variant) {
    case 'title':
    case 'title2':
    case 'title3':
    case 'heading':
    case 'heading2':
      return 'header';
    default:
      return 'text';
  }
};

export const getMaxFontSizeMultiplier = (_variant?: CsfTextVariant): number => {
  // switch (variant) {
  //   case 'title':
  //   case 'title2':
  //   case 'title3':
  //   case 'display':
  //   case 'display2':
  //   case 'display3':
  //     return 1.1
  //   case 'heading':
  //   case 'heading2':
  //   case 'subheading':
  //     return 1.15
  //   case 'caption':
  //     return 1.25
  //   case 'button':
  //   case 'button2':
  //   case 'button3':
  //     return 1
  //   default:
  //     return 1.2
  // }
  // TODO:AG:20240414 - remove or revise depending on IRL device testing
  return 1;
};
export const renderParseTree = (tree: ParseTree, style: CSS): JSX.Element => {
  return (
    <>
      {tree.map((fragment, index) => {
        if (fragment.tag == null) {
          return <Text key={index}>{fragment.content}</Text>;
        }
        if (fragment.tag == 'a') {
          return (
            <Text
              accessibilityRole="link"
              accessibilityHint={fragment.href}
              key={index}
              onPress={() => mgaOpenURL(fragment.href)}
              style={{ color: style.linkColor }}>
              {renderParseTree(fragment.content, style)}
            </Text>
          );
        }
        if (fragment.tag == 'b') {
          return (
            <Text key={index} style={CsfTextStyles.bold}>
              {renderParseTree(fragment.content, style)}
            </Text>
          );
        }
        if (fragment.tag == 'span' || fragment.tag == 'div') {
          const styles = [];
          if (fragment.class.includes('bold')) {
            styles.push(CsfTextStyles.bold);
          }
          if (fragment.class.includes('link')) {
            styles.push({ color: style.linkColor });
          }
          return fragment.tag == 'span' ? (
            <Text key={index} style={styles}>
              {renderParseTree(fragment.content, style)}
            </Text>
          ) : (
            <View key={index}>
              <Text style={styles}>
                {renderParseTree(fragment.content, style)}
              </Text>
            </View>
          );
        }
      })}
    </>
  );
};

export type CsfTextVariant = keyof typeof CsfTextStyles

export interface CsfTextProps
  extends Omit<
    TextProps,
    | 'maxFontSizeMultiplier'
    | 'minimumFontScale'
    | 'selectionColor'
    | 'style'
    | 'textBreakStrategy'
    | 'lineBreakStrategyIOS'
  > {
  variant?: CsfTextVariant
  align?: 'right' | 'left' | 'center' | 'auto' | 'justify'
  color?: keyof CsfColorPalette
  bold?: boolean
  italic?: boolean
  /** Force text to wrap. Defaults false. Useful in various controls. */
  wrap?: boolean
  /** Show text as disabled. Used by containing controls.
   *
   * MGA-1602: iOS and Android handle opacity differently.
   * Value needs to pass down to <Text> for consistent rendering.
   **/
  disabledAppearance?: boolean
}

/* Color-aware text view */
const CsfText: React.FC<CsfTextProps> = props => {
  const { colors } = useCsfColors();
  const alignStyle = props.align ? { textAlign: props.align } : {};
  const colorStyle = props.color
    ? { color: colors[props.color] }
    : { color: colors.copyPrimary };
  const style: CSS = {
    linkColor: colors.button,
  };

  const fontStyle = props.variant
    ? CsfTextStyles[props.variant]
    : CsfTextStyles['body2'];
  return (
    <Text
      {...props}
      style={[
        alignStyle,
        colorStyle,
        fontStyle,
        props.bold && CsfTextStyles.bold,
        props.italic && CsfTextStyles.italic,
        props.wrap ? { flex: 1, flexWrap: 'wrap' } : {},
        props.disabledAppearance ? { opacity: 0.5 } : {},
      ]}
      accessibilityRole={
        props.accessibilityRole || getAccessibilityRole(props.variant)
      }
      maxFontSizeMultiplier={getMaxFontSizeMultiplier(props.variant)}
      testID={testID(props.testID)()}>
      {React.Children.map(props.children, child => {
        if (typeof child === 'string') {
          return <>{renderParseTree(parseText(child), style)}</>;
        } else {
          return <>{child}</>;
        }
      })}
    </Text>
  );
};

export default CsfText