import { createSlice } from '@reduxjs/toolkit'

export type LocalizationDownloadState = null | {
  state: 'loading' | 'error' | 'complete'
}

/**
 * State slice for i18n S3 content downloader.
 *
 * Use to maintain splash screen during initial language load.
 * Can be expanded to include progress / errors.
 */
const localizationSlice = createSlice({
  name: 'localization',
  initialState: (): LocalizationDownloadState => {
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

export default localizationSlice.reducer
