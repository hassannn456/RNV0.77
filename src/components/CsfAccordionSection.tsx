/* eslint-disable react-native/no-inline-styles */
/* eslint-disable eqeqeq */
import React, { useState, ReactNode, useEffect } from 'react';
import CsfAppIcon from './CsfAppIcon';
import CsfPressable from './CsfPressable';
import CsfView from './CsfView';
import CsfListItem, { CsfListItemProps } from './CsfListItem';
import { Dimension } from './types';
import { CsfThemeContextType } from './CsfThemeContext';
import { CsfColorPalette } from './useCsfColors';
import useTracking from './useTracking';
import { testID } from './utils/testID';

// TypeScript interfaces for props
export interface CsfAccordionSectionProps extends CsfListItemProps {
  renderBody?: () => JSX.Element | ReactNode | React.FC;
  renderBodyPadding?: Dimension;
  renderBodyBg?: keyof CsfColorPalette;
  headerTheme?: CsfThemeContextType & undefined;
  bodyTheme?: CsfThemeContextType & undefined;
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  testID?: string;
}

interface PlusMinusProps {
  open?: boolean;
  enabled?: boolean;
}

const PlusMinus: React.FC<PlusMinusProps> = ({
  open,
  enabled,
}) => {
  const glyphColor = enabled ? 'button' : 'clear';
  return open ? (
    <CsfAppIcon color={glyphColor} icon="Minus" size="lg" />
  ) : (
    <CsfAppIcon color={glyphColor} icon="Plus" size="lg" />
  );
};

const CsfAccordionSection: React.FC<CsfAccordionSectionProps> = props => {
  const [open, setOpen] = useState(false);
  const externalState = typeof props.open !== 'undefined';

  useEffect(() => {
    if (externalState) setOpen(!!props.open);
  }, [props.open]);

  const id = testID(props.testID);

  return (
    <CsfView {...props}>
      <CsfPressable
        // TODO:UA:20240924 A11Y
        testID={id('toggleButton')}
        onPress={
          props.renderBody
            ? () => {
              setOpen(!open);
              props.onToggleOpen && props.onToggleOpen(!open);
            }
            : undefined
        }>
        <CsfView
          bg="backgroundSecondary"
          theme={props.headerTheme}
          testID={id('container')}>
          <CsfListItem
            icon={props.icon}
            title={props.title}
            titleTextVariant="subheading"
            subtitle={props.subtitle}
            subtitleTextVariant="body2"
            testID={id('layout')}
            action={<PlusMinus open={open} enabled={!!props.renderBody} />}
          />
        </CsfView>
      </CsfPressable>

      {open && props.renderBody && (
        <CsfView borderColor="rule" style={{ borderTopWidth: 1 }}>
          <CsfView
            theme={props.bodyTheme}
            testID={id('body')}
            bg={props.renderBodyBg || 'background'}>
            {typeof props.renderBody === 'function'
              ? props.renderBody()
              : props.renderBody}
          </CsfView>
        </CsfView>
      )}
    </CsfView>
  );
};

const MgaAccordionSection: React.FC<CsfAccordionSectionProps & { trackingId: string }> = props => {
  const { trackButton } = useTracking();
  const derivedTestID = testID(props?.testID || props?.trackingId);
  return (
    <CsfAccordionSection
      {...props}
      testID={derivedTestID()}
      onToggleOpen={v => {
        if (props.trackingId) {
          trackButton({
            trackingId: `${props.trackingId}-${v ? 'Open' : 'Close'}`,
            title: props.title,
          });
        }
      }}
    />
  );
};

// Default export for CsfAccordionSection
export default CsfAccordionSection;
export { MgaAccordionSection };
