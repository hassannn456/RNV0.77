import React from 'react'

import { useTranslation } from 'react-i18next'
import MgaPage from '../../components/MgaPage'
import MgaPageContent from '../../components/MgaPageContent'
import CsfText from '../../components/CsfText'
import CsfView from '../../components/CsfView'
import MgaButton from '../../components/MgaButton'
// import {
//   surveyReset,
//   surveySignificantEvent,
//   surveyStart,
// } from '../../vendor/verint/MgaVerintSurvey'
// import { useAppNavigation } from '../../Controller'

const DevVerintSurvey: React.FC = () => {
  const { t } = useTranslation()

  return (
    <MgaPage title={t('internalDevelopment:survey')}>
      <MgaPageContent>
        <CsfText>
          {JSON.stringify(t('verint:config', { returnObjects: true }))}
        </CsfText>
        <CsfView gap={16}>
          <CsfView align="center" p={16} gap={16}>
            <CsfText>Start / Check the eligibility of the survey</CsfText>
            <MgaButton
              title="Show Survey"
              onPress={() => {
                // surveyStart()
                // surveySignificantEvent('launches', 'IDVerint')
              }}
            />
          </CsfView>
          <CsfView align="center" p={16} gap={16}>
            <CsfText>Record / Update Page Views</CsfText>
            <MgaButton
              title="Record Page Views"
              onPress={() => {
                // surveySignificantEvent('pageView', 'IDVerint')
              }}
            />
          </CsfView>
          <CsfView align="center" p={16} gap={16}>
            <CsfText>Reset the eligibility state of the survey</CsfText>
            <MgaButton title="Reset State"
            // onPress={surveyReset}
            />
          </CsfView>
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  )
}

export default DevVerintSurvey;
