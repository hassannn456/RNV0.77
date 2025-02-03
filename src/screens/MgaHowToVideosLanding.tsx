import React from 'react'
import { CsfLandingMenuListItem } from '../components/CsfListItemLanding'
import { useAppNavigation } from '../Controller'
import { useTranslation } from 'react-i18next'
import { VideoParams } from './MgaHowToVideo'
import { testID } from '../components/utils/testID'
import { CsfRuleList } from '../components/CsfRuleList'
import CsfTile from '../components/CsfTile'
import MgaPage from '../components/MgaPage'
import MgaPageContent from '../components/MgaPageContent'

const MgaHowToVideosLanding: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useAppNavigation()

  const videosList: VideoParams[] = t('tipVideos:videos', {
    returnObjects: true,
  })

  const id = testID('HowToVideoLanding')

  return (
    <MgaPage title={t('tipVideos:howToVideos')} showVehicleInfoBar>
      <MgaPageContent title={t('tipVideos:howToVideos')}>
        <CsfTile pv={0}>
          <CsfRuleList testID={id('list')}>
            {videosList.map((video, i) => {
              const itemTestId = testID(id(`video-${i}`))
              return (
                <CsfLandingMenuListItem
                  key={video.mp4Source}
                  title={video.title}
                  testID={itemTestId()}
                  onPress={() => navigation.push('HowToVideo', { ...video })}
                />
              )
            })}
          </CsfRuleList>
        </CsfTile>
      </MgaPageContent>
    </MgaPage>
  )
}


export default MgaHowToVideosLanding