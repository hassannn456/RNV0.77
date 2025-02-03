import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';

import { useLazyForgotUsernameQuery } from '../features/forgot/forgotApi';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import { MgaFormItemProps } from '../components';
import CsfBulletedList from '../components/CsfBulletedList';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaForgotUsername: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ForgotUsername'>();
  const [request, response] = useLazyForgotUsernameQuery();
  const isLoading = response.isLoading;
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'vin',
      label: t('forgotSomething:forgotUsernamePanel.enterYourVin'),
      type: 'text',
      componentProps: {
        maxLength: 17,
      },
      rules: {
        required: { message: t('validation:required') },
        vin: {
          message: t('validation:vin'),
        },
      },
    },
  ];

  const id = testID('ForgotUserName');

  return (
    <MgaPage title={t(`forgotSomething:${route.params.titleKey}`)} focusedEdit>
      <MgaPageContent gap={1}>
        {!response.data && !response.data?.success && (
          <CsfView style={{ flex: 0.5 }}>
            <MgaForm
              initialValues={{ vin: '' }}
              trackingId={'forgotUsername'}
              isLoading={isLoading}
              scrollEnabled={false}
              fields={fieldsToRender}
              onSubmit={async (data: { vin: string }) => {
                await request({ vin: data.vin });
              }}
              onCancel={() => navigation.pop()}
            />
          </CsfView>
        )}

        <CsfView p={8} gap={8} style={{ flex: 1 }} testID={id()}>
          {!response.data && !response.data?.success && (
            <CsfText testID={id('enterVinDescription')}>
              {t('forgotSomething:forgotUsernamePanel.enterVinDescription')}
            </CsfText>
          )}
          {!response.data && !response.data?.success && (
            <CsfText testID={id('vinDescription')}>
              {t('forgotSomething:forgotUsernamePanel.vinDescription')}
            </CsfText>
          )}
          {response.data &&
            (response.data.success ? (
              <CsfCard
                testID={id('pageDescriptionCard')}
                title={t(
                  'forgotSomething:forgotUsernameSuccessPanel.pageDescription',
                )}
                gap={16}>
                <CsfBulletedList>
                  {response.data.data.map((d, i) => (
                    <CsfText key={i} testID={id(`list-${i}`)}>
                      {d}
                    </CsfText>
                  ))}
                </CsfBulletedList>
                <CsfText testID={id('pageDescription2')}>
                  {' '}
                  {t(
                    'forgotSomething:forgotUsernameSuccessPanel.pageDescription2',
                  )}
                </CsfText>
              </CsfCard>
            ) : (
              <CsfCard>
                <CsfText testID={id('pageDescription')}>
                  {t('forgotSomething:forgotUsernameFailPanel.pageDescription')}
                </CsfText>
              </CsfCard>
            ))}
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotUsername;
