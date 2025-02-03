/* eslint-disable eol-last */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  navigate,
  popIfTop,
  useAppNavigation,
  useAppRoute,
} from '../../Controller';
import { validate } from '../../utils/validate';
import { testID } from '../../components/utils/testID';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';

let nid = 0;
let receivers: { id: number; resolver: (value: string) => void }[] = [];

const send = (id: number | undefined, value: string) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

export type MgaTripTrackerEditAddressOptions = {
  id?: number
  currentAddress?: string
}

export const promptTripTrackingEditAddress = async (
  options?: MgaTripTrackerEditAddressOptions,
): Promise<string | null> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('TripTrackerEditAddress', {
      ...options,
      id: nid,
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

const MgaTripTrackerEditAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'TripTrackerEditAddress'>();
  const [address, setAddress] = useState<string>('');
  const [showErrors, setShowErrors] = useState(false);
  const errors = validate({ address }, { address: 'required' }, (_k, error) =>
    t(`validation:${error as string}`),
  );
  const onValidate = () => {
    setShowErrors(true);
    return Object.keys(errors).length == 0;
  };
  const onComplete = (address: string) => {
    if (route.params.id) {
      send(route.params.id, address);
      receivers = receivers.filter(r => r.id != route.params.id);
    }
    popIfTop(navigation, 'TripTrackerEditAddress');
  };

  const id = testID('TripTrackerEditAddress');
  return (
    <MgaPage
      bg="background"
      focusedEdit
      title={t('tripLogAddJournal:editLocationName')}>
      <MgaPageContent>
        <CsfView>
          <CsfText
            variant="bold"
            align="center"
            testID={id('currentLocationName')}>
            {t('tripLogAddJournal:currentLocationName')}
          </CsfText>
          {route.params?.currentAddress && (
            <CsfText align="center" testID={id('currentAddress')}>
              {route.params?.currentAddress}
            </CsfText>
          )}
        </CsfView>
        <CsfInput
          errors={showErrors && errors.address}
          label={t('tripLogAddJournal:newLocationName')}
          maxLength={30}
          outsideLabel
          value={address}
          onChangeText={setAddress}
          testID={id('newLocationName')}
        />
        <CsfView gap={12}>
          <MgaButton
            trackingId="TripTrackerEditAddressSaveLocation"
            variant="primary"
            title={t('tripLogAddJournal:saveLocationName')}
            onPress={() => onValidate() && onComplete(address)}
          />
          <MgaButton
            trackingId="TripTrackerEditAddressCancel"
            variant="secondary"
            title={t('common:cancel')}
            onPress={() => onComplete('')}
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaTripTrackerEditAddress;