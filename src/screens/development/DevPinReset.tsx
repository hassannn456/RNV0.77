// cSpell:ignore Cust

import React from 'react';
import { useTranslation } from 'react-i18next';
import { store, useAppSelector } from '../../store';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfText from '../../components/CsfText';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfListItem from '../../components/CsfListItem';
import CsfButton from '../../components/CsfButton';
import { successNotice } from '../../components/notice';

const DevPinReset: React.FC = () => {
  const { t } = useTranslation();
  const vehicles = useAppSelector(state => state.session?.vehicles ?? []);
  const keychainPins = store.getState().keychain?.pin ?? {};
  const keychainOemCustIds = Object.keys(keychainPins);
  const sessionVehiclesWithKeychainPin = vehicles.filter(v =>
    keychainOemCustIds.includes(v.userOemCustId),
  );

  return (
    <MgaPage title={t('internalDevelopment:keychainSavedPins')}>
      <MgaPageContent title={t('internalDevelopment:keychainSavedPins')}>
        <CsfText variant="body">
          {t('internalDevelopment:keychainSavedPinsNotice')}
        </CsfText>
        {sessionVehiclesWithKeychainPin.length > 0 ? (
          <CsfRuleList>
            {sessionVehiclesWithKeychainPin.map(vehicle => {
              return (
                <CsfListItem
                  key={vehicle.userOemCustId}
                  title={vehicle.nickname}
                  subtitle={`VIN: ${vehicle.vin} \nPIN: ${keychainPins[vehicle.userOemCustId].length == 0
                    ? 'User opted not to Remember the PIN'
                    : keychainPins[vehicle.userOemCustId]
                    }`}
                  titleTextVariant="body2"
                  action={
                    <CsfButton
                      variant="link"
                      size="sm"
                      icon="Delete"
                      onPress={() => {
                        store.dispatch({
                          type: 'keychain/clearPin',
                          payload: vehicle.userOemCustId,
                        });
                        successNotice({
                          title: `Successfully reset PIN for ${vehicle.nickname ?? vehicle.vin
                            }`,
                        });
                      }}
                    />
                  }
                  ph={0}
                />
              );
            })}
          </CsfRuleList>
        ) : (
          <CsfText>{t('internalDevelopment:keychainNoSavedPins')}</CsfText>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default DevPinReset;
