export const checkStreetAddress = (name: string): boolean => {
  const addressExpression = /^[A-Za-z0-9.:,@_-\s]+$/
  return addressExpression.test(name)
}
