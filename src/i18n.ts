import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import 'intl-pluralrules';
import {i18nBiometricsType} from '../src/features/biometrics/biometrics';
import {MgaS3Backend} from '../src/features/localization/localization.i18n';
import {trackError} from '../src/components/useTracking';

i18n
  .use(initReactI18next)
  .use(i18nBiometricsType)
  .use(MgaS3Backend)
  .init({
    resources: {},
    partialBundledLanguages: true,
    initImmediate: false,
    ns: ['command', 'language', 'login'],
    postProcess: [i18nBiometricsType.name], // Odd that we have to specify this twice
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .catch(trackError('i18n.ts'));

export default i18n;
