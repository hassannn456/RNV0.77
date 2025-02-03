/* eslint-disable curly */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  deleteVehicleAccountAttribute,
  getVehicleUserAttributeKeyById,
  useGetVehicleAccountAttributesQuery,
  VehicleUserAttributeKey,
} from '../../api/userAttributes.api';
import { getCurrentVehicle } from '../../features/auth/sessionSlice';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfListItem from '../../components/CsfListItem';
import CsfButton from '../../components/CsfButton';
import { errorNotice, successNotice } from '../../components/notice';

const DevVehicleAccountAttributes: React.FC = () => {
  const { t } = useTranslation();
  const vehicle = getCurrentVehicle();
  const { isFetching, data } = useGetVehicleAccountAttributesQuery({
    vehicleId: vehicle?.vehicleKey ?? 0,
  });
  const attributes = data?.data ?? [];
  return (
    <MgaPage title={t('internalDevelopment:vehicleAccountAttributes')}>
      <MgaPageContent
        isLoading={isFetching}
        title={t('internalDevelopment:vehicleAccountAttributes')}>
        <CsfRuleList>
          {attributes.map((attribute, index) => {
            const attributeId = getVehicleUserAttributeKeyById(
              attribute.masterAttributeId,
            ) as VehicleUserAttributeKey;
            return (
              <CsfListItem
                key={index}
                title={attributeId}
                subtitle={attribute.attributeValue}
                titleTextVariant="body2"
                action={
                  <CsfButton
                    variant="link"
                    size="sm"
                    icon="Delete"
                    onPress={async () => {
                      const response =
                        await deleteVehicleAccountAttribute(attributeId);
                      if (response.success)
                        successNotice({
                          title: `Successfully deleted ${attributeId}`,
                        });
                      else {
                        errorNotice({
                          title: `Failed to delete ${attributeId}`,
                        });
                        console.log(response);
                      }
                    }}
                  />
                }
                ph={0}
              />
            );
          })}
        </CsfRuleList>
      </MgaPageContent>
    </MgaPage>
  );
};

export default DevVehicleAccountAttributes;
