export const filterFalsy = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  return Object.keys(obj).reduce((acc: Record<string, unknown>, key) => {
    if (obj[key]) {
      acc[key] = obj[key]
    }

    return acc
  }, {})
}
