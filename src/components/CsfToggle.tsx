import React from 'react'
import { useCsfColors } from './useCsfColors'
import CsfText from './CsfText'
import CsfView from './CsfView'
import CsfPressable, { CsfPressableStyles } from './CsfPressable'
import CsfCheckBoxProps, { CsfCheckBoxDefaultProps } from './CsfCheckbox'
import CsfActivityIndicator from './CsfActivityIndicator'
import CsfFormInputView from './CsfForm/CsfFormInputView'
import { AccessibilityRole } from 'react-native'

export const CsfToggleDefaultProps = {
  ...CsfCheckBoxDefaultProps,
  small: false,
}

const CsfToggle = (
  props: CsfCheckBoxProps & { small?: boolean; control?: boolean },
): JSX.Element => {
  const { colors } = useCsfColors()
  const {
    checked,
    editable,
    isLoading,
    onChangeValue,
    small,
    label,
    errors,
    hint,
    children,
    control,
    ...viewProps
  } = {
    ...CsfToggleDefaultProps,
    ...props,
  }
  const onPress =
    editable && onChangeValue
      ? () => {
        onChangeValue ? onChangeValue(!checked) : undefined
      }
      : undefined
  const backgroundColor = (() => {
    if (!checked) return colors.backgroundSecondary
    else return colors.button
  })()
  const width = small ? 32 : 48
  const height = width / 2
  const dot = small ? 12 : 16

  const accessibilityProps = {
    accessibilityRole: 'togglebutton' as AccessibilityRole,
    accessibilityState: { checked, busy: isLoading },
    accessibilityLabel: props.label as string | undefined,
  }

  const toggle = () => {
    if (isLoading) {
      return (
        <CsfActivityIndicator
          size={small ? 'small' : 'large'}
          {...accessibilityProps}
        />
      )
    } else {
      return (
        <CsfView
          {...accessibilityProps}
          style={{
            alignItems: 'center',
            borderRadius: height / 2,
            borderWidth: checked ? 0 : 1,
            justifyContent: checked ? 'flex-end' : 'flex-start',
            flexDirection: 'row',
            width,
            height,
            paddingHorizontal: (height - dot) / 2,
            backgroundColor: backgroundColor,
            borderColor: colors.inputBorder,
          }}>
          <CsfView
            style={{
              borderRadius: dot / 2,
              width: dot,
              height: dot,
              backgroundColor: checked ? colors.light : colors.inputBorder,
            }}
          />
        </CsfView>
      )
    }
  }
  const body = (
    <CsfView
      minHeight={44}
      flexDirection={props.flexDirection ?? 'row'}
      width={props.flexDirection == 'column' ? undefined : '100%'}
      align="center"
      style={{ alignItems: 'center' }}
      gap={12}>
      {toggle()}
      {label && (
        <CsfView>
          <CsfText wrap={!!props.wrap}>{label}</CsfText>
        </CsfView>
      )}
      {children && <CsfView gap={4}>{children}</CsfView>}
    </CsfView>
  )
  return control ? (
    <CsfPressable onPress={onPress}>{toggle()}</CsfPressable>
  ) : (
    <CsfFormInputView
      errors={errors}
      hint={hint}
      style={[
        !props.inline && CsfPressableStyles.minimumSize,
        { opacity: editable ? 1 : 0.5 },
      ]}
      {...viewProps}>
      {onPress && !isLoading ? (
        <CsfPressable onPress={onPress}>{body}</CsfPressable>
      ) : (
        body
      )}
    </CsfFormInputView>
  )
}


export default CsfToggle;