import React from 'react';
import CsfText, { CsfTextProps } from './CsfText';
import CsfView, { CsfViewProps } from './CsfView';
import { testID } from './utils/testID';

// Type definitions for the component props
export type CsfBulletedListItemProps = CsfTextProps & {
  bullet?: React.ReactNode;
};

export type CsfBulletedListProps = CsfViewProps & {
  bullet?: React.FC<{ index: number }>;
};

const CsfBulletedListItem: React.FC<CsfBulletedListItemProps> = props => {
  const { children, bullet, ...textProps } = props;
  return (
    <CsfView flexDirection="row" gap={4}>
      {bullet || <CsfText {...textProps}>{'• '}</CsfText>}
      <CsfText {...textProps}>{children}</CsfText>
    </CsfView>
  );
};

const CsfBulletedList: React.FC<CsfBulletedListProps> = props => {
  const { children, bullet, ...viewProps } = props;
  return (
    <CsfView flex={1} gap={8} {...viewProps}>
      {React.Children.map(children, (child, index) => {
        if (child) {
          const itemTestId = testID(`bulletListItem-${index}`);
          return (
            <CsfBulletedListItem
              bullet={bullet && bullet({ index })}
              testID={itemTestId()}>
              {child}
            </CsfBulletedListItem>
          );
        } else {
          return null;
        }
      })}
    </CsfView>
  );
};

export default CsfBulletedList;
export { CsfBulletedListItem };
