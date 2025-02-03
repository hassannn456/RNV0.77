/** Basic password check */
export const checkPassword = (name: string): boolean => {
  const passwordExpression =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9@!#$^%*()+=\-\\;,./:?~`]{8,15})$/
  return passwordExpression.test(name)
}
