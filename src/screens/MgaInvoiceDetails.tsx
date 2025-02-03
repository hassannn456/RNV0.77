
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppRoute } from '../Controller';
import { useInvoiceDetailsQuery } from '../api/manageEnrollment.api';
import { formatCurrencyForBilling } from '../utils/subscriptions';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaInvoiceDetails: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'InvoiceDetails'>();
  const { data, isLoading } = useInvoiceDetailsQuery(route.params);
  const taxes =
    data?.data?.invoice_line_m
      .filter(line => line.service_name.includes('Taxes'))
      .reduce((a, b) => a + b.amount, 0) ?? 0;

  const id = testID('InvoiceDetails');
  return (
    <MgaPage focusedEdit title={t('invoices:invoiceDetails')}>
      <MgaPageContent title={t('invoices:chargeSummary')} isLoading={isLoading}>
        {data?.data?.invoice_line_m
          .filter(line => !line.service_name.includes('Taxes'))
          .map((line, index) => {
            const itemTestId = testID(id(`invoice-${index}`));
            return (
              <CsfCard
                title={line.service_name}
                key={line.line_item_no}
                testID={itemTestId()}>
                <CsfRuleList>
                  <CsfDetail
                    label={t('invoices:expiresRenews')}
                    value={line.end_date.substring(0, 10)}
                    testID={itemTestId('expiresRenews')}
                  />
                  <CsfDetail
                    label={t('invoices:amount')}
                    value={formatCurrencyForBilling(line.amount)}
                    testID={itemTestId('amount')}
                  />
                </CsfRuleList>
              </CsfCard>
            );
          })}

        <CsfRuleList>
          {data?.data && (
            <CsfDetail
              label={t('invoices:subtotal')}
              value={formatCurrencyForBilling(data.data.amount - taxes)}
              testID={id('subtotal')}
            />
          )}
          {data?.data && (
            <CsfDetail
              label={t('invoices:tax')}
              value={formatCurrencyForBilling(taxes)}
              testID={id('tax')}
            />
          )}
          {data?.data && (
            <CsfDetail
              label={t('invoices:amountPaid')}
              value={formatCurrencyForBilling(data.data.amount)}
              testID={id('amountPaid')}
            />
          )}
        </CsfRuleList>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaInvoiceDetails;
