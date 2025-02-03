import {
  DocumentDirectoryPath,
  exists,
  readFile,
  writeFile,
} from 'react-native-fs'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { RemoteStatusState } from './remoteStatus.slice'
import { store } from '../../store'
import { trackError } from '../../components/useTracking'

const remoteStatusLocalPath = `${DocumentDirectoryPath}/remoteCommands.json`

export const readRemoteStatus: () => Promise<string> = async () => {
  try {
    if (await exists(remoteStatusLocalPath)) {
      return await readFile(remoteStatusLocalPath, 'utf8')
    } else {
      return ''
    }
  } catch (error) {
    if (error instanceof Error) {
      trackError('remoteStatus.write.ts::writeRemoteStatus')(error)
    }
  }
  return ''
}

const writeRemoteStatus: (data: string) => Promise<void> = async data => {
  try {
    return await writeFile(remoteStatusLocalPath, data, 'utf8')
  } catch (error) {
    trackError('remoteStatus.write.ts::writeRemoteStatus')(error)
  }
}

readRemoteStatus()
  .then(data => {
    try {
      if (data) {
        const remoteStatus = JSON.parse(data) as RemoteStatusState
        // MGA-1647: Prune un-finished command. App is no longer listening for completion.
        if (remoteStatus.lastCommand?.remoteServiceState != 'completed') {
          remoteStatus['lastCommand'] = null
        }
        store.dispatch({ type: 'remoteStatus/replace', payload: remoteStatus })
      }
    } catch (error) {
      trackError('remoteStatus.write.ts::readRemoteStatus/onLoad/then')(error)
    }
  })
  .catch(trackError('remoteStatus.write.ts::readRemoteStatus/onLoad/catch'))

const remoteStatusMiddleware = createListenerMiddleware<RemoteStatusState>()

remoteStatusMiddleware.startListening({
  predicate: (action, _current, _previous) => {
    return (
      action.type == 'remoteStatus/setEngineStatus' ||
      action.type == 'remoteStatus/show' ||
      action.type == 'remoteStatus/hide'
    )
  },
  effect: async (_action, store) => {
    try {
      // Redux tells typescript it returns sub-tree
      // but actually returns whole tree
      // so types mismatch
      // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
      const state = store.getState().remoteStatus
      await writeRemoteStatus(JSON.stringify(state))
    } catch (error) {
      trackError('remoteStatus.write.ts::remoteStatusMiddleware')(error)
    }
  },
})

export { remoteStatusMiddleware }
