// React Native controls often have default values for their properties
// but do not have a way to access that default.
// Collect commonly used wrappers here.

/** https://reactnative.dev/docs/textinput#editable */
export const getEditable = (props: {
  editable?: boolean
  disabled?: boolean
}): boolean => {
  return props.editable ?? !props.disabled ?? true
}
