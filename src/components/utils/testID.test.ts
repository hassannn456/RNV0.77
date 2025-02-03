const rnMock = require('react-native-device-info/jest/react-native-device-info-mock')

jest.mock('react-native-device-info', () => {
  return {
    getBundleId: () => 'xyz',
  }
})

// bundle id + id
const prefix = getBundleId() + ':id/'

import { getBundleId } from 'react-native-device-info'
import { testID } from './testID'

it('returns the correct test id ', () => {
  const id = testID('Test')
  expect(id()).toEqual(prefix + 'Test')
  const testItem = id('Item')
  expect(testItem).toEqual(prefix + 'Test.Item')
})

it('returns trims extra prefixes if passed in  ', () => {
  const id = testID('Test')
  const testItem = id('Item')
  expect(testID(testItem)('Child')).toEqual(prefix + 'Test.Item.Child')
})

it('returns undefined if first param is not set', () => {
  const emptyParam = testID(undefined)
  expect(emptyParam()).toEqual(undefined)
  expect(emptyParam('Something')).toEqual(undefined)
})
