import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  defaultLiveTrafficMonthlyCost,
  useGetTrafficConnectAccountTypeTrialStatusMonthlyCostQuery,
} from '../../api/manageEnrollment.api'
import {
  useAttWifiStateQuery,
  useSxmRadioStateQuery,
} from '../../api/subscription.api'
import { useAppNavigation } from '../../Controller'
import {
  gen1Plus,
  gen2Plus,
  has,
  subSafetyPlus,
} from '../../features/menu/rules'
import { useCurrentVehicle } from '../../features/auth/sessionSlice'
import { formatFullDate } from '../../utils/dates'
import {
  initialEnrollmentApi,
  useCheckVINValidityQuery,
} from '../../api/initialEnrollment.api'
import { store } from '../../store'
import { testID } from '../../components/utils/testID'
import { isVehicleAccountTypeAllowedForTrafficConnect } from '../../utils/vehicle'
import { formatCurrencyForBilling } from '../../utils/subscriptions'
import MgaPage from '../../components/MgaPage'
import CsfView from '../../components/CsfView'
import CsfText from '../../components/CsfText'
import CsfActivityIndicator from '../../components/CsfActivityIndicator'
import CsfTile from '../../components/CsfTile'
import MgaButton from '../../components/MgaButton'
import CsfSimpleAlert from '../../components/CsfSimpleAlert'
import CsfCard from '../../components/CsfCard'
import mgaOpenURL from '../../components/utils/linking'

/**
 * subscription/sxmRadioState.json sends this as destinationUrl.
 *
 * However, Cordova app hardcodes this value which is not replaced
 * when backend returns null
 **/
const sxmRadioUrlFallback =
  'https://care.siriusxm.com/login_view.action?utm_campaign=OEM_New_BAU&utm_source=NA_NA_MySubaru-web&utm_medium=Affiliate'

