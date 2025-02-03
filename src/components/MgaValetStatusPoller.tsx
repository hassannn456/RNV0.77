import React, { useState, useCallback, useEffect } from 'react';
import { store } from '../store';
import { vehicleApi } from '../api/vehicle.api';
import { ValetStatus } from '../../@types';
import { useValetModeSettingsQuery, useValetModeSetupQuery } from '../features/remoteService/valetMode';

interface MgaValetStatusPollerProps {
  shortPollIntervalMs: number;
  longPollIntervalMs: number;
  params: { vin: string };
}

let pollerId: ReturnType<typeof setInterval> | null = null;

const MgaValetStatusPoller: React.FC<MgaValetStatusPollerProps> = ({
  shortPollIntervalMs,
  longPollIntervalMs,
  params,
}) => {
  const _valetSettings = useValetModeSettingsQuery(params);
  const _valetSetup = useValetModeSetupQuery(params);

  const [status, setStatus] = useState<ValetStatus | null>(null);

  const pollStatus = useCallback(() => {
    store
      .dispatch(vehicleApi.endpoints.vehicleValetStatus.initiate(params))
      .then((response) => {
        const updatedStatus = response.data?.data;
        setStatus(updatedStatus || null);
      })
      .catch(console.error);
  }, [params]);

  useEffect(() => {
    // Start polling when the component is mounted
    pollerId = setInterval(
      () => {
        pollStatus();
      },
      status === 'VAL_ON' || status === 'VAL_ON_PENDING' ? shortPollIntervalMs : longPollIntervalMs
    );

    return () => {
      // Clear the interval on component unmount
      if (pollerId) {
        clearInterval(pollerId);
        pollerId = null;
      }
    };
  }, [pollStatus, status, shortPollIntervalMs, longPollIntervalMs]);

  return null;
};

export default MgaValetStatusPoller;
