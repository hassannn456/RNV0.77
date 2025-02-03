import { expect } from '@jest/globals'
import { parseText, parseKeyValueString } from './parse'

it('Handles basic input', () => {
  expect(parseText('Hello')).toStrictEqual([{ tag: null, content: 'Hello' }])
  expect(parseText('STARLINK® Subscription')).toStrictEqual([
    {
      tag: null,
      content: 'STARLINK® Subscription',
    },
  ])
  expect(parseText('CURFEW ALERT DEACTIVATE')).toStrictEqual([
    {
      tag: null,
      content: 'CURFEW ALERT DEACTIVATE',
    },
  ])
})

it('Finds links', () => {
  expect(
    parseText(
      '<a href="tel://18557532495" class="text-link">(855) 753-2495</a>.',
    ),
  ).toStrictEqual([
    {
      tag: 'a',
      content: [{ tag: null, content: '(855) 753-2495' }],
      href: 'tel://18557532495',
    },
    { tag: null, content: '.' },
  ])
  expect(
    parseText(
      'Subaru Customer Support at <a class="text-link" href="tel://18007822783" target="_blank" >(800) 782-2783</a>',
    ),
  ).toStrictEqual([
    { tag: null, content: 'Subaru Customer Support at ' },
    {
      tag: 'a',
      content: [{ tag: null, content: '(800) 782-2783' }],
      href: 'tel://18007822783',
    },
  ])
  expect(
    parseText(
      'Please contact Customer Support at <nobr><a href="tel://18007822783" class="text-link">(800) 782-2783</a></nobr>',
    ),
  ).toStrictEqual([
    { tag: null, content: 'Please contact Customer Support at ' },
    {
      tag: 'a',
      content: [{ tag: null, content: '(800) 782-2783' }],
      href: 'tel://18007822783',
    },
  ])
  expect(
    parseText(
      '<a href="https://www.subaru.ca/privacy" class="textLink text-link extWeblink">Terms of Use \u0026 Privacy</a>',
    ),
  ).toStrictEqual([
    {
      tag: 'a',
      content: [{ tag: null, content: 'Terms of Use \u0026 Privacy' }],
      href: 'https://www.subaru.ca/privacy',
    },
  ])
})

it('MGA-654 - Handles two links and newline in one body', () => {
  expect(
    parseText(
      'I agree to the <a href="https://www.subaru.com/company/starlink-terms.html">Terms & Conditions</a>\nand acknowledge that I have read the <a href="https://www.subaru.com/support/privacy-policies.html">Privacy Policy.</a>',
    ),
  ).toStrictEqual([
    { content: 'I agree to the ', tag: null },
    {
      content: [{ content: 'Terms & Conditions', tag: null }],
      href: 'https://www.subaru.com/company/starlink-terms.html',
      tag: 'a',
    },
    { content: '\nand acknowledge that I have read the ', tag: null },
    {
      content: [{ content: 'Privacy Policy.', tag: null }],
      href: 'https://www.subaru.com/support/privacy-policies.html',
      tag: 'a',
    },
  ])
})

it('Finds bold text', () => {
  expect(
    parseText('<strong>CURFEW ALERT DEACTIVATE</strong><br />failed at '),
  ).toStrictEqual([
    { tag: 'b', content: [{ tag: null, content: 'CURFEW ALERT DEACTIVATE' }] },
    { tag: null, content: 'failed at ' },
  ])
  expect(
    parseText(
      'Sending<br /><strong>CURFEW ALERT DEACTIVATE</strong><br />to your vehicle',
    ),
  ).toStrictEqual([
    { tag: null, content: 'Sending' },
    { tag: 'b', content: [{ tag: null, content: 'CURFEW ALERT DEACTIVATE' }] },
    { tag: null, content: 'to your vehicle' },
  ])
  expect(parseText('<b>Request Method</b>')).toStrictEqual([
    { tag: 'b', content: [{ tag: null, content: 'Request Method' }] },
  ])
})

it('Parses spans', () => {
  expect(
    parseText('Enable <span class="biometricsType">Touch ID</span> for PIN'),
  ).toStrictEqual([
    { tag: null, content: 'Enable ' },
    {
      tag: 'span',
      class: 'biometricsType',
      content: [{ tag: null, content: 'Touch ID' }],
    },
    { tag: null, content: ' for PIN' },
  ])
})

it('Parses multiple things', () => {
  expect(
    parseText(
      'Reply <strong>STOP</strong> to <a href="tel://18008944212">1 (800) 894-4212</a> to cancel.',
    ),
  ).toStrictEqual([
    { tag: null, content: 'Reply ' },
    { tag: 'b', content: [{ tag: null, content: 'STOP' }] },
    { tag: null, content: ' to ' },
    {
      tag: 'a',
      content: [{ tag: null, content: '1 (800) 894-4212' }],
      href: 'tel://18008944212',
    },
    { tag: null, content: ' to cancel.' },
  ])
})

it('Documents key value parser', () => {
  const kvString =
    'href="https://www.subaru.ca/privacy" class="textLink text-link extWeblink"'
  const object = parseKeyValueString(kvString)
  expect(object.href).toStrictEqual('https://www.subaru.ca/privacy')
  expect(object.class).toStrictEqual('textLink text-link extWeblink')
})
