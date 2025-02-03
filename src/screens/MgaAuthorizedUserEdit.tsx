import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import {
  AuthorizedUser,
  EditAuthorizedUserInfo,
  useEditAuthorizedUsersQuery,
  useUpdateSaveAuthorizedUserMutation,
} from '../features/profile/securitysettings/securitySettingsApi';
import { MSASuccess } from '../api';
import { formatPhone } from '../utils/phone';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { getVehicleGeneration } from '../utils/vehicle';
import { has } from '../features/menu/rules';
import { ClientSessionVehicle } from '../../@types';
import i18n from '../i18n';
import {
  CsfCustomRadioGroup,
  CsfCustomRadioGroupProps,
} from './MgaAuthorizedUserAdd';
import { testID } from '../components/utils/testID';
import { trackError } from '../components/useTracking';
import CsfCard from '../components/CsfCard';
import { MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfAlertBar from '../components/CsfAlertBar';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import { successNotice } from '../components/notice';

export const getAccessLevelOptions = (
  type: string,
  vehicle: ClientSessionVehicle | null,
  vehicleGeneration: number,
): string[] | [] => {
  const { t } = i18n;
  const isGeneration2 = vehicleGeneration === 2;
  const isGeneration3 = vehicleGeneration === 3;

  const commonOptions: string[] = [
    t('authorizedUsers:remoteLock'),
    t('authorizedUsers:remoteUnlock'),
    t('authorizedUsers:remoteHornLights'),
    t('authorizedUsers:remoteVehicleCheck'),
    t('authorizedUsers:remoteHealthReport'),
    t('authorizedUsers:remoteVehicleLocator'),
    t('authorizedUsers:serviceAppointment'),
  ];

  const gen2Level1: string[] = [
    t('authorizedUsers:boundaryAlert'),
    t('authorizedUsers:speedAlert'),
    t('authorizedUsers:curfewAlert'),
  ];

  const gen3Level1Common: string[] = [
    t('authorizedUsers:valetModeStatus'),
    t('authorizedUsers:valetModePasscode'),
  ];

  const gen3Level1: string[] = !has('flg:mga.remote.valetMode')
    ? gen3Level1Common
    : [
      t('authorizedUsers:tripTracker'),
      ...gen3Level1Common,
      t('authorizedUsers:valetModeSettings'),
    ];

  const isPhevCapable = has(['sub:SAFETY', 'cap:PHEV'], vehicle);

  const isNotPhevSafetyCapable = has(
    [
      'sub:SAFETY',
      { or: ['cap:RESCC', 'cap:RCC', 'cap:RES'] },
      { not: 'cap:PHEV' },
    ],
    vehicle,
  );

  const isRES = has(
    ['cap:RES', { not: 'cap:RCC' }, { not: 'cap:RESCC' }],
    vehicle,
  );

  const isRESCC = has([{ or: ['cap:RESCC', ['cap:RES', 'cap:RCC']] }], vehicle);

  const isKeyCar = has(
    ['sub:SAFETY', { not: ['cap:RES', 'cap:PHEV'] }],
    vehicle,
  );

  if (isNotPhevSafetyCapable) {
    if (isGeneration2) {
      return type === 'level1'
        ? [
          ...commonOptions,
          ...gen2Level1,
          isRES
            ? t('authorizedUsers:remoteEngineStarter')
            : isRESCC
              ? t('authorizedUsers:remoteEngineStart')
              : '',
        ]
        : [
          ...commonOptions,
          isRES
            ? t('authorizedUsers:remoteEngineStarter')
            : t('authorizedUsers:remoteEngineStart'),
        ];
    } else if (isGeneration3) {
      return type === 'level1'
        ? [
          ...commonOptions,
          ...gen2Level1,
          ...gen3Level1,
          isRES
            ? t('authorizedUsers:remoteEngineStarter')
            : isRESCC
              ? t('authorizedUsers:remoteEngineStart')
              : '',
        ]
        : [
          ...commonOptions,
          isRES
            ? t('authorizedUsers:remoteEngineStarter')
            : t('authorizedUsers:remoteEngineStart'),
          ...(has('flg:mga.remote.valetMode')
            ? [t('authorizedUsers:tripTracker')]
            : []),
        ];
    }
  } else if (isPhevCapable) {
    return type === 'level1'
      ? [
        ...commonOptions,
        ...gen2Level1,
        t('authorizedUsers:remoteClimateControl'),
        t('authorizedUsers:remoteBatteryCharging'),
      ]
      : [
        ...commonOptions,
        t('authorizedUsers:remoteClimateControl'),
        t('authorizedUsers:remoteBatteryCharging'),
      ];
  } else if (isKeyCar) {
    return type === 'level1'
      ? [...commonOptions, ...gen2Level1]
      : [...commonOptions];
  }
  return [];
};

const UserCard: React.FC<{ user?: AuthorizedUser; testID?: string }> = ({
  user,
  ...props
}) => {
  const { t } = useTranslation();
  const id = testID(props.testID);
  return (
    <CsfCard gap={16} testID={id()}>
      <CsfRuleList testID={id('list')}>
        {user?.title && (
          <CsfDetail
            testID={id('title')}
            label={t('common:title')}
            value={user?.title}
          />
        )}
        {user?.gender && (
          <CsfDetail
            testID={id('firstName')}
            label={t('common:gender')}
            value={user?.gender}
          />
        )}
        <CsfDetail
          testID={id('firstName')}
          label={t('authorizedUsers:firstName')}
          value={user?.firstName}
        />
        <CsfDetail
          testID={id('lastName')}
          label={t('authorizedUsers:lastName')}
          value={user?.lastName}
        />
        <CsfDetail
          testID={id('email')}
          label={t('authorizedUsers:authorizedUserEdit.emailAddress')}
          value={user?.email}
        />

        <CsfDetail
          testID={id('phone')}
          label={t('authorizedUsers:authorizedUserEdit.mobilePhone')}
          value={user?.phone ? formatPhone(user?.phone) : null}
        />
        <CsfDetail
          testID={id('streetAddress1')}
          label={t('authorizedUsers:authorizedUserEdit.streetAddress1')}
          value={user?.streetAddress1}
        />
        <CsfDetail
          testID={id('city')}
          label={t('common:city')}
          value={user?.city}
        />
        <CsfDetail
          testID={id('state')}
          label={t('geography:state')}
          value={user?.state}
        />
        <CsfDetail
          testID={id('postalCode')}
          label={t('geography:zipcode')}
          value={user?.postalCode}
        />
      </CsfRuleList>

      <CsfAlertBar
        flat
        testID={id('authUserInfo')}
        title={t(
          'authorizedUsers:authorizedUserEdit.authUserEdit',
        )} />
    </CsfCard>
  );
};

const MgaAuthorizedUserEdit: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vehicleGeneration = getVehicleGeneration(vehicle);
  const id = testID('AuthorizedUserEdit');

  const route = useAppRoute<'AuthorizedUserEdit'>();
  const vehicleAuthorizedAccountKey = Number(
    route.params?.vehicleAuthorizedAccountKey,
  );
  const { data, isFetching } = useEditAuthorizedUsersQuery({
    vehicleAuthorizedAccountKey: vehicleAuthorizedAccountKey,
  });
  const [request, status] = useUpdateSaveAuthorizedUserMutation();
  const checkForError = async () => {
    if (data?.success == false) {
      const _ = await promptAlert(
        t('common:error'),
        t('authorizedUsers:unableFetchUser'),
      );
      popIfTop(navigation, 'AuthorizedUserEdit');
    }
  };
  useEffect(() => {
    checkForError()
      .then()
      .catch(trackError('MgaAuthorizedUserEdit::checkForError'));
  }, [data]);

  const user: AuthorizedUser | null | undefined = data?.data;

  const initialValues = {
    accessLevel: user?.accessLevel?.toString(),
  };

  const accessLevel: MgaFormItemProps = {
    name: 'accessLevel',
    type: 'radio',
    componentProps: {
      value: user?.accessLevel,
    },
    component: (props: CsfCustomRadioGroupProps) => (
      <CsfCustomRadioGroup
        {...props}
        testID={id('levelRadioGroup')}
        features={[
          getAccessLevelOptions('level1', vehicle, vehicleGeneration).join(
            '\n',
          ),
          getAccessLevelOptions('level2', vehicle, vehicleGeneration).join(
            '\n',
          ),
        ]}
      />
    ),
    label: t('authorizedUsers:accessLevel'),
    options: [
      {
        label: t('authorizedUsers:level1Access'),
        value: '1',
      },
      {
        label: t('authorizedUsers:level2Access'),
        value: '2',
      },
    ],
  };

  return (
    <MgaPage title={t('authorizedUsers:editUser')} focusedEdit>
      <MgaPageContent isLoading={isFetching}>
        <UserCard user={user} testID={'userDetail'} />
        <MgaForm
          initialValues={initialValues}
          trackingId={'EditAuthorizedUser'}
          fields={[accessLevel]}
          cancelLabel={t('common:cancel')}
          submitLabel={t('common:submit')}
          onCancel={() => popIfTop(navigation, 'AuthorizedUserEdit')}
          isLoading={status.isLoading || isFetching}
          onSubmit={async (data: EditAuthorizedUserInfo) => {
            const payload = {
              ...data,
              accessLevel: Number(data?.accessLevel),
              action: 'edit',
              vehicleAuthorizedAccountKey,
            };
            try {
              const successResponse: MSASuccess =
                await request(payload).unwrap();
              if (successResponse?.success) {
                navigation.navigate('AuthorizedUsers');
                successNotice({
                  title: t('common:success'),
                  subtitle: t('authorizedUsers:userSaved'),
                });
              } else {
                CsfSimpleAlert(
                  t('common:failed'),
                  t('authorizedUsers:authorizedUserEdit.errorUpdateAuthUser'),
                  { type: 'error' },
                );
              }
            } catch (error) {
              CsfSimpleAlert(
                t('common:failed'),
                t('authorizedUsers:authorizedUserEdit.errorUpdateAuthUser'),
                { type: 'error' },
              );
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAuthorizedUserEdit;
