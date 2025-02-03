import React from 'react'
import { CsfListItem, CsfListItemProps } from './CsfListItem'
import { CsfAppIcon } from './CsfAppIcon'
import { CsfIcon } from '../../core/res/assets/icons'
import { CsfRuleList } from './CsfRuleList'
import { CsfTile } from './CsfTile'
import { CsfViewProps } from './CsfView'
import { testID } from './utils/testID'

export type CsfLandingMenuListItemProps = Pick<
  CsfListItemProps,
  'title' | 'onPress'
> & {
  icon?: CsfIcon | undefined
  noDestination?: boolean
  testID?: string
}
export const CsfLandingMenuListItem: React.FC<
  CsfLandingMenuListItemProps
> = props => {
  return (
    <CsfListItem
      ph={0}
      title={props.title}
      icon={props.icon ? <CsfAppIcon icon={props.icon} /> : undefined}
      onPress={props.onPress}
      testID={props.testID}
      action={
        !props.noDestination && (
          <CsfAppIcon icon="BackForwardArrow" color="button" size="sm" />
        )
      }
      titleTextVariant="subheading"
    />
  )
}

export const CsfLandingMenuList: React.FC<
  {
    items?: CsfLandingMenuListItemProps[]
    trackingId?: string
    testID?: string
  } & Pick<CsfViewProps, 'children'>
> = props => {
  const id = testID(props.testID)
  return (
    <CsfTile pv={0} testID={id('tile')}>
      <CsfRuleList testID={id('container')}>
        {props.children ||
          props.items?.map((item, key) => {
            return (
              <CsfLandingMenuListItem
                {...item}
                key={key}
                testID={id(`listItem-${key}`)}
              />
            )
          })}
      </CsfRuleList>
    </CsfTile>
  )
}
