import React, { useEffect } from 'react';
import { navigate, useAppNavigation, useAppRoute } from '../Controller';
import { CsfButtonType } from '../components/CsfButton';
import { CsfIcon } from '../../core/res/assets/icons';
import CsfBottomModal from '../components/CsfBottomModal';
import CsfView from '../components/CsfView';
import MgaAnalyticsContainer from '../components/MgaAnalyticsContainer';
import MgaButton from '../components/MgaButton';

let nid = 0;
let receivers: { id: number; resolver: (value: string) => void }[] = [];

const send = (id: number | undefined, value: string) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

export interface MgaModalSelectOption {
  label: string
  value: string
  variant?: CsfButtonType
  destructive?: boolean
  icon?: CsfIcon
}
export interface MgaModalSelectOptions {
  title?: string
  message?: string
  options?: MgaModalSelectOption[]
  trackingId?: string
}

/** Fullscreen modal to select from a list of items. Callable from outside components. */
export const promptSelect = async (
  options?: MgaModalSelectOptions,
): Promise<string> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('ModalSelect', { id: nid, options: options });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

/** Modal to request choice from user. */
const MgaModalSelect: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'ModalSelect'>();
  const title = route.params.options?.title;
  const message = route.params.options?.message;
  const options = route.params.options?.options ?? [];

  /** if user taps on select modal's background [without selecting any option] **/
  useEffect(() => {
    return () => {
      send(route.params.id, '');
    };
  });

  const onComplete = (value: string) => {
    send(route.params.id, value);
    navigation.goBack();
  };

  const trackingId: string = route.params.options?.trackingId || 'Select';
  return (
    <MgaAnalyticsContainer trackingId={trackingId}>
      <CsfBottomModal title={title} message={message}>
        <CsfView gap={12}>
          {options.map(option => (
            <MgaButton
              trackingId={`${trackingId}-${option.value}`}
              key={option.value}
              title={option.label}
              onPress={() => onComplete(option.value)}
              variant={option.variant || 'primary'}
              destructive={option.destructive}
              icon={option.icon}
            />
          ))}
        </CsfView>
      </CsfBottomModal>
    </MgaAnalyticsContainer>
  );
};

export default MgaModalSelect;
