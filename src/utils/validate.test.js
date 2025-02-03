const { validate } = require('./validate')
const { checkAlphabetSpace } = require('./validate')

it('Validates a value', () => {
  // Passing object
  expect(
    validate({ name: 'Associate Bob' }, { name: 'required' }),
  ).toStrictEqual({})
  // 1 validation error
  expect(
    validate(
      { name: 'Associate Bob' },
      { name: { required: true, maxlength: 10 } },
    ),
  ).toStrictEqual({ name: ['maxlength'] })
  // 2 validation errors
  expect(
    validate(
      { name: 'Associate Bob', vin: 'SGZCZ43D13S812715' },
      { name: { required: true, maxlength: 10 }, vin: 'vin' },
    ),
  ).toStrictEqual({ name: ['maxlength'], vin: ['vin'] })
})

it('Validates two fields match', () => {
  // Pass
  const ok = { password: 'foobarbaz', confirm: 'foobarbaz' }
  expect(
    validate(ok, {
      confirm: { equalTo: ok.password },
    }),
  ).toStrictEqual({})
  // Fail
  const err = { password: 'foobarbaz', confirm: 'foobarquux' }
  expect(validate(err, { confirm: { equalTo: err.password } })).toStrictEqual({
    confirm: ['equalTo'],
  })
})

it('Validates alphanumeric text', () => {
  const rule = {
    name: 'alphanumericSpace',
  }
  // Pass
  const ok = { name: 'foo bar baz' }
  expect(validate(ok, rule)).toStrictEqual({})
  // Fail
  const err = { name: '$foo $bar $baz' }
  expect(validate(err, rule)).toStrictEqual({
    name: [rule.name],
  })
})

it('Validates digits', () => {
  const rule = {
    pin: {
      digits: true,
      required: true,
    },
  }
  // Pass
  const ok = { pin: '1234' }
  expect(validate(ok, rule)).toStrictEqual({})
  // Fail
  const err = { pin: '123.' }
  expect(validate(err, rule)).toStrictEqual({
    pin: ['digits'],
  })
  const blank = { pin: '' }
  expect(validate(blank, rule)).toStrictEqual({
    pin: ['required'],
  })
})

it('MGA-526', () => {
  const rule = {
    name: {
      alphanumericSpaceWithQuotesAmp: true,
      required: true,
    },
  }
  // Pass
  const ok = { name: 'foo bar baz' }
  expect(validate(ok, rule)).toStrictEqual({})
  // Fail
  const err = { name: '"/$"' }
  expect(validate(err, rule)).toStrictEqual({
    name: ['alphanumericSpaceWithQuotesAmp'],
  })
  const blank = { name: '' }
  expect(validate(blank, rule)).toStrictEqual({
    name: ['required'],
  })
})

it('MGA-1894', () => {
  const validCityName = 'New York'
  const invalidCityName = 'Chicago 123 pacific'

  expect(checkAlphabetSpace(validCityName)).toBe(true)
  expect(checkAlphabetSpace(invalidCityName)).toBe(false)
  expect(checkAlphabetSpace(' ')).toBe(false)
})
