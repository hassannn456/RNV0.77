/* eslint-disable react/self-closing-comp */
import React, {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import CsfView, { CsfViewProps } from './CsfView';
import CsfPressable from './CsfPressable';
import CsfRule from './CsfRule';
import CsfAppIcon from './CsfAppIcon';
import CsfText from './CsfText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCsfColors } from './useCsfColors';
import { CsfIcon } from '../../core/res/assets/icons';
import { boxShadow } from './constants';

export interface CsfWindowShadeProps extends CsfViewProps {
  title?: string | (() => ReactNode)
  icon?: CsfIcon
  disabled?: boolean
  overlay?: boolean
}

export interface CsfWindowShadeRef {
  setShadeOpen: (open: boolean) => void
  isShadeOpen: boolean
}

export const CsfWindowShade = forwardRef<
  CsfWindowShadeRef,
  CsfWindowShadeProps
>(({ bg, title, icon, disabled, overlay, children, ...viewProps }, ref) => {
  const { colors } = useCsfColors();
  const [isShadeOpen, setShadeOpen] = useState(false);
  useImperativeHandle(ref, () => ({ setShadeOpen }));
  const backgroundStyle = {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors[bg ?? 'backgroundSecondary'],
    ...boxShadow(0, -2, '#000000', 0.15, 4, 2),
  };
  const containerStyle = {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    opacity: disabled ? 0.5 : 1,
    paddingBottom: 16,
  };
  return (
    <>
      {isShadeOpen && overlay && (
        <CsfPressable
          onPress={() => setShadeOpen(false)}
          style={{
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            padding: 20,
            backgroundColor: '#0000004D',
            position: 'absolute',
            zIndex: 0,
          }}></CsfPressable>
      )}
      <SafeAreaView edges={['bottom']} style={backgroundStyle}>
        <CsfView width={'100%'} style={containerStyle}>
          <CsfPressable
            onPress={() => {
              if (disabled) {
                return;
              }
              setShadeOpen(!isShadeOpen);
            }}>
            <CsfView
              style={{
                alignItems: 'center',
                height: 24,
                justifyContent: 'center',
              }}>
              <CsfView
                bg="rule"
                style={{ height: 4, width: 40, borderRadius: 2 }}
              />
            </CsfView>
            <CsfView
              align="center"
              flexDirection="row"
              justify="center"
              gap={8}
              p={8}
              mb={4}
              pt={0}>
              <CsfAppIcon icon={icon} />
              {title &&
                (typeof title == 'string' ? (
                  <CsfText variant="heading" color="copyPrimary">
                    {title}
                  </CsfText>
                ) : (
                  title()
                ))}
            </CsfView>
          </CsfPressable>
          {isShadeOpen && (
            <CsfView {...viewProps}>
              <CsfRule />
              {children}
            </CsfView>
          )}
        </CsfView>
      </SafeAreaView>
    </>
  );
});
