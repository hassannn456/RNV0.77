/* eslint-disable eol-last */
import { navigate } from '../Controller'
import { AlertBarTypes } from './CsfAlertBar'

/** Show simple alert. Callable from outside components. */
const CsfSimpleAlert: (
  title: string,
  message?: string,
  options?: { type?: AlertBarTypes },
) => void = (title, message, options) => {
  navigate('Alert', {
    title,
    message,
    options,
  })
}


export default CsfSimpleAlert;