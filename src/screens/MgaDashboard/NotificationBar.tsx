/* eslint-disable eqeqeq */
/* eslint-disable eol-last */
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useVehicleValetStatusQuery } from '../../api/vehicle.api';
import { useAppNavigation } from '../../Controller';
import { useCurrentVehicle } from '../../features/auth/sessionSlice';
import { canAccessScreen } from '../../utils/menu';
import CsfView from '../../components/CsfView';
import CsfPressable from '../../components/CsfPressable';
import { CsfAlertBar } from '../../components/CsfAlertBar';
import CsfText from '../../components/CsfText';
import CsfAppIcon from '../../components/CsfAppIcon';

const MgaDashboardFooterNotificationBar: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const vehicle = useCurrentVehicle();
  const vParams = {
    vin: vehicle?.vin ?? '',
  };

  // MGA-1839 - remove maintenance schedule query + alert bar from homepage

  const valetStatus =
    useVehicleValetStatusQuery(vParams).data?.data ?? 'NO_RECORDS';
  const valetActive = valetStatus == 'VAL_ON';
  const valetPending =
    valetStatus == 'VAL_ON_PENDING' || valetStatus == 'VAL_OFF_PENDING';
  return canAccessScreen('ValetMode') && (valetActive || valetPending)
    ? vehicle?.provisioned && (
      <CsfView>
        <CsfPressable onPress={() => navigation.navigate('ValetMode')}>
          <CsfAlertBar
            type="success"
            flat
            title={
              valetPending
                ? t('valetMode:valetStatusBannerPending')
                : t('valetMode:valetStatusBannerActive')
            }
            action={<CsfText color={'button'}>{t('common:view')}</CsfText>}
            icon={<CsfAppIcon icon="ValetMode" color="success" />}
          />
        </CsfPressable>
      </CsfView>
    )
    : null;
};

export default MgaDashboardFooterNotificationBar;