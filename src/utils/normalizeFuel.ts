export const normalizeFuelPercent = (fuelPercent?: number): number => {
  if (!fuelPercent || fuelPercent > 100 || fuelPercent < 0) return 0
  return fuelPercent
}
