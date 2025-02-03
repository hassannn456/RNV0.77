import { LayoutChangeEvent } from 'react-native'
import { getDeviceNameSync } from 'react-native-device-info'

/**
 * Misc utility for debugging control positions
 *
 * Example:
 *
 * ```
 * <CsfView onLayout={debugPrintLayout('WindowDriverFront')}>
 *     {...}
 * </CsfView>
 * ```
 */
export const debugPrintLayout = (
  id: string,
): ((event: LayoutChangeEvent) => void) => {
  return (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout
    const name = getDeviceNameSync()
    console.log(`${name} - ${id}: (${x}, ${y}) @ (${width}, ${height})`)
  }
}
