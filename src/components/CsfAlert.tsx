/* eslint-disable eol-last */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { navigate, useAppNavigation, useAppRoute } from '../Controller';
import CsfButton, { CsfButtonType } from './CsfButton';
import CsfText from './CsfText';
import CsfView from './CsfView';
import CsfTile, { CsfTileDefaultProps } from './CsfTile';
import {
  AlertBarTypes,
  CsfAlertBarIconColors,
  CsfAlertBarIcons,
} from './CsfAlertBar';
import CsfAppIcon from './CsfAppIcon';
import CsfRule from './CsfRule';
import { testID } from './utils/testID';

export type CsfAlertAction = {
  title: string
  type?: CsfButtonType
  destructive?: boolean
}

let nid = 0;
let receivers: { id: number; resolver: (value: string) => void }[] = [];

const send = (id: number | undefined, value: string) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

/** Show alert outside components and capture selected response. */
const promptAlert = async (
  title: string,
  message?: string,
  actions?: CsfAlertAction[],
  options?: { type?: AlertBarTypes },
): Promise<string> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('Alert', {
      id: nid,
      title: title,
      message: message,
      actions: actions,
      options: options,
    });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};


export const CsfAlertStyles = StyleSheet.create({
  modalOuterStyle: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  translucentCover: { backgroundColor: '#0000004D' },
});

/** Simple alert view. Mostly used to present error messages. */
export const CsfAlert: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'Alert'>();
  const { t } = useTranslation();
  const { title, message, options } = route.params;
  const actions = route.params.actions ?? [{ title: t('common:ok') }];
  const { type } = options ?? {};
  const resolvedType = type == 'error' ? 'warning' : type; // TODO:UA:20240314 replace this once we get multi-color icons from CL
  // TODO:UA:20240412 change this 2 SVG files with new icons - SuccessAlertFill, ErrorAlertFill

  const id = testID(route.name);
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaView style={CsfAlertStyles.translucentCover}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={CsfAlertStyles.translucentCover.backgroundColor}
      />
      <CsfView style={CsfAlertStyles.modalOuterStyle}>
        <CsfTile p={0} gap={0}>
          <CsfView
            p={16}
            pb={0}
            gap={16}
            flexDirection="row"
            justify="space-between"
            align="flex-start">
            {resolvedType ? (
              <CsfAppIcon
                icon={CsfAlertBarIcons[resolvedType]}
                color={CsfAlertBarIconColors[resolvedType]}
                size="lg"
                testID={id('icon')}
              />
            ) : (
              <CsfView flex={1}>
                <CsfText variant="title3">{title}</CsfText>
              </CsfView>
            )}
            <CsfView width={24}>
              <CsfButton
                bg="button"
                icon="Close"
                variant="inlineLink"
                testID={id('close')}
                onPress={() => {
                  if (route.params.id) {
                    send(route.params.id, '');
                  }
                  navigation.goBack();
                }}
              />
            </CsfView>
          </CsfView>
          {/* If type == undefined, title is already shown above */}
          {title && resolvedType && (
            <CsfView ph={16} pt={12}>
              <CsfText variant="title3">{title}</CsfText>
            </CsfView>
          )}
          {title && (
            <CsfView pt={16}>
              <CsfRule />
            </CsfView>
          )}
          {message &&
            (message.includes('\n') ? (
              <CsfView ph={CsfTileDefaultProps.p} pt={24}>
                {message.split('\n').map((line, index) => (
                  <CsfText variant="body2" color="copySecondary" key={index}>
                    {line}
                  </CsfText>
                ))}
              </CsfView>
            ) : (
              <CsfView ph={CsfTileDefaultProps.p} pt={24}>
                <CsfText variant="body2">{message}</CsfText>
              </CsfView>
            ))}

          <CsfView ph={CsfTileDefaultProps.p} pt={20} pb={16} gap={12}>
            {actions.map((action, index) => {
              return (
                <CsfButton
                  key={index}
                  destructive={action.destructive}
                  title={action.title}
                  testID={id(`button-${index}`)}
                  variant={
                    action.type
                      ? action.type
                      : index == 0
                        ? 'primary'
                        : 'secondary'
                  }
                  onPress={() => {
                    if (route.params.id) {
                      send(route.params.id, action.title);
                    }
                    navigation.goBack();
                  }}
                />
              );
            })}
          </CsfView>
        </CsfTile>
      </CsfView>
    </SafeAreaView>
  );
};


export default promptAlert;