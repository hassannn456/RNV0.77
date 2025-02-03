/* eslint-disable eol-last */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import CsfActivityIndicator from './CsfActivityIndicator';
import CsfAppIcon from './CsfAppIcon';
import CsfButton, { CsfButtonProps } from './CsfButton';
import { remoteStatusReducer } from '../features/remoteService/remoteStatus.slice';
import {
  RemoteCommandStatus,
  cancelRemoteCommand,
  executeRemoteCommand,
} from '../features/remoteService/remoteService.api';

import CsfStatusBar from './CsfAlertBar';

/** Get status state
 *
 * Some commands are returning {success: true, errorCode: non-null}
 * when a command fails. */
export const getStatusState = (
  status: RemoteCommandStatus,
): 'progress' | 'success' | 'failure' => {
  switch (status?.remoteServiceState) {
    case 'finished':
    case 'completed':
      return status.errorCode == null ? 'success' : 'failure';
  }
  return 'progress';
};

/** MySubaru control for showing progress on remote commands */
const MgaSnackBarRemoteServices: React.FC = () => {
  const dispatch = useAppDispatch();
  const remoteStatus = useAppSelector(state => remoteStatusReducer(state));
  const { t } = useTranslation();

  const cancellable =
    remoteStatus?.remoteServiceState == 'scheduled' &&
    remoteStatus?.command.cancel;

  const stoppable =
    remoteStatus &&
    getStatusState(remoteStatus) == 'success' &&
    remoteStatus.remoteServiceState == 'finished' &&
    remoteStatus.command.stop;

  let timeout: ReturnType<typeof setTimeout>;
  useEffect(
    function () {
      if (timeout) { clearTimeout(timeout); }
      timeout = setTimeout(function () {
        if (
          (remoteStatus?.remoteServiceState == 'finished' ||
            remoteStatus?.remoteServiceState == 'completed') &&
          !stoppable &&
          !cancellable
        ) { dispatch({ type: 'remoteStatus/hide' }); }
      }, 5000);

      return function () {
        if (timeout) { clearTimeout(timeout); }
      };
    },
    [remoteStatus],
  );

  const actionButtonProps: CsfButtonProps = {
    style: { minWidth: 60, marginVertical: 8 },
    variant: 'link',
    size: 'sm',
  };

  return remoteStatus ? (
    <CsfStatusBar
      title={(() => {
        const state = remoteStatus.errorCode
          ? 'failed'
          : remoteStatus.remoteServiceState;
        const key =
          remoteStatus.cancelled && remoteStatus.command.cancel
            ? `${remoteStatus.command.cancel.name}.${state}`
            : `${remoteStatus.command.name}.${state}`;
        const updateTime = remoteStatus.updateTime
          ? new Date(remoteStatus.updateTime)
          : new Date();
        const now = updateTime.toLocaleString(undefined, {
          hour: 'numeric',
          minute: 'numeric',
        });
        const opt = {
          now: now,
          defaultValue: '',
        };
        const status: string = t(key, opt);
        return status;
      })()}
      titleTextVariant="body2"
      subtitleTextVariant="body2"
      subtitle={(() => {
        const updateTime = remoteStatus.updateTime
          ? new Date(remoteStatus.updateTime)
          : new Date();
        const now = updateTime.toLocaleString(undefined, {
          hour: 'numeric',
          minute: 'numeric',
        });

        return now;
      })()}
      icon={(() => {
        switch (getStatusState(remoteStatus)) {
          case 'progress':
            return <CsfActivityIndicator />;
          case 'success':
            return <CsfAppIcon color="success" icon="SuccessColor" />;
          case 'failure':
            return <CsfAppIcon color="error" icon="ErrorColor" />;
        }
      })()}
      action={
        <>
          {cancellable && (
            <CsfButton
              onPress={() =>
                remoteStatus.command.cancel &&
                cancelRemoteCommand(
                  remoteStatus.command.cancel,
                  {
                    vin: remoteStatus.vin,
                    pin: '',
                    delay: 0,
                    serviceRequestId: remoteStatus.serviceRequestId,
                  },
                  {
                    requires: ['session', 'timestamp'],
                  },
                )
              }
              {...actionButtonProps}
              title={t('common:cancel')}
              variant="inlineLink"
            />
          )}

          {stoppable && (
            <CsfButton
              onPress={() =>
                remoteStatus.command.stop &&
                executeRemoteCommand(
                  remoteStatus.command.stop,
                  {
                    vin: remoteStatus.vin,
                    pin: '',
                  },
                  {
                    requires: ['session', 'timestamp'],
                  },
                )
              }
              {...actionButtonProps}
              title={t('common:stop')}
              variant="inlineLink"
            />
          )}
        </>
      }></CsfStatusBar>
  ) : null;
};

export default MgaSnackBarRemoteServices;