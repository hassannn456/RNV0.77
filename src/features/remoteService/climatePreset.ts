import { MgaNavigationFunction, navigationRef } from '../../Controller'
import { store } from '../../store'
import { climateApi } from './climate.api'

export const redirectIfClimatePresetNotConfigured: MgaNavigationFunction =
  async (...args) => {
    // route params are 2nd argument of MgaNavigationFunction
    const response = await store
      .dispatch(
        climateApi.endpoints.remoteEngineStartSettingsFetch.initiate(undefined),
      )
      .unwrap()
    if (args[1] && args[1].skipSetup) {
      navigationRef.navigate(...args)
      return true
    }
    if (response.success) {
      // there are presets and at least some are not null + editable
      if (response.data?.filter(item => item?.canEdit)?.length > 0) {
        navigationRef.navigate(...args)
        return true
      } else {
        // redirect to setup
        navigationRef.navigate('ClimateControlSetup')
        return true
      }
    } else {
      // if something went wrong, just navigate thru
      return false
    }
  }
