import { alphaColor } from './color'

it('Generates correcta apha values', () => {
  expect(alphaColor('#666666', 100)).toBe('#666666FF')

  expect(alphaColor('#666666', 90)).toBe('#666666E6')
  expect(alphaColor('#666666', 80)).toBe('#666666CC')
  expect(alphaColor('#666666', 70)).toBe('#666666B3')
  expect(alphaColor('#666666', 60)).toBe('#66666699')
  expect(alphaColor('#666666', 50)).toBe('#66666680')
  expect(alphaColor('#666666', 40)).toBe('#66666666')
  expect(alphaColor('#666666', 30)).toBe('#6666664D')
  expect(alphaColor('#666666', 20)).toBe('#66666633')
  expect(alphaColor('#666666', 10)).toBe('#6666661A')
  expect(alphaColor('#666666', 0)).toBe('#66666600')
})

it('Converts 3 character hex to six', () => {
  expect(alphaColor('#666', 0)).toBe('#66666600')
  expect(alphaColor('#999', 100)).toBe('#999999FF')
})

it('Adds leading 0 to lowest values', () => {
  expect(alphaColor('#666', 1)).toBe('#66666603')
  expect(alphaColor('#666', 2)).toBe('#66666605')
  expect(alphaColor('#666', 3)).toBe('#66666608')
  expect(alphaColor('#666', 4)).toBe('#6666660A')
  expect(alphaColor('#666', 5)).toBe('#6666660D')
  expect(alphaColor('#666', 6)).toBe('#6666660F')
  expect(alphaColor('#666', 7)).toBe('#66666612')
  expect(alphaColor('#666', 8)).toBe('#66666614')
  expect(alphaColor('#666', 9)).toBe('#66666617')
})
