/* eslint-disable eqeqeq */
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  formatFullDate,
  formatFullDateTime,
  formatMonthYear,
  formatShortDateWithWeekday,
  formatShortTime,
  formatWeekday,
} from '../../utils/dates';
import CsfSelect, { CsfDropdownItem } from '../../components/CsfSelect';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfCard from '../../components/CsfCard';
import CsfRuleList from '../../components/CsfRuleList';
import CsfDetail from '../../components/CsfDetail';
import CsfDatePicker from '../../components/CsfDatePicker';

const DevUtils: React.FC = () => {
  const { t } = useTranslation();
  const [displayDate, setDisplayDate] = useState(new Date());
  const [locale, setLocale] = useState<
    Intl.UnicodeBCP47LocaleIdentifier | undefined
  >();
  const [timeZone, setTimeZone] = useState<string | undefined>();

  interface LocaleDropdownItem extends CsfDropdownItem {
    value: Intl.UnicodeBCP47LocaleIdentifier | undefined
  }

  const locales: LocaleDropdownItem[] = [
    {
      label: 'Locale Here',
      value: undefined,
    },
    {
      label: 'en-US',
      value: 'en-US',
    },
    {
      label: 'en-CA',
      value: 'en-CA',
    },
    {
      label: 'en-IN',
      value: 'en-IN',
    },
    {
      label: 'fr-CA',
      value: 'fr-CA',
    },
  ];

  const timeZones: CsfDropdownItem[] = [
    {
      label: 'Time Zone Here',
      value: undefined,
    },
    {
      label: 'UTC',
      value: 'UTC',
    },
    {
      label: 'EST',
      value: 'EST',
    },
    {
      label: 'CST',
      value: 'CST',
    },
    {
      label: 'MST',
      value: 'MST',
    },
    {
      label: 'PST',
      value: 'PST',
    },
    {
      label: 'IST',
      value: 'IST',
    },
  ];

  return (
    <MgaPage title={t('internalDevelopment:miscellaneous')}>
      <CsfView p={16} pv={24} gap={16}>
        <CsfText variant="title2">
          {t('internalDevelopment:miscellaneous')}
        </CsfText>

        <CsfCard title={t('internalDevelopment:branding')} gap={16}>
          <CsfRuleList>
            <CsfDetail
              stacked
              label="starlink"
              value={t('branding:starlink')}
            />

            <CsfDetail
              stacked
              label="subaruStarlink"
              value={t('branding:subaruStarlink')}
            />

            <CsfDetail
              stacked
              label="connectedServices"
              value={t('branding:connectedServices')}
            />

            <CsfDetail
              stacked
              label="starlinkConnectedServices"
              value={t('branding:starlinkConnectedServices')}
            />

            <CsfDetail
              stacked
              label="subaruStarlinkConnectedServices"
              value={t('branding:subaruStarlinkConnectedServices')}
            />
          </CsfRuleList>
        </CsfCard>

        <CsfCard title={t('internalDevelopment:dates')} gap={16}>
          <CsfDatePicker
            onChangeDate={v => setDisplayDate(new Date(v))}
            label={t('internalDevelopment:dateTimeHere')}
            date={displayDate}
            mode="datetime"
          />
          <CsfSelect
            label={t('internalDevelopment:targetLocale')}
            value={locale}
            options={locales}
            onSelect={value => setLocale(value == '' ? undefined : value)}
          />
          <CsfSelect
            label={t('internalDevelopment:targetTimeZone')}
            value={timeZone}
            options={timeZones}
            onSelect={value => setTimeZone(value == '' ? undefined : value)}
          />

          <CsfRuleList>
            <CsfDetail
              label="formatFullDateTime"
              value={formatFullDateTime(displayDate || new Date(), {
                timeZone: timeZone,
                locale: locale,
              })}
            />
            <CsfDetail
              label="formatFullDate"
              value={formatFullDate(displayDate || new Date(), {
                timeZone: timeZone,
                locale: locale,
              })}
            />
            <CsfDetail
              label="formatShortDateWithWeekday"
              value={formatShortDateWithWeekday(displayDate || new Date(), {
                timeZone: timeZone,
                locale: locale,
              })}
            />
            <CsfDetail
              label="formatWeekday"
              value={formatWeekday(displayDate || new Date())}
            />
            <CsfDetail
              label="formatShortTime"
              value={formatShortTime(displayDate || new Date())}
            />
            <CsfDetail
              label="formatMonthYear"
              value={formatMonthYear(displayDate || new Date())}
            />
          </CsfRuleList>
        </CsfCard>
      </CsfView>
    </MgaPage>
  );
};

export default DevUtils;
