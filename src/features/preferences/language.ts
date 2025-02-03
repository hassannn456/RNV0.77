import { createListenerMiddleware } from '@reduxjs/toolkit'
import i18n from '../../i18n'
import { PreferencesState } from './preferences.slice'

/** Listen for language change in redux and update i18n */
const languageMiddleware = createListenerMiddleware<PreferencesState>()

languageMiddleware.startListening({
  predicate: (_action, current, previous) => {
    return current.preferences?.language != previous.preferences?.language
  },
  effect: async (_action, store) => {
    const language = store.getState().preferences?.language
    if (language) {
      await i18n.changeLanguage(language)
    }
  },
})

export { languageMiddleware }
