import React, { useState } from 'react';
import { getS3BucketUrl } from '../features/localization/localization.api';
import {
  screenOptionsDefaultOrientation,
  useAppNavigation,
  useAppRoute,
} from '../Controller';
import { useTranslation } from 'react-i18next';
import VideoPlayer from 'react-native-video-controls';
import { testID } from '../components/utils/testID';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaPage from '../components/MgaPage';

export interface VideoParams {
  cc: string
  mp4Source: string
  poster: string
  title: string
}

// TODO:AK:20240501: Add Captions On/Off button. Currently Captions are ON by default

const MgaHowToVideo: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'HowToVideo'>();
  const [isLoading, setIsLoading] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const s3BucketUrl = getS3BucketUrl();
  const { mp4Source, poster, title } = route.params;
  const subtitles = `${s3BucketUrl + '/assets/subtitles/' + route.params.cc}`;

  const id = testID('HowToVideos');

  return (
    <MgaPage
      noScroll
      title={title}
      showVehicleInfoBar={fullScreen ? false : true}>
      {isLoading ? <CsfActivityIndicator size={'large'} /> : null}
      {!fullScreen ? (
        <CsfView mv={24}>
          <CsfText variant="title2" align="center" testID={id('title')}>
            {title}
          </CsfText>
        </CsfView>
      ) : null}
      <CsfView style={{ width: '100%', height: fullScreen ? '100%' : 300 }}>
        <VideoPlayer
          controls={false}
          disableBack={true}
          fullscreen={true}
          ignoreSilentSwitch={'ignore'}
          muted={false}
          onEnterFullscreen={() => {
            navigation.setOptions({ orientation: 'landscape' });
            setFullScreen(true);
          }}
          onExitFullscreen={() => {
            navigation.setOptions(screenOptionsDefaultOrientation);
            setFullScreen(false);
          }}
          onError={() => setIsLoading(false)}
          onLoad={() => setIsLoading(false)}
          paused={true}
          poster={poster}
          repeat={false}
          resizeMode="contain"
          style={{ width: '100%', height: fullScreen ? '100%' : 300 }}
          selectedTextTrack={{
            type: 'title',
            value: title,
          }}
          source={{
            uri: mp4Source,
          }}
          testID={id('videoPlayer')}
          toggleResizeModeOnFullscreen={false}
          textTracks={[
            {
              title: title,
              language: t('tipVideos:subtitleLanguage'),
              type: t('tipVideos:subtitleType'),
              uri: subtitles,
            },
          ]}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaHowToVideo;
