import React from 'react'
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
} from 'react-native'

export const CsfPressableStyles = StyleSheet.create({
  centerContent: { alignItems: 'center', justifyContent: 'center' },
  minimumSize: { minWidth: 44, minHeight: 44 },
})

export type CsfPressableProps = PressableProps & {
  /**
   *
   * NOTE: When using onPress inside CsfPressable,
   * the opacity transition (1 -> 0.5) causes a render pause
   * that can result in multiple taps registering.
   *
   * When pushing screens from CsfPressable,
   * use idempotent calls like pushIfNotTop() over navigation.push()
   */
  onPress?: null | ((event: GestureResponderEvent) => void) | undefined
  flex?: number
  pressedOpacity?: number
}

const CsfPressable = (props: CsfPressableProps): JSX.Element => {
  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole || 'button'}
      testID={props.testID}
      style={({ pressed }) => [
        {
          opacity: pressed ? props.pressedOpacity || 0.5 : 1,
        },
        props.style,
      ]}>
      {props.children}
    </Pressable>
  )
}

export default CsfPressable
