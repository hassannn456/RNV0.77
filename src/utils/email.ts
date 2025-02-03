export const checkEmail = (email: string): boolean => {
  // Basic email regex to check general format and domains with at least two characters
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/

  // Trim email and validate with regex
  const trimmedEmail = email.trim()
  if (!emailRegex.test(trimmedEmail)) {
    return false
  }

  // Split email into local and domain parts
  const parts = trimmedEmail.split('@')
  if (parts.length !== 2) {
    return false
  }

  const [localPart, domainPart] = parts

  // Split local and domain parts by dots
  const localSegments = localPart.split('.')
  const domainSegments = domainPart.split('.')

  // Validate each segment of the local part
  for (const local of localSegments) {
    if (local.length <= 0 || local.length > 64) {
      return false
    }
  }

  // Validate each segment of the domain part
  for (const domain of domainSegments) {
    if (domain.length <= 0 || domain.length > 63) {
      return false
    }
  }

  return true
}

export const checkUserEmail = (email: string): boolean => {
  const userEmailRegex =
    /^(([A-Za-z0-9.@_\-+]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return userEmailRegex.test(email)
}
