/* eslint-disable eol-last */
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CsfView from './CsfView'

import { navigationRef } from '../Controller'
import { MgaSnackBarAlerts } from './MgaSnackbarAlerts'
import { MgaSnackBarRemoteServices } from './MgaSnackbarRemoteServices'
import { store } from '../store'
import { loginStatusReducer } from '../features/auth/sessionSlice'

/** MySubaru control for showing progress on remote commands */
const MgaSnackBar: React.FC = () => {
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(true)
  const [avoidBottom, setAvoidBottom] = useState(false)

  const isLoggedIn = loginStatusReducer(store.getState())

  const navigationListener = () => {
    const currentRouteName = navigationRef.getCurrentRoute()?.name
    // TODO:UA:20231120 - is there a way to stick this in the route definitions?
    setAvoidBottom(currentRouteName == 'Dashboard')
    setVisible(currentRouteName != 'Menu')
  }

  useEffect(() => {
    navigationRef.addListener('state', navigationListener)
    return () => {
      navigationRef.removeListener('state', navigationListener)
    }
  }, [])

  return visible ? (
    <CsfView
      ph={16}
      gap={12}
      style={{
        position: 'absolute',
        bottom: avoidBottom ? 80 + insets.bottom : insets.bottom,
        width: '100%',
        zIndex: 1,
      }}>
      <MgaSnackBarAlerts />
      {/*
       isLoggedIn temporarily restored for RES notices.
      TODO:AG:20240124 - determine whether isLoggedIn check is actually needed  */}
      {isLoggedIn && <MgaSnackBarRemoteServices />}
    </CsfView>
  ) : null
}

export default MgaSnackBar;