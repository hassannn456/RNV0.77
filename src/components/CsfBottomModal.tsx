/* eslint-disable eol-last */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useAppNavigation } from '../Controller';
import { useCsfColors } from './useCsfColors';
import CsfText from './CsfText';
import CsfView, { CsfViewProps } from './CsfView';
import { boxShadow } from './constants';
import { CsfAlertStyles } from './CsfAlert';
import CsfPressable from './CsfPressable';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimension } from './types';
import { testID } from './utils/testID';
import CsfAppIcon from './CsfAppIcon';

export interface CsfBottomModalProps extends CsfViewProps {
  closeIcon?: boolean
  title?: string
  message?: string
}

const bottomModal = StyleSheet.create({
  outerStyle: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    opacity: 1,
  },
  innerStyle: {
    borderRadius: 8,
    ...boxShadow(0, -2, '#000000', 0.15, 4, 2),
    padding: 16,
  },
});

/** Partial modal from bottom of screen. */
const CsfBottomModal: React.FC<CsfBottomModalProps> = ({
  closeIcon,
  title,
  message,
  children,
  ...viewProps
}) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { colors } = useCsfColors();
  const safeAreaInsets = useSafeAreaInsets();

  const translationValue = 600;
  const duration = 200;
  const translation = useRef(new Animated.Value(translationValue)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translation, {
        duration,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const id = testID(viewProps.testID);
  return (
    <CsfPressable
      style={[bottomModal.outerStyle]}
      testID={id('close')}
      onPress={() => {
        !closeIcon &&
          Animated.parallel([
            Animated.timing(translation, {
              duration,
              toValue: translationValue,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              duration,
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start(() => navigation.pop());
      }}
      aria-label={t('common:close')}>
      <Animated.View
        style={[
          CsfAlertStyles.translucentCover,
          bottomModal.outerStyle,
          { zIndex: 0, position: 'absolute', opacity: opacity },
        ]}
      />
      <Animated.View
        style={{
          zIndex: 1,
          transform: [{ translateY: translation }],
        }}>
        <CsfView
          style={[
            bottomModal.innerStyle,
            { backgroundColor: colors.background },
          ]}
          gap={16}>
          <CsfView>
            {closeIcon && (
              <CsfView align="flex-end">
                <CsfPressable
                  onPress={() => {
                    navigation.pop();
                  }}>
                  <CsfAppIcon icon={'Close'} size="md" color="button" />
                </CsfPressable>
              </CsfView>
            )}
            <CsfText
              align="center"
              color="copyPrimary"
              variant="heading"
              testID={id('title')}>
              {title ?? ''}
            </CsfText>

            {message && (
              <CsfText
                align="center"
                color="copySecondary"
                variant="body"
                testID={id('message')}>
                {message ?? ''}
              </CsfText>
            )}
          </CsfView>
          <CsfView pb={safeAreaInsets.bottom as Dimension} {...viewProps}>
            {children}
          </CsfView>
        </CsfView>
      </Animated.View>
    </CsfPressable>
  );
};

export default CsfBottomModal;