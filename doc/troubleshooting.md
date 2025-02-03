# Troubleshooting

This file holds solutions to problems you may encounter.

## Android App Not Updating

If you find that your changes are not showing up when you run android, it could be that the assets directory "android/src/main/assets" is not getting updated. You should be able to tell by looking at the date on the file: index.android.bundle.

You can force the asset to be updated using the command:

```
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/src/main/assets/index.android.bundle --assets-dest android/src/main/res
```

You can see further discussions at:

```
https://stackoverflow.com/questions/78273855/react-native-release-build-issue-index-android-bundle-file-not-created-in-asse
```
