/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../store';
import  CsfButton  from './CsfButton';
import  CsfView  from './CsfView';
import { NoticePayload } from '../features/notices/notices.slice';
import { CsfColorPalette } from './useCsfColors';
import { boxShadow } from './constants';
import { CsfAlertBar } from './CsfAlertBar';
import CsfAppIcon from './CsfAppIcon';

const SnackbarAlert: React.FC<NoticePayload> = props => {
  const dispatch = useAppDispatch();
  const dismiss = () =>
    dispatch({ type: 'notices/dismissNotice', payload: props.noticeKey });

  let timeout: ReturnType<typeof setTimeout>;
  const { type: noticeType, dismissable } = props;
  const isDismissable = dismissable || noticeType == 'error';
  const color: keyof CsfColorPalette =
    props.type === 'information'
      ? 'button'
      : (props.type as keyof CsfColorPalette);
  useEffect(() => {
    if (timeout) clearTimeout(timeout);
    if (props.type == 'error') return;
    timeout = setTimeout(dismiss, 5000);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);
  return (
    <CsfAlertBar
      style={boxShadow(1, 2, '#000000', 0.1, 3, 2)}
      title={props.title}
      icon={
        <CsfAppIcon
          icon={
            props.type == 'success'
              ? 'Success'
              : props.type == 'information'
                ? 'Information'
                : 'WarningAttention'
            //TODO:UA:20240208 get error icon from CL
          }
          color={color}
        />
      }
      subtitle={props.subtitle}
      type={props.type}
      action={
        isDismissable && (
          <CsfButton
            icon="Close"
            bg="copySecondary"
            size="sm"
            variant="inlineLink"
            aria-label="close"
            onPress={dismiss}
          />
        )
      }
    />
  );
};
export const MgaSnackBarAlerts: React.FC = () => {
  const notices = useAppSelector(state => state.notices.notices);

  return notices.length ? (
    <CsfView gap={12}>
      {notices.map((notice: React.JSX.IntrinsicAttributes & NoticePayload) => (
        <SnackbarAlert {...notice} key={notice.noticeKey} />
      ))}
    </CsfView>
  ) : null;
};
