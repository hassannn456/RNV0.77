/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAuthorizedUsersQuery,
  useUpdateDeleteAuthorizedUserMutation,
} from '../features/profile/securitysettings/securitySettingsApi';
import promptAlert, { CsfAlertAction } from '../components/CsfAlert';
import { formatPhone } from '../utils/phone';
import AuthorizedUserIcon from '../../content/svg/authorized-user.svg';
import { useAppNavigation } from '../Controller';
import { MSASuccess } from '../api';
import {
  gen2Plus,
  has,
  isCurrentVehicleRightToRepairByState,
} from '../features/menu/rules';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { Linking } from 'react-native';
import { useCustomerProfileQuery } from '../features/profile/contact/contactApi';
import { tomTomFindByPostalCode } from '../features/geolocation/tomtom.api';
import { testID } from '../components/utils/testID';
import CsfListItem from '../components/CsfListItem';
import { CsfListItemActions } from '../components/CsfListItemActions';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import { successNotice } from '../components/notice';

const MgaAuthorizedUsers: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { data, isFetching } = useAuthorizedUsersQuery(undefined);
  const [request, status] = useUpdateDeleteAuthorizedUserMutation();
  const { data: profileData } = useCustomerProfileQuery({
    vin: vehicle?.vin || '',
    oemCustId: vehicle?.oemCustId || '',
  });
  const deleteAuthorizedUser = async (vehicleAuthorizedAccountKey: number) => {
    try {
      const payload = {
        vehicleAuthorizedAccountKey,
      };
      const successResponse: MSASuccess = await request(payload).unwrap();
      if (successResponse?.success) {
        successNotice({
          title: t('common:success'),
          subtitle: t('authorizedUsers:deletedSuccessfully'),
        });
      } else {
        CsfSimpleAlert(t('common:failed'), t('authorizedUsers:errorDeleting'), {
          type: 'error',
        });
      }
    } catch (error) {
      CsfSimpleAlert(t('common:failed'), t('authorizedUsers:errorDeleting'), {
        type: 'error',
      });
    }
  };

  const handleAddUser = async () => {
    const { data: responseData } = profileData || {};
    const customerProfile = responseData?.customerProfile;
    const location = await tomTomFindByPostalCode(
      customerProfile?.zip5Digits || '',
    );
    if (
      isCurrentVehicleRightToRepairByState(
        vehicle,
        location?.address.countrySubdivision,
      ) ||
      isCurrentVehicleRightToRepairByState(vehicle, customerProfile?.state)
    ) {
      const actions: CsfAlertAction[] = [
        {
          title: t('home:callCustomerSupport'),
          type: 'primary',
        },
      ];
      const response = await promptAlert(
        t('authorizedUsers:addUser'),
        t('home:authorizedUserNotAllowedAlert'),
        actions,
      );
      if (response === t('home:callCustomerSupport')) {
        await Linking.openURL(t('contact:customerSupportLink'));
      }
      return;
    }
    navigation.navigate('EnterPassword', { action: 'add' });
  };

  const id = testID('AuthorizedUsers');
  return (
    <MgaPage title={t('authorizedUsers:title')} showVehicleInfoBar>
      <MgaPageContent isLoading={isFetching} title={t('authorizedUsers:title')}>
        <CsfTile p={0} testID={id('pageTile')}>
          <CsfRuleList testID={id('pageRuleList')}>
            {data?.data?.authorizedUsers?.map((authorizedUser, i) => {
              const itemTestId = testID(id(`authorizedUser-${i}`));
              function promptAlert(title: string, message: string, arg2: { title: string; type: string }[]) {
                throw new Error('Function not implemented.');
              }

              return (
                <CsfListItem
                  key={i}
                  testID={itemTestId('list')}
                  title={`${authorizedUser.firstName} ${authorizedUser.lastName}`}
                  subtitle={
                    <CsfView testID={itemTestId('userContainer')}>
                      <CsfText variant="caption" testID={itemTestId('email')}>
                        {authorizedUser.email}
                      </CsfText>
                      <CsfText variant="caption" testID={itemTestId('phone')}>
                        {formatPhone(authorizedUser.phone)}
                      </CsfText>
                      <CsfText
                        variant="caption"
                        color="copySecondary"
                        testID={itemTestId('level1Access')}>
                        {authorizedUser.accessLevel == 1
                          ? t('authorizedUsers:level1Access')
                          : authorizedUser.accessLevel == 2
                            ? t('authorizedUsers:level2Access')
                            : ''}
                      </CsfText>
                    </CsfView>
                  }
                  action={
                    <CsfListItemActions
                      trackingId={itemTestId('listActions')}
                      title={`${authorizedUser.firstName} ${authorizedUser.lastName}`}
                      options={[
                        has(gen2Plus, vehicle)
                          ? {
                            label: t('common:edit'),
                            value: 'edit',
                            handleSelect: () => {
                              navigation.navigate('EnterPassword', {
                                action: 'edit',
                                vehicleAuthorizedAccountKey:
                                  authorizedUser.vehicleAuthorizedAccountKey,
                              });
                            },
                          }
                          : undefined,
                        !status.isLoading
                          ? {
                            label: t('common:delete'),
                            value: 'delete',
                            icon: 'Delete',
                            variant: 'link',

                            handleSelect: async () => {
                              const title = t('common:attention');
                              const message: string = t(
                                'authorizedUsers:wantDelete',
                              );
                              const yes: string = t('common:delete');
                              const no: string = t('common:cancel');
                              const response = await promptAlert(
                                title,
                                message,
                                [
                                  { title: yes, type: 'primary' },
                                  { title: no, type: 'secondary' },
                                ],
                              );
                              if (response == yes) {
                                await deleteAuthorizedUser(
                                  Number(
                                    authorizedUser.vehicleAuthorizedAccountKey,
                                  ),
                                );
                              }
                            },
                          }
                          : undefined,
                      ]}
                    />
                  } />
              );
            })}
          </CsfRuleList>
        </CsfTile>
        {data?.data?.authorizedUsers?.length === 0 && (
          <>
            <CsfView pt={10} align="center" testID={id('noUserContainer')}>
              <AuthorizedUserIcon width={80} height={80} />
              <CsfView
                p={10}
                align="center"
                testID={id('noUserInnerContainer')}>
                <CsfText align="center" testID={id('pageDescription')}>
                  {t('authorizedUsers:pageDescription')}
                </CsfText>
              </CsfView>
            </CsfView>
          </>
        )}
        {data?.data?.authorizedUsers &&
          data?.data?.authorizedUsers?.length >= 5 ? (
          <CsfView align="center" testID={id('maxNumberContainer')}>
            <CsfText testID={id('reachedMaxNumber')}>
              {t('authorizedUsers:reachedMaxNumber')}
            </CsfText>
          </CsfView>
        ) : (
          <CsfView align="center" testID={id('addUserContainer')}>
            {has('sub:REMOTE', vehicle) && (
              <MgaButton
                width={'100%'}
                onPress={() => {
                  void handleAddUser();
                }}
                trackingId="AddAuthorizedUserButton"
                title={t('authorizedUsers:addUser')}
                variant="primary"
              />
            )}
          </CsfView>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAuthorizedUsers;
