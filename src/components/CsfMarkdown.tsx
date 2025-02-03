import React from 'react'
import { useCsfColors } from './useCsfColors'
import { CsfTextStyles } from './CsfText'
import Markdown from 'react-native-markdown-display'

interface CsfMarkdownProps {
  children?: string
}

export const CsfMarkdown: React.FC<CsfMarkdownProps> = ({ children }) => {
  const { colors } = useCsfColors()

  return (
    <Markdown
      style={{
        body: {
          color: colors.copyPrimary,
          ...CsfTextStyles.body2,
        },
        heading1: { ...CsfTextStyles.heading },
        heading2: { ...CsfTextStyles.subheading },
      }}>
      {children ? children : ''}
    </Markdown>
  )
}
