import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  defaultLiveTrafficMonthlyCost,
  manageEnrollmentApi,
  TrafficConnectAccountTypeTrialStatusMonthlyCostResponse,
} from '../../api/manageEnrollment.api';
import { useAppNavigation } from '../../Controller';
import { has } from '../../features/menu/rules';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { store } from '../../store';
import { trackError } from '../../components/useTracking';
import { cNoVehicle } from '../../api/account.api';
import { canadaInitialEnrollmentApi } from '../../api/caInitialEnrollment.api';
import { hasActiveStarlinkSubscription } from '../../utils/vehicle';
import { formatCurrencyForBilling } from '../../utils/subscriptions';
import { testID } from '../../components/utils/testID';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import CsfText from '../../components/CsfText';
import CsfTile from '../../components/CsfTile';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';

const subscriptionCannotBeCompleted = 'subscriptionCannotBeCompleted';

type SciSubscriptionServiceLandingState =
  | { state: 'loading' }
  | { state: 'error'; error: string | null }
  | {
    state: 'ready'
    starlink: boolean
    traffic:
    | null
    | { active: true }
    | {
      active: false
      cost: TrafficConnectAccountTypeTrialStatusMonthlyCostResponse
    }
  }

const SciSubscriptionServiceLanding: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const [preEnrollLoading, setPreEnrollLoading] = useState(false);

  const id = testID('SciSubscriptionServicesLanding');

  const onLoad = async (): Promise<SciSubscriptionServiceLandingState> => {
    if (!vehicle) { return { state: 'error', error: cNoVehicle }; }
    const vParams = { vin: vehicle.vin };
    const starlink = hasActiveStarlinkSubscription(vehicle);
    if (!starlink) {
      const request =
        canadaInitialEnrollmentApi.endpoints.canadaCheckVINValidity.initiate(
          vParams,
        );
      const response = await store.dispatch(request).unwrap();
      if (!response.success && !response.data?.success) {
        const statusCode = response.data?.statusCode ?? 0;
        if (statusCode > 200 && statusCode < 205) {
          return { state: 'error', error: subscriptionCannotBeCompleted };
        } else {
          return { state: 'error', error: response.errorCode };
        }
      }
    }
    if (has('cap:TRAFFIC', vehicle)) {
      const request =
        manageEnrollmentApi.endpoints.getTrafficConnectAccountTypeTrialStatusMonthlyCost.initiate(
          vParams,
        );
      const response = await store.dispatch(request).unwrap();
      if (!response.success || !response.data) {
        return { state: 'error', error: response.errorCode };
      }
      if (has('sub:TRAFFIC_CONNECT', vehicle)) {
        return { state: 'ready', starlink, traffic: { active: true } };
      } else {
        return {
          state: 'ready',
          starlink,
          traffic: { active: false, cost: response.data },
        };
      }
    } else {
      return { state: 'ready', starlink, traffic: null };
    }
  };
  useEffect(() => {
    onLoad()
      .then(setState)
      .catch(trackError('SciSubscriptionServiceLanding::onLoad'));
  }, []);
  const [state, setState] = useState<SciSubscriptionServiceLandingState>({
    state: 'loading',
  });
  const pageContent = () => {
    switch (state.state) {
      case 'loading':
        return <CsfActivityIndicator />;
      case 'error':
        return (
          <CsfView gap={16}>
            <CsfText
              align="center"
              testID={id('subscriptionCannotBeCompleted')}>
              {t(
                state.error == subscriptionCannotBeCompleted
                  ? 'subscriptionServices:subscriptionCannotBeCompleted'
                  : 'subscriptionServices:unexpectedError',
              )}
            </CsfText>
          </CsfView>
        );
      case 'ready':
        return (
          <CsfView gap={16}>
            <CsfTile>
              <CsfView>
                <CsfText variant="subheading" testID={id('subscriptions')}>
                  {t('subscriptionServices:starlinkSubscriptions')}
                </CsfText>
                <CsfView gap={8}>
                  {state.starlink ? (
                    <CsfText testID={id('currentlySubscribed')}>
                      {t('subscriptionServices:currentlySubscribed')}
                    </CsfText>
                  ) : (
                    <CsfText testID={id('currentlyNoSubscription')}>
                      {t(
                        has('cap:PHEV', vehicle)
                          ? 'subscriptionServices:currentlyNoSubscriptionPhev'
                          : 'subscriptionServices:currentlyNoSubscription',
                      )}
                    </CsfText>
                  )}
                  {state.starlink ? (
                    <MgaButton
                      trackingId="SciSubscriptionManageButton"
                      title={t('subscriptionServices:manageYourSubscription')}
                      onPress={() => {
                        navigation.push('SciSubscriptionManage');
                      }}
                    />
                  ) : (
                    <MgaButton
                      trackingId="SciSubscriptionEnrollmentButton"
                      isLoading={preEnrollLoading}
                      title={t('subscriptionServices:subscribeNow')}
                      onPress={async () => {
                        if (preEnrollLoading) { return; }
                        setPreEnrollLoading(true);
                        const preEnrollRequest =
                          canadaInitialEnrollmentApi.endpoints.canadaPreEnrollValidity.initiate(
                            {},
                          );
                        const preEnrollResponse = await store
                          .dispatch(preEnrollRequest)
                          .unwrap();
                        setPreEnrollLoading(false);
                        if (
                          preEnrollResponse.success &&
                          preEnrollResponse.data?.ableToContinue
                        ) {
                          navigation.push('SciSubscriptionEnrollment');
                        } else {
                          CsfSimpleAlert(
                            '',
                            t('subscriptionEnrollment:notAbleToEnroll'),
                          );
                        }
                      }}
                    />
                  )}
                </CsfView>
              </CsfView>
            </CsfTile>
            {state.traffic && (
              <CsfTile>
                <CsfView gap={8}>
                  <CsfText variant="subheading" testID={id('trafficConnect')}>
                    {t('subscriptionServices:trafficConnect')}
                  </CsfText>
                  {state.traffic.active ? (
                    <CsfText testID={id('trafficConnectDescriptionSubscribed')}>
                      {t(
                        'subscriptionServices:trafficConnectDescriptionSubscribed',
                      )}
                    </CsfText>
                  ) : (
                    <>
                      <CsfText
                        testID={id('trafficConnectDescriptionNotSubscribed')}>
                        {t(
                          'subscriptionServices:trafficConnectDescriptionNotSubscribed',
                        )}
                      </CsfText>
                      <CsfText
                        testID={id('trafficConnectDescriptionFreeTrial')}>
                        {t(
                          state.traffic.cost?.isTrialEligible
                            ? 'subscriptionServices:trafficConnectDescriptionFreeTrial'
                            : 'subscriptionServices:trafficConnectDescriptionMonthlyNotSubscribed',
                          {
                            model: vehicle?.modelName,
                            fee: formatCurrencyForBilling(
                              state.traffic.cost?.monthlyCost ??
                              defaultLiveTrafficMonthlyCost,
                            ),
                          },
                        )}
                      </CsfText>
                    </>
                  )}
                  <MgaButton
                    trackingId="TrafficConnectSubscriptionButton"
                    variant="secondary"
                    title={t(
                      state.traffic.active
                        ? 'subscriptionServices:trafficConnectSubscribed'
                        : 'subscriptionServices:trafficConnectSubscribe',
                    )}
                    onPress={() =>
                      navigation.push(
                        state.traffic?.active
                          ? 'LiveTrafficManage'
                          : 'LiveTrafficSubscription',
                      )
                    }
                  />
                </CsfView>
              </CsfTile>
            )}
          </CsfView>
        );
    }
  };
  return (
    <MgaPage showVehicleInfoBar title={t('subscriptionServices:title')}>
      <CsfView flex={1} gap={16} p={16}>
        <CsfText align="center" variant="title3" testID={id('title')}>
          {t('subscriptionServices:title')}
        </CsfText>
        {pageContent()}
      </CsfView>
    </MgaPage>
  );
};

export default SciSubscriptionServiceLanding;