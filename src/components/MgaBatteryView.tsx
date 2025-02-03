/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useCsfColors } from './useCsfColors';

export interface MgaBatteryViewProps extends ViewProps {
  batteryPercent?: number;
}

export const MgaBatteryView: React.FC<MgaBatteryViewProps> = ({
  batteryPercent = 0,
  ...viewProps
}) => {
  const { colors } = useCsfColors();

  const ticks = [
    5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  ];

  return (
    <View
      {...viewProps}
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        },
        viewProps.style,
      ]}
    >
      <View
        style={[
          {
            alignSelf: 'center',
            flexDirection: 'row',
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.rule,
            borderWidth: 4,
            borderRadius: 4,
            gap: 4,
            paddingHorizontal: 4,
          },
          viewProps.style,
        ]}
      >
        {ticks.map(pct => (
          <View
            key={pct}
            style={{
              borderRadius: 4,
              height: 40,
              width: 8,
              marginVertical: 5,
              backgroundColor: batteryPercent >= pct ? colors.success : colors.rule,
            }}
          />
        ))}
      </View>
      <View
        style={{
          backgroundColor: colors.rule,
          width: 5,
          height: 20,
          borderTopRightRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </View>
  );
};

export default MgaBatteryView;
