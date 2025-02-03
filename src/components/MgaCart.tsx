import React, { useRef } from 'react';
import CsfView, { CsfViewProps } from './CsfView';
import CsfText from './CsfText';
import { useTranslation } from 'react-i18next';
import CsfRule from './CsfRule';
import { formatCurrencyForBilling, getStringFromMonths } from '../utils/subscriptions';
import { SubscriptionResult } from '../../@types';
import { CsfWindowShade, CsfWindowShadeRef } from './CsfWindowShade';
import MgaButton from './MgaButton';
import { testID } from './utils/testID';

export interface MgaCartItem {
  id?: string;
  title?: string;
  subtitle?: string;
  priceString?: string;
  months?: number;
}

export interface MgaCartLineItemViewProps extends CsfViewProps {
  item?: MgaCartItem;
  onEdit?: (item: MgaCartItem) => void;
}

export const MgaCartLineItemView: React.FC<MgaCartLineItemViewProps> = ({
  item,
  onEdit,
  ...viewProps
}) => {
  const { t } = useTranslation();
  const id = testID('CartLineItemView');

  if (!item) return null;

  return (
    <CsfView {...viewProps}>
      <CsfView flexDirection="row" align="center" justify="space-between">
        <CsfText bold color="button" testID={id('title')} wrap>
          {item.title
            ? item.months
              ? `${item.title} - ${getStringFromMonths(item.months)}`
              : item.title
            : ''}
        </CsfText>
        {onEdit && (
          <MgaButton
            trackingId="CartEditItemButton"
            variant="inlineLink"
            title={t('common:edit')}
            onPress={() => onEdit?.(item)}
          />
        )}
      </CsfView>
      <CsfView flexDirection="row" align="center" justify="space-between">
        <CsfText testID={id('subtitle')}>{item.subtitle}</CsfText>
        <CsfText testID={id('price')}>{item.priceString}</CsfText>
      </CsfView>
    </CsfView>
  );
};

export interface MgaCartProps {
  title?: string;
  items?: MgaCartItem[];
  onEdit?: (item: MgaCartItem) => boolean;
  subscriptionResult?: SubscriptionResult;
}

export const MgaCart: React.FC<MgaCartProps> = ({
  title,
  items = [],
  onEdit,
  subscriptionResult,
  ...cartProps
}) => {
  const { t } = useTranslation();
  const ref = useRef<CsfWindowShadeRef>(null);

  const subTotalString = subscriptionResult
    ? formatCurrencyForBilling(subscriptionResult.invoicePreTaxTotal)
    : t('subscriptionEnrollment:calculating');

  const taxString = subscriptionResult
    ? formatCurrencyForBilling(subscriptionResult.invoiceTaxTotal)
    : t('subscriptionEnrollment:calculating');

  const totalString = subscriptionResult
    ? formatCurrencyForBilling(subscriptionResult.invoiceTotal)
    : t('subscriptionEnrollment:calculating');

  return (
    <CsfWindowShade
      icon="ShoppingCart"
      ref={ref}
      title={t('common:cartItem', { count: items.length })}
      {...cartProps}
    >
      <CsfView p={8} gap={8}>
        <CsfText variant="subheading">
          {title || t('subscriptionUpgrade:starlinkPlanSummary')}
        </CsfText>
        {items.map(item => (
          <MgaCartLineItemView
            key={item.id}
            item={item}
            onEdit={
              onEdit
                ? () => {
                  onEdit(item);
                  ref.current?.setShadeOpen(false);
                }
                : undefined
            }
          />
        ))}
        <CsfRule />
        {subTotalString && (
          <CsfView flexDirection="row" align="center" justify="space-between">
            <CsfText>{t('subscriptionModify:yourSubTotal')}</CsfText>
            <CsfText>{subTotalString}</CsfText>
          </CsfView>
        )}
        {taxString && (
          <CsfView flexDirection="row" align="center" justify="space-between">
            <CsfText>{t('subscriptionModify:tax')}</CsfText>
            <CsfText>{taxString}</CsfText>
          </CsfView>
        )}
        {totalString && (
          <CsfView flexDirection="row" align="center" justify="space-between">
            <CsfText bold>{t('subscriptionModify:total')}</CsfText>
            <CsfText bold>{totalString}</CsfText>
          </CsfView>
        )}
      </CsfView>
    </CsfWindowShade>
  );
};

export default MgaCart;
