import React from 'react'
import { CsfView, CsfViewProps } from './CsfView'
import { CsfPressable } from './CsfPressable'
import { CsfDot } from './CsfDot'
import { CsfColorPalette } from './useCsfColors'
import { CsfText } from './CsfText'

export interface CsfProgressDotsProps extends CsfViewProps {
  index: number
  count: number
  variant?: 'classic' | 'midnight' | 'outline'
  onDotPress?: (index: number) => void
}

export interface CsfProgressNumbersProps extends CsfViewProps {
  index: number
  count: number
  variant?: 'background' | 'backgroundSecondary'
  onDotPress?: (index: number) => void
}

export const CsfProgressDots: React.FC<CsfProgressDotsProps> = ({
  index,
  count,
  variant,
  onDotPress,
}): JSX.Element => {
  const outline = variant == 'outline'
  const activeColor: keyof CsfColorPalette =
    variant == 'classic' ? 'button' : 'copyPrimary'
  const defaultColor: keyof CsfColorPalette = outline ? activeColor : 'rule'

  return (
    <CsfView flexDirection="row" justify="center" p={8}>
      {Array.from({ length: count }, (_, i) => {
        const dot = (
          <CsfView align="center" justify="center" minHeight={44} minWidth={32}>
            <CsfDot
              color={
                outline ? activeColor : i == index ? activeColor : defaultColor
              }
              size={8}
              outline={outline && index != i}
            />
          </CsfView>
        )

        return i != index && onDotPress ? (
          <CsfPressable
            key={i}
            onPress={() => {
              onDotPress && onDotPress(i)
            }}>
            {dot}
          </CsfPressable>
        ) : (
          <CsfView key={i}>{dot}</CsfView>
        )
      })}
    </CsfView>
  )
}

export const CsfProgressNumbers: React.FC<CsfProgressNumbersProps> = ({
  index,
  count,
  variant,
  onDotPress,
}): JSX.Element => {
  const defaultColor: keyof CsfColorPalette =
    variant == 'background' ? 'background' : 'backgroundSecondary'
  const activeColor: keyof CsfColorPalette = 'button'
  const textColor = 'copyPrimary'
  const activeTextColor = 'light'

  return (
    <CsfView flexDirection="row" justify="center" p={8}>
      {Array.from({ length: count }, (_, i) => {
        const active = i == index
        const dot = (
          <CsfView align="center" justify="center" minHeight={44} minWidth={36}>
            <CsfView
              width={24}
              height={24}
              align="center"
              justify="center"
              bg={active ? activeColor : defaultColor}
              borderRadius={12}>
              <CsfText
                align="center"
                color={active ? activeTextColor : textColor}>
                {i + 1}
              </CsfText>
            </CsfView>
          </CsfView>
        )

        return i != index && onDotPress ? (
          <CsfPressable
            key={i}
            onPress={() => {
              onDotPress && onDotPress(i)
            }}>
            {dot}
          </CsfPressable>
        ) : (
          <CsfView key={i}>{dot}</CsfView>
        )
      })}
    </CsfView>
  )
}
