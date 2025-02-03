import { validate } from './validate'

/** Basic name (first/last) check */
export const checkName = (name: string): boolean => {
  const errors = validate(
    { name: name },
    {
      name: {
        required: true,
        alphanumericSpace: true,
        minlength: 2,
        noSpaceStart: true,
        noSpaceEnd: true,
      },
    },
  )
  if (errors?.name) {
    if (
      errors?.name.indexOf('required') > -1 ||
      errors?.name.indexOf('minlength') > -1 ||
      errors?.name.indexOf('alphanumericSpace') > -1 ||
      errors?.name.indexOf('noSpaceStart') > -1 ||
      errors?.name.indexOf('noSpaceEnd') > -1
    ) {
      return false
    }
  }
  return true
}

export const checkMiddleInitial = (name: string): boolean => {
  const checkOnlyCharacters = /^[A-Za-z]+$/
  if (name) {
    if (!checkOnlyCharacters.test(name)) {
      return false
    }
  }
  return true
}
