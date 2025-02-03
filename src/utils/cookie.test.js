const { parseSessionId, parseRouteId } = require('./cookie')

it('Extracts data from cookie', () => {
  const cookie =
    'JSESSIONID=859657CD89536CE2504CCE70907CF299; Path=/g2v25; Secure; HttpOnly, X-Oracle-BMC-LBS-Route=3d364be8c2390ac73a3f12a6a8198928fd0c4722ebc3669b3e4afb295ce6f236d00800d7679689ab; Path=/g2v25; Secure; HttpOnly'
  expect(parseSessionId(cookie)).toBe('859657CD89536CE2504CCE70907CF299')
  expect(parseRouteId(cookie)).toBe(
    '3d364be8c2390ac73a3f12a6a8198928fd0c4722ebc3669b3e4afb295ce6f236d00800d7679689ab',
  )
})

it('Fails on empty cookie', () => {
  const cookie = ''
  expect(parseSessionId(cookie)).toBe(undefined)
  expect(parseRouteId(cookie)).toBe(undefined)
})
