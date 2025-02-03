import React, { Children, useRef, useState } from 'react'
import PagerView, { PagerViewProps } from 'react-native-pager-view'
import { CsfView } from './CsfView'
import { CsfProgressDots } from './CsfProgressDots'

export type CsfPagerProps = PagerViewProps

export const CsfPager = (props: CsfPagerProps): JSX.Element => {
  const { children, ...pagerViewProps } = {
    ...props,
  }
  const ref = useRef<PagerView>(null)
  const [page, setPage] = useState<number>(pagerViewProps.initialPage ?? 0)
  return (
    <CsfView>
      <PagerView
        ref={ref}
        {...pagerViewProps}
        onPageSelected={event => {
          setPage(event.nativeEvent.position)
        }}>
        {children}
      </PagerView>
      {Children.count(children) > 1 && (
        <CsfView flexDirection="row" justify="center" p={8}>
          <CsfProgressDots
            count={Children.count(children)}
            index={page}
            onDotPress={i => {
              ref?.current?.setPage(i)
            }}
          />
        </CsfView>
      )}
    </CsfView>
  )
}
