import { createSlice } from '@reduxjs/toolkit'

export type MobileMessageState = null | {
  state: 'loading' | 'error' | 'complete'
}

/**
 * State slice for mobile message.
 *
 * Use to maintain splash screen during initial language load.
 */
const mobileMessageSlice = createSlice({
  name: 'mobileMessage',
  initialState: (): MobileMessageState => {
    return null
  },
  reducers: {
    started: (_state, _action) => {
      return { state: 'loading' }
    },
    error: (_state, _action) => {
      return { state: 'error' }
    },
    complete: (_state, _action) => {
      return { state: 'complete' }
    },
  },
})

export default mobileMessageSlice.reducer
