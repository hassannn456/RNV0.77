/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { CsfButtonProps } from './CsfButton'
import CsfView from './CsfView'
import { Dimensions, GestureResponderEvent } from 'react-native'
import BatteryHomeIcon from '../../content/svg/pumps/phev_pump.svg'
import ResButtonLight from '../../content/svg/remote-start-button-light.svg'
import { testID } from './utils/testID'
import CsfPressable from './CsfPressable'
import CsfAppIcon from './CsfAppIcon'
import CsfText from './CsfText'
export interface MgaButtonProps extends CsfButtonProps {
  trackingId?: string
}

// TODO:AG:20231213 - request charge svg icon from CL

export const MgaDashboardButton: React.FC<MgaButtonProps> = (
  props: MgaButtonProps,
): JSX.Element => {
  const { onPress } = props
  function handlePress(event?: GestureResponderEvent) {
    if (onPress) {
      onPress(event)
    }
    //   TODO:KB:20230215 Adding optional payloads in the track function to pass custom data as needed.
  }

  const screenDimensions = Dimensions.get('screen')
  const tiny = screenDimensions.width < 375

  /*  
  if redesign preserves the hideous blue lozenge, it should scale appropriately for different viewports. 
  TODO:AG:20240607 -- make sure redesign requirements include facilitating accessibility features
  */
  const size = tiny ? 160 : 180
  const derivedTestID = testID(props?.testID || props?.trackingId)

  return (
    <CsfPressable
      onPress={handlePress}
      testID={derivedTestID()}
      style={{
        width: size,
        height: size,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }}>
      <ResButtonLight
        width={size}
        height={size}
        style={{ position: 'absolute', zIndex: 0 }}
        testID={derivedTestID('ResButton')}
      />

      <CsfAppIcon
        icon={props.icon}
        color="light"
        size="lg"
        testID={derivedTestID('icon')}
      />
      <CsfText
        variant="button2"
        align="center"
        color="light"
        testID={derivedTestID('title')}>
        {props.title}
      </CsfText>
    </CsfPressable>
  )
}

export const MgaBatteryButton: React.FC<MgaButtonProps> = (
  props: MgaButtonProps,
): JSX.Element => {
  const box = { top: 0, left: 0, width: 261, height: 134 }
  const { title, onPress } = props
  return (
    <CsfPressable onPress={onPress}>
      <CsfView style={{ flex: 0 }}>
        <BatteryHomeIcon
          style={{
            zIndex: 1,
            position: 'relative',
            ...box,
          }}
        />
        <CsfView
          flexDirection="column"
          justify="center"
          align="center"
          style={{
            zIndex: 2,
            position: 'absolute',
            ...box,
          }}>
          <CsfAppIcon color="light" icon={'Bolt'} />
          {title && (
            <CsfText color="light" variant="button">
              {title}
            </CsfText>
          )}
        </CsfView>
      </CsfView>
    </CsfPressable>
  )
}
