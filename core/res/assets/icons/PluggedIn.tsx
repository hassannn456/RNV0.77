import React from 'react'
import { CsfIconHelper, Size } from '../../../../src/components/CsfIconHelper'
import Svg from '../../../../content/svg/mga/plugged_in.svg'
import { CsfColorPalette } from '../../../../src/components/useCsfColors'
import { testID } from '../../../../src/components/utils/testID'
const Icon: React.FC<{
  size?: Size
  color?: keyof CsfColorPalette
  testID?: string
}> = props => {
  const id = testID(props.testID)
  return (
    <CsfIconHelper>
      {({ colors, getSize }) => (
        <Svg
          width={props.size && getSize ? getSize(props.size) : 24}
          height={props.size && getSize ? getSize(props.size) : 24}
          testID={id()}
          fill={
            colors && props.color
              ? colors[props.color]
              : colors?.copyPrimary || '#000'
          }
        />
      )}
    </CsfIconHelper>
  )
}

export default Icon