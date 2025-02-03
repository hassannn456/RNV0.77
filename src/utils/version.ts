export const highestVersion = (version1: string, version2: string): string => {
  const splitVersion = (version: string) => {
    const [main, pre] = version.split('-')
    const mainParts = main.split('.').map(Number)
    const preParts = pre ? pre.split('.') : []
    return { mainParts, preParts }
  }

  const compareParts = (
    parts1: (number | string)[],
    parts2: (number | string)[],
  ): number => {
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i]
      const part2 = parts2[i]

      if (part1 === undefined) return -1
      if (part2 === undefined) return 1

      if (typeof part1 === 'number' && typeof part2 === 'number') {
        if (part1 > part2) return 1
        if (part1 < part2) return -1
      } else {
        const str1 = String(part1)
        const str2 = String(part2)
        if (str1 > str2) return 1
        if (str1 < str2) return -1
      }
    }
    return 0
  }

  const v1 = splitVersion(version1)
  const v2 = splitVersion(version2)

  const mainComparison = compareParts(v1.mainParts, v2.mainParts)
  if (mainComparison !== 0) return mainComparison > 0 ? version1 : version2

  // Handle prerelease comparison
  if (v1.preParts.length === 0 && v2.preParts.length > 0) return version1
  if (v1.preParts.length > 0 && v2.preParts.length === 0) return version2

  const preComparison = compareParts(v1.preParts, v2.preParts)
  if (preComparison !== 0) return preComparison > 0 ? version1 : version2

  return version1
}
