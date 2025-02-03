import React from 'react'
import { CsfView } from './CsfView'
import { CsfDropdownProps } from './CsfSelect'
import { CsfPressable } from './CsfPressable'
import { CsfText } from './CsfText'
import { useCsfColors } from './useCsfColors'
import { testID } from './utils/testID'

export const CsfSegmentTabBar: React.FC<CsfDropdownProps> = props => {
  const { colors } = useCsfColors()
  const options = props.options ?? []
  const value = props.value
  const id = testID(props.testID || 'SegmentTabBar')
  return (
    <CsfView flexDirection="row" minHeight={44} testID={id()}>
      {options.map((option, index) => (
        <CsfView
          key={option.value ?? ''}
          flex={1}
          align="center"
          justify="center"
          testID={id(`options-${index}`)}
          style={
            value == option.value
              ? { borderBottomColor: colors.copyPrimary, borderBottomWidth: 3 }
              : {
                  borderBottomColor: colors.clear,
                  borderBottomWidth: 3,
                }
          }>
          <CsfPressable
            testID={id('button')}
            onPress={() =>
              props.onSelect && props.onSelect(option.value ?? '')
            }>
            {option.view ? (
              option.view()
            ) : (
              <CsfText variant="subheading">{option.label}</CsfText>
            )}
          </CsfPressable>
        </CsfView>
      ))}
    </CsfView>
  )
}
