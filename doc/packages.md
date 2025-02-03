# Package 

## Changelogs
- [babel](https://github.com/babel/babel/releases)
- [cspell](https://github.com/streetsidesoftware/cspell/blob/main/CHANGELOG.md)
- [datepicker](https://github.com/react-native-datetimepicker/datetimepicker/releases)
- [dotenv](https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md)
- [eslint](https://github.com/eslint/eslint/releases)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react/releases)
- [intl-pluralrules](https://github.com/eemeli/intl-pluralrules/releases)
- [jest](https://github.com/facebook/jest/releases)
- [lint-staged](https://github.com/okonet/lint-staged/releases)
- [prettier](https://github.com/prettier/prettier/releases)
- [react-hook-form](https://github.com/react-hook-form/react-hook-form/releases)
- [react-i18next](https://github.com/i18next/react-i18next/blob/master/CHANGELOG.md)
- [react-native](https://github.com/facebook/react-native/releases)
- [react-native-async-storage](https://github.com/react-native-async-storage/async-storage/releases)
- [react-native-device-info](https://github.com/react-native-device-info/react-native-device-info/blob/master/CHANGELOG.md)
- [react-native-keychain](https://github.com/oblador/react-native-keychain/releases)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context/releases)
- [react-native-screens](https://github.com/software-mansion/react-native-screens/releases)
- [react-native-svg](https://github.com/software-mansion/react-native-svg/releases)
- [react-native-svg-transformer](https://github.com/software-mansion/react-native-svg-transformer/releases)
- [react-native-webview](https://github.com/react-native-webview/react-native-webview/releases)
- [react-navigation](https://github.com/react-navigation/react-navigation/releases)
- [react-redux](https://github.com/reduxjs/react-redux/releases)
- [reduxjs-toolkit](https://github.com/reduxjs/redux-toolkit/releases)
- [typescript](https://github.com/microsoft/TypeScript/releases)
- [typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/releases)

## Pinned Packages

List non-dev packages with version pinning. Update this list when you 
pin / unpin a package. For an updated list, run: 

`gron package.json | grep 'dependencies\[' | grep --invert-match '\^'` 

- `react-native` : Jenkins needs to update to Node v18. [v16 is EOL 11-Sep-2023](https://nodejs.org/en/blog/announcements/nodejs16-eol/)
- `react-native-pager-view`: Pinned at 6.1. 6.2 breaks other scroll views on page. Scheduled to be fixed in 7.0.

