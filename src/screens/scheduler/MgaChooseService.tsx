/* eslint-disable eol-last */
// cSpell:ignore schedulable
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDealerServicesQuery,
  useRecallsByVINQuery,
  useWarningLightsQuery,
} from '../../api/schedule.api';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { ScheduleForm, Service } from '../../../@types';
import { useAppNavigation, useAppRoute } from '../../Controller';
import { formatPhone } from '../../utils/phone';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import CsfCard from '../../components/CsfCard';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import MgaButton from '../../components/MgaButton';
import { CsfSegmentedButton } from '../../components/CsfSegmentedButton';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfButton from '../../components/CsfButton';
import mgaOpenURL from '../../components/utils/linking';

/** Do not request schedule data in chucks longer than this */
export const scheduleWindowLength = 13;

const MgaChooseService: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const route = useAppRoute<'ChooseService'>();
  const navigation = useAppNavigation();
  const vehicleParams = {
    vin: vehicle?.vin,
    dealerCode: vehicle?.preferredDealer?.dealerCode,
  };
  const { isLoading: isDealerServicesLoading, data: dealerServicesResponse } =
    useDealerServicesQuery(vehicleParams);
  const { isLoading: isWarningLightsLoading, data: warningLightsResponse } =
    useWarningLightsQuery(vehicleParams);
  const { isLoading: isRecallsByVINLoading, data: recallsByVINResponse } =
    useRecallsByVINQuery(vehicleParams);
  const isLoading =
    isDealerServicesLoading || isWarningLightsLoading || isRecallsByVINLoading;
  const [viewMore, setViewMore] = useState(false);
  const [form, setForm] = useState<ScheduleForm>({
    vin: vehicle?.vin,
    dealerCode: vehicle?.preferredDealer?.dealerCode,
    transportType: 1,
    parentPage: route.params?.parentPage,
  });
  const recallOpCodes =
    recallsByVINResponse?.data?.recallOpCodes?.map(roc => roc.opCode) ?? [];
  const [recommended, other, otherMore, declined] = (() => {
    const services = dealerServicesResponse?.data?.services ?? [];
    const _recommended: Service[] = [];
    const _generic: Service[] = [];
    const _other: Service[] = [];
    const _declined: Service[] = [];
    services.forEach(item => {
      if (item.opCode && !recallOpCodes.includes(item.opCode)) {
        if (item.isRecommendedService) {
          _recommended.push(item);
        } else if (item.isGeneralRepair) {
          _generic.push(item);
        } else if (item.isDeclinedService) {
          _declined.push(item);
        } else {
          _other.push(item);
        }
      }
    });
    return [
      _recommended,
      _other.slice(0, 5).concat(_generic),
      _other.slice(5),
      _declined,
    ];
  })();
  const [warningLightServices, setWarningLightServices] = useState<Service[]>(
    [],
  );
  const [schedulableRecalls, setSchedulableRecalls] = useState<Service[]>([]);
  const [nonSchedulableRecalls, setNonSchedulableRecalls] = useState<Service[]>(
    [],
  );
  const includesOpCode = (item: Service) => {
    const requestJson = (form.requestJson ?? []) as Service[];
    const indexOf = requestJson.indexOf(item);
    return indexOf != -1;
  };
  const toggleOpCode = (item: Service) => {
    const requestJson = (form.requestJson ?? []) as Service[];
    const indexOf = requestJson.indexOf(item);
    if (indexOf == -1) {
      requestJson.push(item);
    } else {
      requestJson.splice(indexOf, 1);
    }
    setForm({ ...form, requestJson });
  };
  useEffect(() => {
    // Extract service info from payload
    const services: Service[] = (() => {
      if (!warningLightsResponse?.data?.dealersWarningLights) return [];
      if (warningLightsResponse.data.dealersWarningLights.length == 0) return [];
      if (!warningLightsResponse.data.dealersWarningLights[0].warningLights)
        return [];
      return warningLightsResponse.data.dealersWarningLights[0].warningLights.map(
        wl => ({
          opCode: wl.opCode,
          serviceName: t(`vehicleDiagnostics:${wl.b2cCode}.header`),
        }),
      );
    })();
    setWarningLightServices(services);
    const schedulableRecalls: Service[] = (() => {
      if (!recallsByVINResponse?.success) return [];
      if (!recallsByVINResponse?.data?.success) return [];
      let result: Service[] = [];
      const input = recallsByVINResponse.data.recallOpCodes ?? [];
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        const schedulableRecalls: Service[] =
          item.schedulableRecalls?.map(r => ({
            opCode: item.opCode,
            serviceName: r.recallDescription,
          })) ?? [];
        result = result.concat(schedulableRecalls);
      }
      return result;
    })();
    setSchedulableRecalls(schedulableRecalls);
    const nonSchedulableRecalls: Service[] = (() => {
      if (!recallsByVINResponse?.success) return [];
      if (!recallsByVINResponse?.data?.success) return [];
      let result: Service[] = [];
      const input = recallsByVINResponse.data.recallOpCodes ?? [];
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        const nonSchedulableRecalls: Service[] =
          item.nonSchedulableRecalls?.map(r => ({
            opCode: r.recallCode,
            serviceName: r.recallDescription,
          })) ?? [];
        result = result.concat(nonSchedulableRecalls);
      }
      return result;
    })();
    setNonSchedulableRecalls(nonSchedulableRecalls);
    // Pre-select health (warning light / recall)
    const requestJson = (form.requestJson ?? []) as Service[];
    const groups = [
      declined,
      services,
      schedulableRecalls,
      nonSchedulableRecalls,
    ];
    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (group.length > 0) {
          for (let j = 0; j < group.length; j++) {
            const item = group[j];
            if (!includesOpCode(item)) {
              requestJson.push(item);
            }
          }
        }
      }
      setForm({ ...form, requestJson });
    }
  }, [warningLightsResponse, recallsByVINResponse]);
  return (
    <MgaPage title={t('common:service')} showVehicleInfoBar>
      <MgaPageContent
        title={t('chooseService:selectService')}
        isLoading={isLoading}>
        {(dealerServicesResponse?.data?.services ?? []).length > 0 ? (
          <>
            {warningLightServices.length > 0 && (
              <CsfCard title={t('chooseService:warningLights')}>
                {warningLightServices.map((s, i) => (
                  <CsfCheckBox
                    key={`WarningLightService_${i}`}
                    label={s.serviceName}
                    checked={includesOpCode(s)}
                    onChangeValue={_ => toggleOpCode(s)}
                  />
                ))}
              </CsfCard>
            )}

            {(schedulableRecalls.length > 0 ||
              nonSchedulableRecalls.length > 0) && (
                <CsfCard title={t('chooseService:OpenRecallsServiceCampaigns')}>
                  {schedulableRecalls.map((s, i) => (
                    <CsfCheckBox
                      key={`ScheduledRecallService_${i}`}
                      label={s.serviceName}
                      checked={includesOpCode(s)}
                      onChangeValue={_ => toggleOpCode(s)}
                    />
                  ))}

                  {nonSchedulableRecalls.map((s, i) => (
                    <CsfCheckBox
                      key={`NonScheduledRecallService_${i}`}
                      label={s.serviceName}
                      checked={includesOpCode(s)}
                      onChangeValue={_ => toggleOpCode(s)}
                    />
                  ))}
                </CsfCard>
              )}
            {declined.length > 0 && (
              <CsfCard title={t('chooseService:previouslyDeclinedServices')}>
                {declined.map((s, i) => (
                  <CsfCheckBox
                    key={`DeclinedService_${i}`}
                    label={s.serviceName}
                    checked={includesOpCode(s)}
                    onChangeValue={_ => toggleOpCode(s)}
                  />
                ))}
              </CsfCard>
            )}
            {recommended.length > 0 && (
              <CsfCard
                title={t('chooseService:recommendedMaintenanceServices')}>
                {recommended.map((s, i) => (
                  <CsfCheckBox
                    key={`RecommendedService_${i}`}
                    label={s.serviceName}
                    checked={includesOpCode(s)}
                    onChangeValue={_ => toggleOpCode(s)}
                  />
                ))}
              </CsfCard>
            )}
            {other.length > 0 && (
              <CsfCard title={t('chooseService:otherServices')}>
                {other.map((s, i) => (
                  <CsfCheckBox
                    key={`OtherServices_${i}`}
                    label={s.serviceName}
                    checked={includesOpCode(s)}
                    onChangeValue={_ => toggleOpCode(s)}
                  />
                ))}

                {viewMore &&
                  otherMore.map((s, i) => (
                    <CsfCheckBox
                      key={`OtherServicesMore_${i}`}
                      label={s.serviceName}
                      checked={includesOpCode(s)}
                      onChangeValue={_ => toggleOpCode(s)}
                    />
                  ))}

                {!viewMore && otherMore.length > 0 && (
                  <MgaButton
                    trackingId="ServiceViewMoreButton"
                    title={t('chooseService:viewMore')}
                    onPress={() => setViewMore(true)}
                    variant="link"
                  />
                )}
                {viewMore && (
                  <MgaButton
                    trackingId="ServiceViewLessButton"
                    title={t('chooseService:viewLess')}
                    onPress={() => setViewMore(false)}
                    variant="link"
                  />
                )}
              </CsfCard>
            )}

            <CsfCard>
              <CsfSegmentedButton
                label={t('scheduleSummary:wouldLikeTo')}
                value={form.transportType}
                options={[
                  { label: t('scheduleSummary:dropOffVehicle'), value: 1 },
                  { label: t('scheduleSummary:waitAtDealership'), value: 2 },
                ]}
                onChange={value =>
                  setForm({ ...form, transportType: value as number })
                }
              />
            </CsfCard>
            <MgaButton
              trackingId="ServiceScheduleDateButton"
              title={t('common:continue')}
              onPress={() => {
                const requestJson = (form.requestJson ?? []) as Service[];
                if (requestJson.length == 0) {
                  CsfSimpleAlert(
                    t('common:error'),
                    t('scheduler:pleaseSelectAtLeastOneService'),
                    { type: 'error' },
                  );
                } else {
                  const t0 = new Date();
                  const t1 = new Date();
                  t1.setDate(t1.getDate() + scheduleWindowLength);
                  const appointmentFinderStartDate = t0.toISOString();
                  const appointmentFinderEndDate = t1.toISOString();
                  navigation.push('ScheduleDate', {
                    ...form,
                    appointmentFinderStartDate,
                    appointmentFinderEndDate,
                    requestJson: JSON.stringify(requestJson),
                  });
                }
              }}
            />
          </>
        ) : (
          <CsfView standardSpacing>
            <CsfText align="center" variant="body">
              {t('scheduler:technicalIssues')}
            </CsfText>
            {vehicle?.preferredDealer?.phoneNumber && (
              // TODO:UA:20240607 - replace with MgaPhoneNumber
              <CsfButton
                title={formatPhone(vehicle.preferredDealer.phoneNumber)}
                onPress={() => {
                  if (vehicle?.preferredDealer?.phoneNumber) {
                    void mgaOpenURL(
                      `tel://${vehicle.preferredDealer.phoneNumber}`,
                    );
                  }
                }}
              />
            )}
          </CsfView>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaChooseService;