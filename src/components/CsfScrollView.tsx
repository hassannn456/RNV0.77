import React, { useRef, createContext } from 'react'
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { CsfViewProps } from './CsfView'

export const CsfScrollRefContext = createContext<ScrollView | null>(null)

export interface CsfScrollViewProps extends CsfViewProps {
  throttle?: number
  handleScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const defaultProps: CsfScrollViewProps = {
  throttle: 0,
  handleScroll: () => {},
}

export const CsfScrollView = (props: CsfScrollViewProps): JSX.Element => {
  const { throttle, handleScroll, children } = { ...defaultProps, ...props }
  const scrollRef = useRef<ScrollView | null>(null)

  return (
    <ScrollView
      ref={ref => (scrollRef.current = ref)}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={throttle}>
      <CsfScrollRefContext.Provider value={scrollRef.current}>
        {children}
      </CsfScrollRefContext.Provider>
    </ScrollView>
  )
}
