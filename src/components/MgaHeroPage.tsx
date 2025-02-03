/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import MgaPage, { MgaPageProps } from './MgaPage'
import {
  Image,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import CsfView from './CsfView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimension } from './types'
import LinearGradient from 'react-native-linear-gradient'
import { useCsfColors } from './useCsfColors'

const MgaHeroPageStylesheets = {
  stacked: StyleSheet.create({
    image: { height: '100%', width: '100%', zIndex: 1, resizeMode: 'cover' },
  }),
}

interface MgaHeroPageProps extends MgaPageProps {
  heroSource?: ImageSourcePropType
  stylesheet?: keyof typeof MgaHeroPageStylesheets
}

const MgaHeroPage: React.FC<MgaHeroPageProps> = ({
  heroSource,
  stylesheet,
  ...mgaPageProps
}): JSX.Element => {
  const styles = MgaHeroPageStylesheets[stylesheet ?? 'stacked']
  const insets = useSafeAreaInsets()
  const { colors } = useCsfColors()
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <MgaPage bg="dark" noScroll {...mgaPageProps}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundSecondary}
      />
      <CsfView flex={1}>
        <CsfView flex={1} borderWidth={0} theme="dark" bg="backgroundSecondary">
          {heroSource && <Image style={styles.image} source={heroSource} />}
          <CsfView
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 10,
            }}
            justify="flex-end"
            borderColor="error">
            <LinearGradient
              colors={[
                'rgba(29, 37, 44,0)',
                'rgba(29, 37, 44,.5)',
                'rgba(29, 37, 44,1)',
              ]}
              style={{ height: '35%' }}
            />
          </CsfView>
        </CsfView>
        <CsfView
          bg="backgroundSecondary"
          theme="dark"
          ph={16}
          pt={0}
          pb={insets.bottom as Dimension}>
          {mgaPageProps.children}
        </CsfView>
      </CsfView>
    </MgaPage>
  )
}

export default MgaHeroPage
