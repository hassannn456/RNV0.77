import React from 'react';
import { useTranslation } from 'react-i18next';
import MgaPage from '../components/MgaPage';
import { useAppNavigation } from '../Controller';
import { useInvoicesPageQuery } from '../api/manageEnrollment.api';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import promptAlert from '../components/CsfAlert';
import CsfDetail from '../components/CsfDetail';
import { CsfRuleList } from '../components/CsfRuleList';
import CsfText from '../components/CsfText';
import MgaButton from '../components/MgaButton';
import MgaPageContent from '../components/MgaPageContent';

const MgaInvoices: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useInvoicesPageQuery(undefined);
  const navigation = useAppNavigation();
  const invoices = data?.data ?? [];
  const id = testID('Invoices');
  return (
    <MgaPage title={t('invoices:title')} showVehicleInfoBar>
      <MgaPageContent
        title={t('invoices:invoicesRefundNotices')}
        isLoading={isLoading}>
        {invoices.length == 0 ? (
          <CsfText align="center" testID={id('noInvoicesAndRefunds')}>
            {t('invoices:noInvoicesAndRefunds')}
          </CsfText>
        ) : (
          <CsfText align="center" testID={id('viewAll')}>
            {t('invoices:viewAll')}
          </CsfText>
        )}

        {invoices.map((invoice, index) => {
          const itemTestId = testID(id(`invoice-${index}`));
          return (
            <CsfCard
              gap={16}
              title={invoice.parsedInvoiceDate}
              key={invoice.number}
              testID={itemTestId()}
              action={
                invoice.invoiceType == 'INVOICE' ? (
                  <MgaButton
                    trackingId={itemTestId('InvoiceButton')}
                    variant="inlineLink"
                    title={t('invoices:invoice')}
                    onPress={() =>
                      navigation.push('InvoiceDetails', {
                        invoiceNumber: invoice.number,
                      })
                    }
                  />
                ) : invoice.invoiceType == 'ELECTRONIC_REFUND' ? (
                  <MgaButton
                    trackingId={itemTestId('ElectronicRefund')}
                    variant="inlineLink"
                    title={t('invoices:automaticRefund')}
                    onPress={() =>
                      navigation.push('RefundDetails', {
                        refundTransactionId: invoice.number,
                      })
                    }
                  />
                ) : (
                  <MgaButton
                    trackingId={itemTestId('ManualRefund')}
                    variant={'inlineLink'}
                    title={t('invoices:manualRefund')}
                    onPress={async () => {
                      await promptAlert(
                        t('invoices:manualRefund'),
                        t('invoices:manualRefundCopy'),
                      );
                    }}
                  />
                )
              }>
              <CsfRuleList>
                <CsfDetail
                  label={t('invoices:invoiceNumber')}
                  value={invoice.number}
                  testID={id(`invoiceNumber-${index}`)}
                />

                <CsfDetail
                  label={t('invoices:amount')}
                  value={invoice.amount}
                  testID={id(`amount-${index}`)}
                />
              </CsfRuleList>
            </CsfCard>
          );
        })}
      </MgaPageContent>
    </MgaPage>
  );
};


export default MgaInvoices;
