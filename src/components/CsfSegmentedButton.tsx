import React, { Fragment } from 'react'
import { CsfRule } from './CsfRule'
import { CsfView } from './CsfView'
import { CsfPressable } from './CsfPressable'
import { CsfAppIcon } from './CsfAppIcon'
import { CsfRadioGroupProps } from './CsfRadioGroup'
import { CsfText } from './CsfText'
import { useCsfColors } from './useCsfColors'
import { CsfFormInputViewStyles } from './CsfForm/CsfFormInputView'
import { testID } from './utils/testID'

export const CsfSegmentedButton: React.FC<
  CsfRadioGroupProps & { iconOnly?: boolean }
> = props => {
  const { label, disabled, options, value, onChange, iconOnly } = props
  const { colors } = useCsfColors()
  const id = testID(props.testID)
  return (
    <CsfView {...CsfFormInputViewStyles.outerView} testID={id()}>
      {label && (
        <CsfText variant="caption" align="center" testID={id('label')}>
          {label}
        </CsfText>
      )}
      <CsfView
        borderWidth={1}
        width={'100%'}
        borderColor="inputBorder"
        borderRadius={20}
        flexDirection="row"
        justify="space-evenly"
        bg="backgroundSecondary">
        {options &&
          options.map((option, i) => (
            <Fragment key={i}>
              {i != 0 && <CsfRule orientation="vertical" color="inputBorder" />}
              <CsfPressable
                style={{
                  flex: 1,
                  borderTopRightRadius: i + 1 == options.length ? 22 : 0,
                  borderBottomRightRadius: i + 1 == options.length ? 22 : 0,
                  borderTopLeftRadius: i == 0 ? 22 : 0,
                  borderBottomLeftRadius: i == 0 ? 22 : 0,
                  backgroundColor:
                    value == option.value ? colors.highlightInfo : undefined,
                }}
                aria-label={option.label}
                key={i}
                onPress={() => (onChange ? onChange(option.value) : null)}
                disabled={disabled}>
                <CsfView
                  height={40}
                  ph={16}
                  align="center"
                  flexDirection="row"
                  justify="space-around">
                  {option.icon && <CsfAppIcon icon={option.icon} />}
                  {option.label && !iconOnly && (
                    <CsfText
                      testID={id(`option-${i}`)}
                      variant={value == option.value ? 'button3' : 'button2'}>
                      {option.label}
                    </CsfText>
                  )}
                </CsfView>
              </CsfPressable>
            </Fragment>
          ))}
      </CsfView>
    </CsfView>
  )
}
