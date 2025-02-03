import React, { ReactNode } from 'react';
import CsfView, { CsfViewProps } from './CsfView';
import CsfText from './CsfText';

// TODO:AG:20231012 - pick the ones we need
export interface CsfListItemProps extends Pick<CsfViewProps, 'children'> {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  action?: string | ReactNode
  icon?: ReactNode
  onActionPress?: () => void
  onPress?: () => void
}

const CsfListItem: React.FC<CsfListItemProps> = props => {
  return (
    <CsfView
      flexDirection="row"
      justify="flex-end"
      gap={16}
      align="center"
      p={16}>
      <CsfView flex={1} flexDirection="row" gap={8} align="center">
        {props.icon && <CsfView maxWidth={44}>{props.icon}</CsfView>}
        <CsfView>
          {props.title && <CsfText variant="heading">{props.title} </CsfText>}
          {props.subtitle && (
            <CsfText variant="subheading" color="copySecondary">
              {props.subtitle}
            </CsfText>
          )}
        </CsfView>
      </CsfView>
      {props.action && <CsfView>{props.action}</CsfView>}
    </CsfView>
  );
};


export default CsfListItem;
