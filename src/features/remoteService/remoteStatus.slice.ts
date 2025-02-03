import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RemoteCommandStatus } from './remoteService.api'
import { RootState, store } from '../../store'
import { currentVehicleReducer } from '../auth/sessionSlice'
import { useEffect, useState } from 'react'

export interface RemoteEngineStatus {
  engineRunStatus: boolean
  remoteStartBeginTime: number
  remoteStartEndTime: number
}

export interface RemoteStatusState {
  lastCommand: RemoteCommandStatus | null
  engineStatus: {
    [vin: string]: RemoteEngineStatus
  }
}

const remoteStatusSlice = createSlice({
  name: 'remoteStatus',
  initialState: (): RemoteStatusState => ({
    lastCommand: null,
    engineStatus: {},
  }),
  reducers: {
    // Used when loading saved state from file
    replace: (_state, action: PayloadAction<RemoteStatusState>) => {
      return action.payload
    },
    // Set by engine start and engine stop
    setEngineStatus: (
      state,
      action: PayloadAction<{ vin: string; status: RemoteEngineStatus }>,
    ) => {
      const { vin, status } = action.payload
      return {
        ...state,
        engineStatus: { ...state.engineStatus, [vin]: status },
      }
    },
    // Send data to show on snackbar
    show: (state, action: PayloadAction<RemoteCommandStatus>) => {
      // Some commands (ex: lock) make a hidden condition check after completing
      // Other commands (ex: vehicle status) return completion as a condition check with other data.
      // Preserve the command name (remoteServiceType) and discard everything else
      if (action.payload.remoteServiceType == 'condition') {
        return {
          ...state,
          lastCommand: {
            ...action.payload,
            remoteServiceType:
              state.lastCommand?.remoteServiceType ??
              action.payload.remoteServiceType,
          },
        }
      }
      return {
        ...state,
        lastCommand: action.payload,
      }
    },
    // Remove data from snackbar
    hide: (state, _action) => ({ ...state, lastCommand: null }),
  },
})

/** Return remote status (state of last sent command)
 *
 * Using a reducer here because last remote status is
 * no longer valid after vehicle change but we don't want
 * to clear it in cases where users changes back. */
export const remoteStatusReducer: (
  state: RootState,
) => RemoteCommandStatus | null = state => {
  const lastCommand = state.remoteStatus.lastCommand
  if (!lastCommand) {
    return null
  }
  const vehicle = currentVehicleReducer(state)
  if (!vehicle || vehicle.vin != lastCommand.vin) {
    return null
  }
  return lastCommand
}

/** Return engine running status of current vehicle */
export const useEngineRunning: () => boolean = () => {
  const getStatusReducer: () => RemoteEngineStatus = () => {
    const state = store.getState()
    const engineStatuses = state.remoteStatus.engineStatus
    const vin = currentVehicleReducer(state)?.vin
    if (!engineStatuses || !vin || !engineStatuses[vin])
      return {
        engineRunStatus: false,
        remoteStartBeginTime: 0,
        remoteStartEndTime: 0,
      }
    return engineStatuses[vin]
  }
  const getRunning: (state: RemoteEngineStatus) => boolean = state => {
    const now = new Date().getTime()
    return (
      state.engineRunStatus &&
      state.remoteStartBeginTime <= now &&
      now <= state.remoteStartEndTime
    )
  }
  const [isRunning, setRunning] = useState(getRunning(getStatusReducer()))
  useEffect(() => {
    const interval = setInterval(() => {
      const newRunning = getRunning(getStatusReducer())
      // If engine state changes, flush state and force re-draw
      if (isRunning != newRunning) {
        setRunning(newRunning)
      }
    }, 1000)
    return () => clearInterval(interval)
  })
  return isRunning
}

export const { show, hide } = remoteStatusSlice.actions
export default remoteStatusSlice.reducer
