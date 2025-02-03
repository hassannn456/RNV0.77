/* eslint-disable eol-last */
import React from 'react';
import CsfView from './CsfView';
import CsfTile, { CsfTileProps } from './CsfTile';
import CsfListItem, { CsfListItemProps } from './CsfListItem';
import CsfRule from './CsfRule';
import { testID } from './utils/testID';

// TODO:AG:20231012 - implement string/handler
export type CsfCardProps = CsfTileProps & CsfListItemProps

const CsfCard: React.FC<CsfCardProps> = ({
  title,
  subtitle,
  action,
  icon,
  // TODO:AG:20231129: Move to containerStyle
  p,
  gap,
  titleTextVariant,
  subtitleTextVariant,
  ...props
}) => {
  const id = testID(props.testID);
  const showHeader: boolean = !!title || !!subtitle || !!action || !!icon;
  const count = React.Children.toArray(props.children).filter(c => c).length;
  return (
    <CsfTile {...props} p={0} gap={0} testID={id()}>
      {showHeader && (
        <CsfListItem
          title={title}
          subtitle={subtitle}
          action={action}
          icon={icon}
          titleTextVariant={titleTextVariant}
          subtitleTextVariant={subtitleTextVariant}
          testID={id('cardHeader')}
        />
      )}
      {count > 0 && props.borderColor && <CsfRule color={props.borderColor} />}
      {count > 0 && (
        <CsfView
          pt={showHeader && !props.borderColor ? 0 : 16}
          p={p ?? 16}
          gap={gap}
          testID={id('cardContainer')}>
          {props.children}
        </CsfView>
      )}
    </CsfTile>
  );
};

export default CsfCard;