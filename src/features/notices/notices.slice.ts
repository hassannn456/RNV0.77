import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type NoticeType = 'information' | 'error' | 'warning' | 'success'

export type NoticePayload = {
  /**
   * Uniquely identifies notice.
   *
   * If omitted, a timestamp is used. Only one notice of a given key is displayed at any time.
   **/
  noticeKey?: string
  title?: string
  subtitle?: string
  type?: NoticeType
  action?: () => void | Promise<void | unknown | undefined>
  dismissable?: boolean
}

interface NoticesState {
  notices: NoticePayload[]
}

const noticesSlice = createSlice({
  name: 'notices',
  initialState: (): NoticesState => ({ notices: [] }),
  reducers: {
    addNotice: (state, action: PayloadAction<NoticePayload>) => {
      const payload = action.payload.noticeKey
        ? action.payload
        : { ...action.payload, noticeKey: Date.now().toString() }
      return {
        ...state,
        notices: [
          ...state.notices.filter(n => n.noticeKey != payload.noticeKey),
          payload,
        ],
      }
    },
    dismissNotice: (state, action) => ({
      ...state,
      notices: state.notices.filter(
        notice => notice.noticeKey != action.payload,
      ),
    }),
  },
})
export const { addNotice, dismissNotice } = noticesSlice.actions
export default noticesSlice.reducer
