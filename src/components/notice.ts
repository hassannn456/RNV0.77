import { NoticePayload } from '../features/notices/notices.slice'
import { store } from '../store'

/** TODO:UA:20240529: Investigate interaction between errorNotice + CsfModal */
export const errorNotice = (noticePayload: NoticePayload): void => {
  const payload: NoticePayload = { ...noticePayload, type: 'error' }
  store.dispatch({
    type: 'notices/addNotice',
    payload,
  })
}

export const infoNotice = (noticePayload: NoticePayload): void => {
  const payload: NoticePayload = { ...noticePayload, type: 'information' }
  store.dispatch({
    type: 'notices/addNotice',
    payload,
  })
}

export const successNotice = (noticePayload: NoticePayload): void => {
  const payload: NoticePayload = { ...noticePayload, type: 'success' }
  store.dispatch({
    type: 'notices/addNotice',
    payload,
  })
}

export const warningNotice = (noticePayload: NoticePayload): void => {
  const payload: NoticePayload = { ...noticePayload, type: 'warning' }
  store.dispatch({
    type: 'notices/addNotice',
    payload,
  })
}
