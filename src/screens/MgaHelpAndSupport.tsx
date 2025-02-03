import React from 'react';
import { useTranslation } from 'react-i18next';
import { has } from '../features/menu/rules';
import { useAppNavigation } from '../Controller';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

/** Help & Support (Gen 0/1) */
const MgaHelpAndSupport: React.FC = () => {
  const navigation = useAppNavigation();
  const vehicle = useCurrentVehicle();
  const { t } = useTranslation();
  return (
    <MgaPage title={t('helpAndSupport:support')} showVehicleInfoBar>
      <MgaPageContent title={t('helpAndSupport:support')}>
        <MgaButton
          trackingId="HelpAndSupportMyRetailerButton"
          icon="MyRetailer"
          onPress={() =>
            navigation.push(
              has('reg:HI', vehicle) ? 'RetailerHawaii' : 'Retailer',
            )
          }
          title={t('branding:myRetailer')}
          variant="secondary"
        />
        <MgaButton
          trackingId="HelpAndSupportRoadsideButton"
          icon="RoadsideAssistance"
          onPress={() => navigation.push('RoadsideAssistance')}
          title={t('roadsideAssistance:24HourRoadsideAssistance')}
          variant="secondary"
        />
        {has('sub:SAFETY', vehicle) && (
          <MgaButton
            trackingId="HelpAndSupportCustomerServiceButton"
            icon="CustomerService"
            onPress={() => navigation.push('StarlinkCustomerCare')}
            title={t('index:customerSupport')}
            variant="secondary"
          />
        )}
        <MgaButton
          trackingId="HelpAndSupportCustomerSupportButton"
          icon="CustomerSupport"
          onPress={() => navigation.push('SubaruCustomerCare')}
          title={t('subaruCustomerCare:subaruCustomerSupport')}
          variant="secondary"
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaHelpAndSupport;
