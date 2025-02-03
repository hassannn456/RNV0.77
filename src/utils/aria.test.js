const { parseAriaRedirectUrl } = require('./aria')

it('Parses successful ARIA response URLs', () => {
  expect(
    parseAriaRedirectUrl(
      'https://mobileapi.qa.subarucs.com/current/ariaUpgradeResponse.html?error_code=0&error_message=success&payment_method_no=30&errors=0&inSessionID=3FS5N9HT4BTTWYCG4UBS',
    ),
  ).toStrictEqual({
    errors: 0,
    error_messages: [],
    inSessionID: '3FS5N9HT4BTTWYCG4UBS',
    payment_method_no: '30',
  })
})

it('Parses failing ARIA response URLs', () => {
  expect(
    parseAriaRedirectUrl(
      'https://mobileapi.qa.subarucs.com/current/ariaUpgradeResponse.html?error_messages[0][error_key]=serveryoumustenterccnumber&error_messages[0][error_code]=1010&error_messages[0][error_field]=cc_no&error_messages[1][error_key]=serverccnumnumeric&error_messages[1][error_code]=1012&error_messages[1][error_field]=cc_no&error_messages[2][error_key]=serverlengthofccnumber&error_messages[2][error_code]=1012&error_messages[2][error_field]=cc_no&errors=3&inSessionID=GEMJDFGXVW7HXPSTKD3X',
    ),
  ).toStrictEqual({
    errors: 3,
    error_messages: [
      {
        error_key: 'serveryoumustenterccnumber',
        error_code: '1010',
        error_field: 'cc_no',
      },
      {
        error_key: 'serverccnumnumeric',
        error_code: '1012',
        error_field: 'cc_no',
      },
      {
        error_key: 'serverlengthofccnumber',
        error_code: '1012',
        error_field: 'cc_no',
      },
    ],
    inSessionID: 'GEMJDFGXVW7HXPSTKD3X',
  })
  expect(
    parseAriaRedirectUrl(
      'https://mobileapi.qa.subarucs.com/current/ariaUpgradeResponse.html?error_messages[0][error_key]=servercouldnotgetaccountdetails&error_messages[0][error_code]=1011&error_messages[0][error_field]=server_error&errors=1&inSessionID=GEMJDFGXVW7HXPSTKD3X',
    ),
  ).toStrictEqual({
    errors: 1,
    error_messages: [
      {
        error_key: 'servercouldnotgetaccountdetails',
        error_code: '1011',
        error_field: 'server_error',
      },
    ],
    inSessionID: 'GEMJDFGXVW7HXPSTKD3X',
  })
})
