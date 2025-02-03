import React, { useState } from 'react';
import { Pressable, PressableProps } from 'react-native';
import CsfView from './CsfView';
import { CsfColorPalette } from './useCsfColors';
import { Dimension } from './types';

/**
 * Use like UITableViewCell (iOS) / RecycledView (Android) in FlatLists, SectionLists, etc.
 */
interface CsfTableViewCellProps extends PressableProps {
  bg?: keyof CsfColorPalette;
  bgPressed?: keyof CsfColorPalette;
  p?: Dimension;
  ph?: Dimension;
  pv?: Dimension;
}

const CsfTableViewCell: React.FC<CsfTableViewCellProps> = ({
  bg,
  bgPressed,
  p,
  ph,
  pv,
  disabled,
  onPress,
  children,
  accessibilityRole = 'button',
  ...props
}) => {
  const [pressed, setPressed] = useState(false);

  const background = pressed ? bgPressed || 'backgroundSecondary' : bg;
  const isInactive = disabled || !onPress;

  const onPressIn = isInactive ? undefined : () => setPressed(true);
  const onPressOut = isInactive ? undefined : () => setPressed(false);

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
      accessibilityRole={accessibilityRole}>
      <CsfView bg={background} minHeight={44} justify="center">
        <CsfView
          ph={p || ph || 8}
          pv={p || pv || 8}
          align="center"
          flexDirection="row"
          justify="space-between"
          gap={12}>
          {children}
        </CsfView>
      </CsfView>
    </Pressable>
  );
};

export default CsfTableViewCell;
