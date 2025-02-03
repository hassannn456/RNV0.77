import { getBundleId } from 'react-native-device-info'

export const testID = (
  parent?: string,
): ((v?: string) => string | undefined) => {
  const bundleId = getBundleId()
  const prefix = `${bundleId}:id/`
  // strip prefix if someone is shoving in prefab ids

  if (parent?.startsWith(prefix)) parent = parent.replaceAll(prefix, '')

  return function (id?: string) {
    if (!parent) return undefined
    const res = id ? `${parent}.${id}` : parent
    return prefix + res
  }
}
