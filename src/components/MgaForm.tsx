/* eslint-disable curly */
/* eslint-disable no-void */
/* eslint-disable eol-last */
import React from 'react';
import {
  CsfFormItemProps,
  CsfFormProps,
} from '../components/index';
import { useTranslation } from 'react-i18next';
import useTracking from './useTracking';
import CsfForm from './CsfForm/CsfForm';
import MgaAnalyticsContainer from './MgaAnalyticsContainer';

export interface MgaFormProps extends CsfFormProps {
  trackingId: string
}

export type MgaFormItemProps = CsfFormItemProps

const MgaFormInner: React.FC<MgaFormProps> = (
  // TODO:AG:20240523 -- do we need to track impressions? most forms are the same as their page
  props: MgaFormProps,
): JSX.Element => {
  const { trackButton } = useTracking();
  const { t } = useTranslation();
  const { fields } = props;
  const handleSubmit = (data?: object) => {
    void trackButton({
      trackingId: `${props.trackingId}-Submit`,
      trackingVars: { e4: 1 },
    });
    void props.onSubmit(data);
  };
  const handleCancel = () => {
    if (!props.onCancel) return;
    props.onCancel();
    trackButton({ trackingId: `${props.trackingId}-Cancel` });
  };
  return (
    <CsfForm
      {...props}
      fields={fields}
      submitLabel={
        props.submitLabel ? t(props.submitLabel) : t('common:submit')
      }
      onSubmit={handleSubmit}
      onCancel={props.onCancel ? handleCancel : undefined}
    />
  );
};

const MgaForm: React.FC<MgaFormProps> = (
  props: MgaFormProps,
): JSX.Element => {
  return (
    <MgaAnalyticsContainer trackingId={props.trackingId} name={props?.title}>
      <MgaFormInner {...props} />
    </MgaAnalyticsContainer>
  );
};

export default MgaForm;