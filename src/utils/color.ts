type HexColorString = `#${string}`

export const alphaColor = (
  color: HexColorString,
  opacity: number,
): HexColorString => {
  /** convert 3 character hex to 6  */
  if (color.toString().length === 4) {
    color = color
      .split('')
      .map(function (hex) {
        return hex === '#' ? hex : hex + hex
      })
      .join('') as HexColorString
  }

  if (color.length > 7) {
    console.warn('invalid color value: ' + color)
    color = color.toString().substring(0, 6) as HexColorString
  }

  /** max/min values to force high and low values into range  */
  const coercedOpacity: number = Math.round(
    Math.min(Math.max(opacity / 100, 0), 1) * 255,
  )

  /** convert opacity to hex string */
  let hexOpacity: string = coercedOpacity.toString(16).toUpperCase()

  /** add leading zero for lowest values   */
  if (hexOpacity.length == 1) hexOpacity = '0' + hexOpacity
  return (color + hexOpacity) as HexColorString
}
