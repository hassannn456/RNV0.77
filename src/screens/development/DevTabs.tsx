/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CsfProgressDots, CsfProgressNumbers } from '../../components/CsfProgressDots'
import MgaPage from '../../components/MgaPage'
import CsfView from '../../components/CsfView'
import CsfText from '../../components/CsfText'
import { CsfSegmentTabBar } from '../../components/CsfSegmentTabBar'
import CsfTile from '../../components/CsfTile'
import CsfStatusChip, { CsfChip } from '../../components/CsfChip'

export const DevTabs: React.FC = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState('tab0')
  const [dot, setDot] = useState(3)
  return (
    <MgaPage title={t('internalDevelopment:tabs')}>
      <CsfView pv={24} p={16} gap={16}>
        <CsfText variant="title2" align="center">
          Tabs and Dots
        </CsfText>

        <CsfSegmentTabBar
          options={[
            { label: 'Label 1', value: 'tab0' },
            { label: 'Label2', value: 'tab1' },
            { label: 'Label3', value: 'tab3' },
          ]}
          value={tab}
          onSelect={v => setTab(v)}
        />

        <CsfProgressDots count={5} index={dot} onDotPress={v => setDot(v)} />
        <CsfProgressDots
          count={5}
          index={dot}
          onDotPress={v => setDot(v)}
          variant="outline"
        />

        <CsfProgressDots
          count={5}
          index={dot}
          onDotPress={v => setDot(v)}
          variant="classic"
        />
        <CsfProgressNumbers count={5} index={dot} onDotPress={v => setDot(v)} />

        <CsfTile gap={16}>
          <CsfProgressNumbers
            count={5}
            index={dot}
            onDotPress={v => setDot(v)}
            variant="background"
          />

          <CsfView gap={8} flexDirection="row" style={{ flexWrap: 'wrap' }}>
            <CsfChip icon="Success" active label={'Label 1'} value={'test'} />
            <CsfChip label={'Label 2'} value={'test'} />
            <CsfChip label={'Label 3'} value={'test'} />
            <CsfChip label={'Label 4'} value={'test'} />
            <CsfChip label={'Label 5'} value={'test'} />
          </CsfView>

          <CsfView gap={8} flexDirection="row" style={{ flexWrap: 'wrap' }}>
            <CsfChip icon="Abs" active label={'Label 1'} value={'test'} />
            <CsfChip icon="AirbagSystem" label={'Label 2'} value={'test'} />
          </CsfView>

          <CsfView gap={8} flexDirection="row" style={{ flexWrap: 'wrap' }}>
            <CsfStatusChip active label={'Label 1'} value={'test'} />
            <CsfStatusChip label={'Label 1'} value={'test'} />
          </CsfView>
        </CsfTile>
      </CsfView>
    </MgaPage>
  )
}
