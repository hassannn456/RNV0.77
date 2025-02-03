import React from 'react'
import CsfView from '../../components/CsfView'
import CsfText from '../../components/CsfText'

interface NoResContentProps {
  title?: string
  children?: React.ReactNode
}

const NoResContent: React.FC<NoResContentProps> = ({ title, children }) => (
  <CsfView gap={16}>
    <CsfText align="center" variant="title3">
      {title}
    </CsfText>
    <CsfView gap={16}>{children}</CsfView>
  </CsfView>
)

export default NoResContent
