import React from 'react';
import {
  Modal,
  ModalProps,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useCsfColors } from './useCsfColors';
import CsfListItem from './CsfListItem';
import CsfView from './CsfView';
import CsfRule from './CsfRule';

export interface CsfModalProps extends ModalProps {
  backgroundStyle?: ViewStyle
  leadingAccessoryView?: React.ReactNode
  modalOuterStyle?: ViewStyle
  modalInnerStyle?: ViewStyle
  title?: string
  titleStyle?: ViewStyle
  trailingAccessoryView?: React.ReactNode
  fullBleed?: boolean
}

const CsfModal: React.FC<CsfModalProps> = props => {
  const { colors } = useCsfColors();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle: ViewStyle = {
    backgroundColor: '#00000077',
    zIndex: 1,
    ...props.backgroundStyle,
  };
  const styles = StyleSheet.create({
    modalOuterStyle: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      padding: props.fullBleed ? 0 : 16,
      ...props.modalOuterStyle,
    },
    modalInnerStyle: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 4,
      width: '100%',
      maxHeight: props.fullBleed ? '100%' : '90%',
      height: props.fullBleed ? '100%' : 'auto',
      ...props.modalInnerStyle,
    },
  });

  const hasTitleBar =
    props.leadingAccessoryView || props.title || props.trailingAccessoryView;
  return (
    <Modal transparent={true}>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <CsfView style={[styles.modalOuterStyle, backgroundStyle]}>
          <CsfView style={[styles.modalInnerStyle]}>
            {hasTitleBar && (
              <CsfView>
                <CsfListItem
                  title={props.title}
                  titleStyle={props.titleStyle}
                  action={props.trailingAccessoryView}
                  icon={props.leadingAccessoryView}
                />
                <CsfRule orientation="horizontal" />
              </CsfView>
            )}
            {props.children}
          </CsfView>
        </CsfView>
      </SafeAreaView>
    </Modal>
  );
};

export default CsfModal;