/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller';
import { useTranslation } from 'react-i18next';
import { Journal, LocateResponseData } from '../../../@types';
import { getJournalDateRange, getTripDistanceString } from './MgaSelectTrip';
import { convertUnits } from '../../utils/units';
import { formatFullDate, formatShortTime } from '../../utils/dates';
import { deleteJournal, useJournalQuery } from '../../api/drivingJournal.api';
import { testID } from '../../components/utils/testID';
import { MgaMarker } from '../../components';
import CsfAccordionList from '../../components/CsfAccordionList';
import CsfAccordionSection from '../../components/CsfAccordionSection';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import CsfDetail from '../../components/CsfDetail';
import CsfListItem from '../../components/CsfListItem';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfText from '../../components/CsfText';
import CsfTile from '../../components/CsfTile';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaMarkerMap from '../../components/MgaMarkerMap';
import MgaPage from '../../components/MgaPage';
import MgaJournalIcon from './MgaJournalIcon';

export const getJournalDriveTime = (journal: Journal): string => {
  const journalEntries = journal?.journalEntries ?? [];
  const driveTotalSeconds =
    journalEntries.reduce((sum, entry) => {
      const t0 = new Date(entry.startTime).getTime();
      const t1 = new Date(entry.endTime).getTime();
      return sum + t1 - t0;
    }, 0) / 1000;
  const hours = Math.floor(driveTotalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((driveTotalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(driveTotalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const MgaTripTrackerJournalDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'TripTrackerJournalDetails'>();
  const { journal, journalEntries } = useJournalQuery(route.params.journalId);
  const firstEntry = journalEntries.length == 0 ? null : journalEntries[0];
  const lastEntry =
    journalEntries.length == 0
      ? null
      : journalEntries[journalEntries.length - 1];
  const journalGroups: string[] = journalEntries.reduce((collection, entry) => {
    const key = entry.startTime.substring(0, 10);
    if (!collection.includes(key)) {
      collection.push(key);
    }
    return collection;
  }, [] as string[]);
  const markers: MgaMarker[] = journalEntries.flatMap((entry, index) => {
    const positionData =
      typeof entry.positionData == 'string'
        ? (JSON.parse(entry.positionData) as LocateResponseData[])
        : entry.positionData;
    if (!positionData) return undefined;
    if (positionData.length == 0) return undefined;
    return {
      latitude: positionData[0].latitude,
      longitude: positionData[0].longitude,
      symbolBackgroundColor: '#297BE0',
      symbolText: String(index + 1),
    };
  });

  const id = testID('TripTrackerJournalDetails');
  return (
    <MgaPage showVehicleInfoBar title={journal?.journalName ?? ''}>
      {journal ? (
        <CsfView edgeInsets standardSpacing>
          <CsfTile>
            <CsfView flexDirection="row" align="center" justify="space-between">
              <CsfView flexDirection="row" align="center">
                <MgaJournalIcon journal={journal} />
                <CsfView>
                  <CsfText variant="subheading" testID={id('journalName')}>
                    {journal.journalName}
                  </CsfText>
                  <CsfText variant="body2" testID={id('journalDateRange')}>
                    {getJournalDateRange(journal)}
                  </CsfText>
                </CsfView>
              </CsfView>
              <MgaButton
                trackingId="TripTrackerJournalEdit"
                variant="link"
                title={t('common:edit')}
                onPress={() =>
                  navigation.push('TripTrackerJournalEditDetails', journal)
                }
              />
            </CsfView>
          </CsfTile>
          <MgaMarkerMap
            onMessage={action => {
              switch (action.type) {
                case 'marker/pressed': {
                  const entry = journalEntries[action.payload.index];
                  if (entry) {
                    navigation.push('TripTrackerJournalEntryDetails', entry);
                  } else {
                    console.warn(
                      `Journal entry not matched :: ${JSON.stringify(action)}`,
                    );
                  }
                  break;
                }
              }
            }}
            markers={markers}
            style={{
              height: 300,
              width: '100%',
            }}
          />
          <CsfTile>
            <CsfRuleList>
              <CsfDetail
                label="Trip Logs"
                value={journalEntries.length}
                testID={id('tripLogs')}
              />
              <CsfDetail
                label="Mileage"
                value={getTripDistanceString(journalEntries)}
                testID={id('Mileage')}
              />
              <CsfDetail
                label="Drive Time"
                value={getJournalDriveTime(journal)}
                testID={id('driveTime')}
              />
              {firstEntry && (
                <CsfDetail
                  label={t('tripTrackerLanding:odometerStart')}
                  testID={id('odometerStart')}
                  value={
                    journalEntries.length == 0
                      ? '--'
                      : convertUnits(
                        firstEntry.startOdometerValue,
                        firstEntry.startOdometerUnit,
                        t('units:distance'),
                      )?.toFixed(1)
                  }
                />
              )}
              {lastEntry && (
                <CsfDetail
                  label={t('tripTrackerLanding:odometerEnd')}
                  testID={id('odometerEnd')}
                  value={
                    journalEntries.length == 0
                      ? '--'
                      : convertUnits(
                        lastEntry.endOdometerValue,
                        lastEntry.endOdometerUnit,
                        t('units:distance'),
                      )?.toFixed(1)
                  }
                />
              )}
            </CsfRuleList>
          </CsfTile>
          <CsfAccordionList>
            {journalGroups.map((group, index) => {
              const items = journalEntries.filter(entry =>
                entry.startTime.startsWith(group),
              );
              const itemTestId = testID(id(`group-${index}`));
              return (
                <CsfAccordionSection
                  key={group}
                  title={`${formatFullDate(group)} (${items.length})`}
                  renderBody={() => (
                    <CsfRuleList testID={itemTestId()}>
                      {items.map((entry, i) => {
                        const innerItemTestId = testID(itemTestId(`entry-${i}`));
                        const title = `${formatShortTime(
                          entry.startTime,
                        )} - ${formatShortTime(entry.endTime)}`;
                        const subtitle = getTripDistanceString(entry);
                        return (
                          <CsfListItem
                            testID={innerItemTestId()}
                            onPress={() =>
                              navigation.push(
                                'TripTrackerJournalEntryDetails',
                                entry,
                              )
                            }
                            key={entry.tripLogDataId}
                            title={title}
                            titleTextVariant="body2"
                            subtitle={subtitle}
                          />
                        );
                      })}
                    </CsfRuleList>
                  )}
                />
              );
            })}
          </CsfAccordionList>
          <MgaButton
            trackingId="TripTrackerDeleteJournal"
            icon="Delete"
            title={t('tripLogAddJournal:deleteJournal')}
            variant="link"
            onPress={async () => {
              const response = await deleteJournal(journal);
              if (response.success) {
                popIfTop(navigation, 'TripTrackerJournalDetails');
              }
            }}
          />
        </CsfView>
      ) : (
        <CsfView edgeInsets standardSpacing>
          <CsfActivityIndicator />
        </CsfView>
      )}
    </MgaPage>
  );
};

export default MgaTripTrackerJournalDetails;