/* eslint-disable react-native/no-inline-styles */
import React, { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import CsfView from '../../components'
import CsfBoxGradient from '../../components/CsfBoxGradient'

/** Light gray panel containing remove command buttons or text */
const MgaDashboardButtonView: React.FC<ViewProps> = ({ style, children, ...props }) => {
  return (
    <CsfBoxGradient
      {...props}
      style={{
        borderRadius: 8,
        height: '100%',
        ...style,
      }}>
      <CsfView style={{ padding: 20, gap: 16, flex: 1, paddingBottom: 20 }}>
        {children}
      </CsfView>
    </CsfBoxGradient>
  )
}

interface DashboardLayoutProps {
  primary?: ReactNode
  secondary?: ReactNode
  tertiary?: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ primary, secondary, tertiary }) => {
  return (
    <CsfView flex={1} gap={16}>
      {(primary || secondary) && (
        <CsfView flex={2.5}>
          <MgaDashboardButtonView>
            {primary && (
              <CsfView flex={6} flexDirection="row" justify="center" style={{ alignItems: 'center' }}>
                {primary}
              </CsfView>
            )}
            {secondary && (
              <CsfView flex={2} flexDirection="row" justify="space-between">
                {secondary}
              </CsfView>
            )}
          </MgaDashboardButtonView>
        </CsfView>
      )}
      {tertiary && (
        <CsfView flex={1} flexDirection="row" gap={16}>
          {tertiary}
        </CsfView>
      )}
    </CsfView>
  )
}

export default DashboardLayout
