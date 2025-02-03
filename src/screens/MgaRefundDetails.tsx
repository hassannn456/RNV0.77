/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppRoute } from '../Controller';
import { useRefundReceiptQuery } from '../api/manageEnrollment.api';
import { formatCurrencyForBilling } from '../utils/subscriptions';
import { testID } from '../components/utils/testID';
import CsfRule from '../components/CsfRule';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

const MgaRefundDetails: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'RefundDetails'>();
  const { data, isLoading } = useRefundReceiptQuery(route.params);

  const id = testID('RefundDetails');
  return (
    <MgaPage showVehicleInfoBar title={t('invoices:refundDetails')}>
      <CsfView isLoading={isLoading} testID={id()}>
        {data?.data && (
          <CsfView p={8} style={{ rowGap: 8 }}>
            <CsfView flexDirection="row" justify="center">
              <CsfText bold testID={id('refundNumber')}>
                {t('invoices:refundNumber')}
              </CsfText>
              <CsfText> - </CsfText>
              <CsfText testID={id('refundTransactionId')}>
                {data.data.refundTransactionId}
              </CsfText>
            </CsfView>
            <CsfView>
              {data.data.invoiceReversals.map((ir, index) => {
                const label: string = t('invoices:originalInvoiceNumber');
                return (
                  <CsfView
                    key={ir.clientServiceId}
                    testID={id(`invoiceReversal-${index}`)}>
                    <CsfView flexDirection="row" justify="space-between">
                      <CsfText bold testID={id(`clientServiceId-${index}`)}>
                        {t(`invoices:${ir.clientServiceId}`)}
                      </CsfText>
                      <CsfText bold testID={id(`amount-${index}`)}>
                        {t('invoices:amount')}
                      </CsfText>
                    </CsfView>
                    <CsfView flexDirection="row" justify="space-between">
                      <CsfText
                        testID={id(
                          `invoiceNo-${index}`,
                        )}>{`${label}: ${ir.invoiceNo}`}</CsfText>
                      <CsfText testID={id(`invoiceAmount-${index}`)}>
                        {formatCurrencyForBilling(ir.invoiceAmount)}
                      </CsfText>
                    </CsfView>
                  </CsfView>
                );
              })}
              <CsfView key={'tax'}>
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText bold testID={id('tax')}>
                    {t('invoices:tax')}
                  </CsfText>
                  <CsfText bold testID={id('amount')}>
                    {t('invoices:amount')}
                  </CsfText>
                </CsfView>
                <CsfView flexDirection="row" justify="space-between">
                  <CsfText />
                  <CsfText testID={id('taxAmount')}>
                    {formatCurrencyForBilling(data.data.taxAmount)}
                  </CsfText>
                </CsfView>
              </CsfView>
            </CsfView>
            <CsfRule orientation="horizontal" />
            <CsfView>
              <CsfView flexDirection="row" justify="space-between">
                <CsfText bold testID={id('amountRefunded')}>
                  {t('invoices:amountRefunded')}
                </CsfText>
                <CsfText testID={id('refundAmount')}>
                  {formatCurrencyForBilling(data.data.refundAmount)}
                </CsfText>
              </CsfView>
              <CsfView flexDirection="row" justify="space-between">
                <CsfText bold testID={id('paymentMethod')}>
                  {t('invoices:paymentMethod')}
                </CsfText>
                <CsfText
                  testID={id(
                    'ccSuffix',
                  )}>{`(${data.data.ccType}) ************${data.data.ccSuffix}`}</CsfText>
              </CsfView>
            </CsfView>
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  );
};

export default MgaRefundDetails;
