/* eslint-disable eqeqeq */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EmergencyContacts,
  useEmergencyContactsFetchQuery,
  useUpdateDeleteEmergencyContactMutation,
} from '../features/profile/emergencyContacts/emergencyContactsApi';
import { formatPhone } from '../utils/phone';
import { navigate, useAppNavigation } from '../Controller';
import { MSASuccess } from '../api';
import AuthorizedUserIcon from '../../content/svg/authorized-user.svg';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import CsfListItem from '../components/CsfListItem';
import { CsfListItemActions } from '../components/CsfListItemActions';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfTile from '../components/CsfTile';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';

export interface test {
  title: string
}

const MgaEmergencyContacts: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { data: response, isLoading } =
    useEmergencyContactsFetchQuery(undefined);
  const emergencyContactsData: EmergencyContacts[] = response?.data || [];
  const [request, status] = useUpdateDeleteEmergencyContactMutation();
  const loading = isLoading || status.isLoading;

  const deleteEmergencyContact = async (emergencyContactId: number) => {
    try {
      const payload = {
        emergencyContactId,
      };
      const successResponse: MSASuccess = await request(payload).unwrap();
      if (successResponse?.success) {
        successNotice({
          title: t('common:success'),
          subtitle: t(
            'emergencyContacts:emergencyContactsLanding.contactDeleted',
          ),
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

  const id = testID('EmergencyContacts');
  return (
    <MgaPage title={t('emergencyContacts:title')} showVehicleInfoBar>
      <MgaPageContent title={t('emergencyContacts:title')} isLoading={loading}>
        <CsfView gap={16} testID={id('container')}>
          <CsfRuleList testID={id('list')}>
            <CsfTile p={0} testID={id('listTile')}>
              {emergencyContactsData?.map((item, index) => (
                <CsfListItem
                  testID={id(`listItem-${index}`)}
                  key={index}
                  title={
                    <CsfText
                      variant="heading"
                      testID={id(`detailText-${index}`)}>
                      {item?.firstName} {item?.lastName}
                      {item?.relationshipPriority == '1' && (
                        <CsfText testID={id('primaryContact')}>
                          {' '}
                          {t(
                            'emergencyContacts:emergencyContactsLanding.primaryContact',
                          )}
                        </CsfText>
                      )}
                    </CsfText>
                  }
                  subtitle={formatPhone(item?.phone)}
                  subtitleTextVariant="body2"
                  action={
                    <CsfListItemActions
                      testID={id('editContact')}
                      trackingId={`EmergencyContactActions-${index}`}
                      title={`${item.firstName} ${item.lastName}`}
                      options={[
                        {
                          label: t('common:edit'),
                          value: 'edit',
                          handleSelect: () => {
                            navigation.push('AddEmergencyContact', {
                              action: 'edit',
                              availableContacts: emergencyContactsData?.length,
                              data: item,
                            });
                          },
                        },
                        {
                          label: t('common:delete'),
                          icon: 'Delete',
                          value: 'delete',
                          variant: 'link',
                          handleSelect: async () => {
                            const title = t('common:attention');
                            const message: string = t(
                              'emergencyContacts:emergencyContactsLanding.wantDelete',
                            );
                            const yes: string = t('common:delete');
                            const no: string = t('common:cancel');
                            const response = await promptAlert(title, message, [
                              { title: yes, type: 'primary' },
                              { title: no, type: 'secondary' },
                            ]);
                            if (response == yes) {
                              await deleteEmergencyContact(
                                Number(item.emergencyContactId),
                              );
                            }
                          },
                        },
                      ]}
                    />
                  }
                />
              ))}

              {emergencyContactsData?.length == 0 && (
                <CsfView
                  align="center"
                  p={16}
                  gap={16}
                  testID={id('disclaimerContainer')}>
                  <AuthorizedUserIcon height={60} width={60} />

                  <CsfText align="center" testID={id('disclaimerText')}>
                    {t(
                      'emergencyContacts:emergencyContactsLanding.createContactList',
                    )}
                  </CsfText>
                </CsfView>
              )}
            </CsfTile>
          </CsfRuleList>

          {emergencyContactsData?.length == 3 ? (
            <CsfView align="center" flex={1} testID={id('maxNumberContainer')}>
              <CsfText testID={id('maxNumberText')}>
                {t(
                  'emergencyContacts:emergencyContactsLanding.reachedMaxNumber',
                )}
              </CsfText>
            </CsfView>
          ) : (
            <MgaButton
              trackingId="EmergencyContactsAddContactButton"
              title={t('emergencyContacts:emergencyContactsLanding.addContact')}
              onPress={() => {
                navigate('AddEmergencyContact', {
                  action: 'add',
                  availableContacts: emergencyContactsData?.length,
                });
              }}
            />
          )}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaEmergencyContacts;