const MgaSubscriptionServiceLanding: React.FC = () => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  const vParams = {
    vin: vehicle?.vin ?? '',
  }
  const navigation = useAppNavigation()
  const attWifiState = useAttWifiStateQuery(vParams).data?.data
  const sxmRadioState = useSxmRadioStateQuery(vParams).data?.data
  const trafficState =
    useGetTrafficConnectAccountTypeTrialStatusMonthlyCostQuery({
      vin: vehicle?.vin ?? '',
    }).data?.data
  const vinValidity = useCheckVINValidityQuery(vParams).data?.data
  const [preEnrollLoading, setPreEnrollLoading] = useState(false)
  const vehicleAccountType = trafficState?.vehicleAccountType ?? ''
  const showStarlink = has(
    [
      'usr:primary',
      { or: [gen2Plus, [gen1Plus, subSafetyPlus]] },
      { not: 'car:RightToRepair' },
    ],
    vehicle,
  )
  const showTrafficConnect =
    has(['cap:TRAFFIC', { not: 'car:RightToRepair' }], vehicle) &&
    isVehicleAccountTypeAllowedForTrafficConnect(vehicleAccountType)
  const hasTrafficSubscription =
    showTrafficConnect && has('sub:TRAFFIC_CONNECT', vehicle)
  const showATT = has(['usr:primary', gen2Plus], vehicle)
  const showSXM = sxmRadioState?.message
  const sxmDestinationUrl = sxmRadioState?.destinationUrl ?? sxmRadioUrlFallback
  const showNav = has({ or: ['cap:NAV_HERE', 'cap:NAV_TOMTOM'] }, vehicle)
  const showBilling =
    has({ or: [gen2Plus, subSafetyPlus] }, vehicle) &&
    has({ not: 'sub:NONE' }, vehicle)
  const showNoSubscription =
    !showStarlink &&
    !showTrafficConnect &&
    !showATT &&
    !showSXM &&
    !showNav &&
    !showBilling
  const isFetching = !attWifiState || !sxmRadioState || !trafficState
  const id = testID('SubscriptionServicesLanding')
  return (
    <MgaPage showVehicleInfoBar title={t('subscriptionServices:title')}>
      <CsfView flex={1} gap={16} p={16}>
        <CsfText align="center" variant="title3" testID={id('title')}>
          {t('subscriptionServices:title')}
        </CsfText>
        {isFetching ? (
          <CsfActivityIndicator />
        ) : (
          <CsfView gap={16}>
            {showNoSubscription && (
              <CsfText align="center" testID={id('noServicesOrSubscription')}>
                {t('subscriptionServices:noServicesOrSubscription')}
              </CsfText>
            )}
            {(showStarlink || showTrafficConnect || showBilling) && (
              <CsfTile>
                {showStarlink && (
                  <CsfView>
                    <CsfText
                      variant="subheading"
                      testID={id('starlinkSubscriptions')}>
                      {t('subscriptionServices:starlinkSubscriptions')}
                    </CsfText>
                    {has([gen2Plus, 'sub:NONE'], vehicle) &&
                      vinValidity &&
                      (vinValidity.success && vinValidity.statusCode == 0 ? (
                        <CsfView gap={8}>
                          <CsfText testID={id('currentlyNoSubscription')}>
                            {t(
                              has('cap:PHEV', vehicle)
                                ? 'subscriptionServices:currentlyNoSubscriptionPhev'
                                : 'subscriptionServices:currentlyNoSubscription',
                            )}
                          </CsfText>
                          <MgaButton
                            trackingId="SubscriptionEnrollmentButton"
                            isLoading={preEnrollLoading}
                            title={t('subscriptionServices:subscribeNow')}
                            onPress={async () => {
                              if (preEnrollLoading) return
                              setPreEnrollLoading(true)
                              const preEnrollRequest =
                                initialEnrollmentApi.endpoints.preEnrollValidity.initiate(
                                  {},
                                )
                              const preEnrollResponse = await store
                                .dispatch(preEnrollRequest)
                                .unwrap()
                              setPreEnrollLoading(false)
                              if (
                                preEnrollResponse.success &&
                                preEnrollResponse.data?.ableToContinue
                              ) {
                                navigation.push('SubscriptionEnrollment')
                              } else {
                                const errorCode =
                                  preEnrollResponse.errorCode ??
                                  preEnrollResponse.data?.reasonCode
                                const message =
                                  errorCode == 'rightToRepair'
                                    ? t(
                                      'subscriptionEnrollment:notAbleToEnrollRightToRepair',
                                    )
                                    : t(
                                      'subscriptionEnrollment:notAbleToEnroll',
                                    )
                                CsfSimpleAlert('', message)
                              }
                            }}
                          />
                        </CsfView>
                      ) : (
                        <CsfView>
                          <CsfText testID={id('subscriptionCannotBeCompleted')}>
                            {t(
                              'subscriptionServices:subscriptionCannotBeCompleted',
                            )}
                          </CsfText>
                        </CsfView>
                      ))}
                    {has('cap:g1', vehicle) &&
                      (has('res:*', vehicle) ? (
                        <CsfView gap={8}>
                          <CsfText testID={id('starlinkSafetyAndSecurity')}>
                            {t('common:starlinkSafetyAndSecurity')}
                          </CsfText>
                          <CsfText testID={id('expiryDate')}>
                            {t('subscriptionEnrollment:exp', {
                              when: formatFullDate(
                                vehicle?.subscriptionPlans[0].expireDate,
                              ),
                            })}
                          </CsfText>
                        </CsfView>
                      ) : (
                        <CsfView gap={8}>
                          <CsfText testID={id('starlinkSafetyPlus')}>
                            {t('common:starlinkSafetyPlus')}
                          </CsfText>
                          <CsfText testID={id('expireDate')}>
                            {t('subscriptionEnrollment:exp', {
                              when: formatFullDate(
                                vehicle?.subscriptionPlans[0]?.expireDate,
                              ),
                            })}
                          </CsfText>
                        </CsfView>
                      ))}
                    {has([gen2Plus, subSafetyPlus], vehicle) && (
                      <CsfView gap={8}>
                        <CsfText testID={id('currentlySubscribed')}>
                          {t('subscriptionServices:currentlySubscribed')}
                        </CsfText>
                        <MgaButton
                          trackingId="SubscriptionManageButton"
                          title={t(
                            'subscriptionServices:manageYourSubscription',
                          )}
                          onPress={() => navigation.push('SubscriptionManage')}
                        />
                      </CsfView>
                    )}
                  </CsfView>
                )}
                {showTrafficConnect && (
                  <CsfView gap={8}>
                    <CsfText variant="subheading" testID={id('trafficConnect')}>
                      {t('subscriptionServices:trafficConnect')}
                    </CsfText>
                    {hasTrafficSubscription ? (
                      <CsfText
                        testID={id('trafficConnectDescriptionSubscribed')}>
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
                          testID={id(
                            'trafficConnectDescriptionMonthlyNotSubscribed',
                          )}>
                          {t(
                            trafficState?.isTrialEligible
                              ? 'subscriptionServices:trafficConnectDescriptionFreeTrial'
                              : 'subscriptionServices:trafficConnectDescriptionMonthlyNotSubscribed',
                            {
                              model: vehicle?.modelName,
                              fee: formatCurrencyForBilling(
                                trafficState?.monthlyCost ??
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
                        hasTrafficSubscription
                          ? 'subscriptionServices:trafficConnectSubscribed'
                          : 'subscriptionServices:trafficConnectSubscribe',
                      )}
                      onPress={() =>
                        navigation.push(
                          hasTrafficSubscription
                            ? 'LiveTrafficManage'
                            : 'LiveTrafficSubscription',
                        )
                      }
                    />
                  </CsfView>
                )}
                {showBilling && (
                  <CsfView gap={8}>
                    <CsfText
                      variant="subheading"
                      testID={id('billingInformation')}>
                      {t('subscriptionServices:billingInformation')}
                    </CsfText>
                    <CsfText testID={id('keepBillingInformationUpToDate')}>
                      {t('subscriptionServices:keepBillingInformationUpToDate')}
                    </CsfText>
                    <MgaButton
                      trackingId="BillingInformationButton"
                      variant="secondary"
                      title={t('subscriptionServices:updateBillingInformation')}
                      onPress={() => navigation.push('BillingInformationView')}
                    />
                  </CsfView>
                )}
              </CsfTile>
            )}
            {showATT && (
              <CsfCard
                title={t('subscriptionServices:wifiSubscription')}>
                <CsfView gap={8}>
                  <CsfText testID={id('attWifiState')}>
                    {t(
                      attWifiState?.WiFiState
                        ? `subscriptionServices:attWifiState.${attWifiState.WiFiState}`
                        : 'subscriptionServices:attWifiState.attWifiStateError',
                    )}
                  </CsfText>
                  {attWifiState.forwardAddress && (
                    <MgaButton
                      trackingId="ATTWifiSubscriptionButton"
                      variant="secondary"
                      title={t('subscriptionServices:signUpSubscription')}
                      onPress={() => mgaOpenURL(attWifiState.forwardAddress)}
                    />
                  )}
                </CsfView>
              </CsfCard>
            )}
            {showSXM && (
              <CsfCard title={t('subscriptionServices:sxmSubscription')}>
                <CsfView gap={8}>
                  <CsfText testID={id('sxmRadioState')}>
                    {sxmRadioState.message}
                  </CsfText>
                  {sxmRadioState.subscriptions?.map((sub, index) => {
                    const itemTestId = testID(id(`sub-${index}`))
                    return (
                      <CsfView
                        key={sub.subscriptionPackage}
                        flexDirection="row"
                        justify="space-between">
                        <CsfText testID={itemTestId('subscriptionStatus')}>
                          {sub.subscriptionStatus}
                        </CsfText>
                        <CsfText testID={itemTestId('date')}>
                          {sub.dateLabel}
                          {': '}
                          {sub.dateValue}
                        </CsfText>
                      </CsfView>
                    )
                  })}
                  <MgaButton
                    variant="secondary"
                    trackingId="SXMSubscriptionButton"
                    title={t(
                      'subscriptionServices:sxmRadioDefaultDestinationLabel',
                    )}
                    onPress={() => mgaOpenURL(sxmDestinationUrl)}
                  />
                </CsfView>
              </CsfCard>
            )}
            {showNav && (
              <CsfCard title={t('subscriptionServices:mapUpdates')}>
                <CsfView gap={8}>
                  <CsfText testID={id('ensureMapsUpToDate')}>
                    {t('subscriptionServices:ensureMapsUpToDate')}
                  </CsfText>
                  <MgaButton
                    variant="secondary"
                    trackingId="MapUpdatesButton"
                    title={t('subscriptionServices:purchaseMapUpdates')}
                    onPress={async () => {
                      if (!vehicle?.features) {
                        return
                      }
                      if (vehicle.features.includes('NAV_TOMTOM')) {
                        await mgaOpenURL(
                          t('subscriptionServices:mapUpdateExtUrl.NAV_TOMTOM'),
                        )
                      } else if (vehicle.features.includes('NAV_HERE')) {
                        await mgaOpenURL(
                          t('subscriptionServices:mapUpdateExtUrl.NAV_HERE'),
                        )
                      }
                    }}
                  />
                </CsfView>
              </CsfCard>
            )}
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  )
}


export default MgaSubscriptionServiceLanding;