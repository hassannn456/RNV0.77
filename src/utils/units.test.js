const { convertUnits } = require('./units')

it('Converts distance', () => {
  // Imperial <-> metric
  expect(convertUnits(1, 'mi', 'm')).toStrictEqual(1609.344)
  expect(convertUnits(1, 'mi', 'km')).toStrictEqual(1.609344)
  expect(convertUnits(1, 'km', 'km')).toStrictEqual(1)
  expect(convertUnits(1, 'km', 'm')).toStrictEqual(1000)
  expect(convertUnits(1, 'km', 'mi')).toStrictEqual(0.6213712)
  // Trip logs units
  expect(convertUnits(1, 'ONETENTHOF-MILE', 'mi')).toStrictEqual(0.1)
  expect(convertUnits(1, 'ONETENTHOF-MILE', 'km')).toStrictEqual(0.1609344)
  expect(convertUnits(1, 'ONETENTHOF-KM', 'mi')).toStrictEqual(0.06213712)
  expect(convertUnits(1, 'ONETENTHOF-KM', 'km')).toStrictEqual(0.1)
})
