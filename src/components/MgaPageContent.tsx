import React from 'react'
import { CsfViewProps, Dimension } from '../components'
import CsfText, { CsfTextVariant } from '../components/CsfText'
import CsfView from './CsfView'

export type MgaPageContentProps = Pick<
  CsfViewProps,
  'testID' | 'isLoading' | 'children'
> & {
  title?: string
  description?: string
  titleTextVariant?: CsfTextVariant
  gap?: Dimension
}

const MgaPageContent: React.FC<MgaPageContentProps> = ({
  title,
  titleTextVariant,
  children,
  isLoading,
  description,
  gap,
}) => {
  return (
    <CsfView p={16} pv={24} gap={16} testID={'pageContent'}>
      {title && (
        <CsfText
          variant={titleTextVariant || 'title2'}
          align="center"
          testID="title">
          {title}
        </CsfText>
      )}
      {description && (
        <CsfText align="center" testID="description">
          {description}
        </CsfText>
      )}
      <CsfView isLoading={isLoading} gap={gap || 24} testID="pageLayout">
        {children}
      </CsfView>
    </CsfView>
  )
}

export default MgaPageContent
