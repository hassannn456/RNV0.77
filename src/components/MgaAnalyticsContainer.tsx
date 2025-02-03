/* eslint-disable eol-last */
import React, { ReactNode, useEffect } from 'react';
import { MgaAnalyticsContext } from './MgaAnalyticsContext';
import useTracking from './useTracking';

export type MgaAnalyticsContainerProps = {
  trackingId: string
  name?: string
  children?: ReactNode
}

const MgaAnalyticsContainer: React.FC<
  MgaAnalyticsContainerProps
> = props => {
  const { trackImpression } = useTracking();
  const { children } = props;
  useEffect(() => {
    trackImpression({
      trackingId: props.trackingId,
      title: props.name,
      trackingVars: { e2: 1, e24: props?.name, e25: props?.trackingId },
    });
  }, []);

  return (
    <MgaAnalyticsContext.Provider
      value={{ id: props.trackingId, name: props?.name }}>
      {children}
    </MgaAnalyticsContext.Provider>
  );
};

export default MgaAnalyticsContainer;