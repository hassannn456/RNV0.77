/* eslint-disable eqeqeq */
/* eslint-disable curly */
import {useContext, useEffect, useState} from 'react';
import {Appearance, ColorSchemeName, StatusBarStyle} from 'react-native';
import {CsfThemeContext, CsfThemeContextType} from './CsfThemeContext';
import {has} from '../features/menu/rules';

// Colors are from page 17 of style guide
// NOTE: "Light Background" fails ADA checker (https://adasitecompliance.com/ada-color-contrast-checker/)

export interface CsfColorPalette {
  background: string;
  backgroundSecondary: string;
  clear: string;
  copyPrimary: string;
  copySecondary: string;
  rule: string;
  error: string;
  highlightError: string;
  button: string;
  buttonActive: string;
  highlightInfo: string;
  inputBorder: string;
  inputBorderActive: string;
  success: string;
  highlightSuccess: string;
  warning: string;
  highlightWarning: string;
  /** Background color for disabled elements */
  disabled: string;
  nyi: string;
  light: string;
  dark: string;
  statusBar: StatusBarStyle;
}

export type CsfColorSettings = {colors: CsfColorPalette};

/** Master Component Library - Color Constants */

const mclMidnight = '#1D252C';
const mclWhite = '#FFFFFF';
const mclLightBackground = '#F7F8F9';
const mclGreyText = '#5C6163';
const mclLightGreyText = '#B7BCC2';
const mclBlue = '#1971D4';
const mclLightBlue = '#3A8EEE';
const mclHRAndBorderGrey = '#E1E1E1';
const mclDarkBorder = '#3E434D';
const mclBlueHighlight = '#F5F9FF';
const mclGreenHighlight = '#F2F9F1';
const mclRedHighlight = '#fdf6f6';
const mclYellowHighlight = '#FDF9EB';
const mclError = '#E22828';
const mclSuccess = '#008000';
const mclAttention = '#ECBE41';
const mclInputBorder = '#919596';

const darkTheme: CsfColorPalette = {
  background: '#000000',
  backgroundSecondary: mclMidnight,
  clear: '#00000000',
  copyPrimary: mclWhite,
  copySecondary: mclLightGreyText,
  rule: mclDarkBorder,
  inputBorder: mclInputBorder,
  inputBorderActive: mclDarkBorder,
  error: mclError, // TODO:AG:20231114: Dark mode color not provided by CL
  highlightError: mclRedHighlight, // TODO:AG:20231114: Dark mode color not provided by CL
  buttonActive: mclWhite,
  button: mclLightBlue,
  highlightInfo: mclBlueHighlight, // TODO:AG:20231114: Dark mode color not provided by CL
  success: mclSuccess, // TODO:AG:20231114: Dark mode color not provided by CL
  highlightSuccess: mclGreenHighlight, // TODO:AG:20231114: Dark mode color not provided by CL
  warning: mclAttention, // TODO:AG:20231114: Dark mode color not provided by CL
  highlightWarning: mclYellowHighlight, // TODO:AG:20231114: Dark mode color not provided by CL
  disabled: mclGreyText,
  nyi: '#470e0c',
  light: mclWhite,
  dark: '#000000', // TODO:AG:20231114: This was "darker than background black" but is now same color
  statusBar: 'light-content',
};

const lightTheme: CsfColorPalette = {
  background: mclLightBackground,
  backgroundSecondary: mclWhite,
  clear: '#00000000',
  copyPrimary: mclMidnight,
  copySecondary: mclGreyText,
  rule: mclHRAndBorderGrey,
  inputBorder: mclInputBorder,
  inputBorderActive: mclDarkBorder,
  error: mclError,
  highlightError: mclRedHighlight,
  buttonActive: '#000000',
  button: mclBlue,
  highlightInfo: mclBlueHighlight,
  success: mclSuccess,
  highlightSuccess: mclGreenHighlight,
  warning: mclAttention,
  highlightWarning: mclYellowHighlight,
  disabled: mclLightGreyText,
  nyi: '#EE9D9A',
  light: mclWhite,
  dark: mclMidnight,
  statusBar: 'dark-content',
};

type CsfThemes = {light: CsfColorPalette; dark: CsfColorPalette};
export const csfThemes: CsfThemes = {
  dark: darkTheme,
  light: lightTheme,
};
/** Dynamic version of react-native's useColorScheme.
 *
 *  Cycles on setting change. */
export const useColorSchemeDynamic = (): ColorSchemeName => {
  const darkModeSupport = has('flg:mga.darkModeSupport');
  const colorMode = darkModeSupport ? Appearance.getColorScheme() : 'light';
  const [get, set] = useState(colorMode);
  useEffect(() => {
    // @ts-ignore - Test runner can't handle event listener
    if (typeof jest != 'undefined') {
      return;
    }
    const appearanceSubscription = Appearance.addChangeListener(() => {
      if (darkModeSupport) set(Appearance.getColorScheme());
    });
    return () => appearanceSubscription.remove();
  });

  return get;
};

export const useColorContext = (): CsfThemeContextType => {
  const contextTheme = useContext(CsfThemeContext);
  const schemeTheme = useColorSchemeDynamic();
  if (contextTheme == 'system') {
    return schemeTheme === 'dark' ? 'dark' : 'light';
  } else {
    return contextTheme;
  }
};

/** React hook returning color palette */
export const useCsfColors = (): CsfColorSettings => {
  const context = useColorContext();
  return {
    colors: context === 'dark' ? darkTheme : lightTheme,
  };
};
