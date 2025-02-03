const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const metro = getDefaultConfig(__dirname);

/**
 * Subaru config overrides
 * @type {import('metro-config').MetroConfig}
 */
const subaru = {
  resolver: {
    assetExts: metro.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...metro.resolver.sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(metro, subaru);
