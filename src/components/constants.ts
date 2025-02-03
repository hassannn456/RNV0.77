import { Platform, ViewStyle } from 'react-native';

export const boxShadow = (
  xOffset: number,
  yOffset: number,
  color: string,
  shadowOpacity: number,
  shadowRadius: number,
  elevation: number,
): ViewStyle => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: { width: xOffset, height: yOffset },
      shadowOpacity,
      shadowRadius,
    };
  }
  return {
    elevation,
    shadowColor: color,
  };
};
