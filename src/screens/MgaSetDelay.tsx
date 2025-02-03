/* eslint-disable eqeqeq */
/* eslint-disable radix */
import i18n from '../i18n';
import { promptSelect } from './MgaModalSelect';

/** Prompt user for delay before remote engine start */
const promptDelay = async (): Promise<number | null> => {
  const { t } = i18n;
  const options: { label: string; value: string }[] = [
    {
      label: t('setDelay:noDelay'),
      value: '0',
    },
    {
      label: t('setDelay:1MinuteDelay'),
      value: '1',
    },
    {
      label: t('setDelay:5MinuteDelay'),
      value: '5',
    },
    {
      label: t('setDelay:10MinuteDelay'),
      value: '10',
    },
  ];
  const delay = await promptSelect({
    trackingId: 'SelectDelay',
    title: t('setDelay:title'),
    options: options,
  });
  return delay == '' ? null : parseInt(delay);
};

export default promptDelay;