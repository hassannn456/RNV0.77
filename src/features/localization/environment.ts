import DeviceInfo from 'react-native-device-info';
import environments from '../../../environments.json';
import {trackError} from '../../components/useTracking';
import {store} from '../../store';

import featureFlags from '../../../featureFlags.json';

export type MgaFeatureFlag = keyof typeof featureFlags;

export interface MgaEnvironmentConfig {
  id: string;
  type: string;
  /**
   * Subfolder containing per-environment overrides for demo mode.
   *
   * Used to give different demo data for US and Canada.
   * Useful for testing new mocks.
   **/
  demoFolder?: string;
  /** List of languages by code (ex: "en", "fr") allowed in environment. */
  languages?: string[];
  marketId: number;
  mobileapi: string;
  s3BucketUrl: string;
  microservice: string;
  featureFlags: Record<MgaFeatureFlag, boolean>;
}

/**
 * Get Subaru's marketId for application bundle identifier.
 *
 * Used to filter environment lists.
 **/
export const marketIdForBundleId = (bundleId: string): number | null => {
  if (!bundleId) {
    trackError('environment.ts::marketIdForBundleId')('BundleId not found!');
    return null;
  }
  switch (bundleId) {
    // MGA ("red app") - can hit any region
    case 'com.subaru.telematics.mysubaru':
      return null;
    // SOA - can hit USA's backend
    case 'com.subaru.telematics.app.remote':
      return 1;
    // SCI - can hit Canada's backend
    case 'ca.subaru.telematics.remote':
      return 2;
    default: {
      return null;
    }
  }
};

export const getEnvironmentList = (): MgaEnvironmentConfig[] => {
  return environments;

  // TODO:AG:20241121 evaluate whether we need to filter environments by marketId
  // if (marketId) {
  //   return environments.filter(e => e.marketId == marketId)
  // } else {
  //   return environments
  // }
};

export const getEnvironmentConfig: (
  id?: string,
) => MgaEnvironmentConfig | undefined = id => {
  const environments = getEnvironmentList();
  const bundleId = DeviceInfo.getBundleId();
  const marketId = marketIdForBundleId(bundleId);

  if (!environments || environments.length == 0) {
    return undefined; // Config file incorrect
  }
  const current = environments.filter(e => e.id == id)[0];
  if (current) {
    return current;
  }
  // Environment not found -- default first prod for market
  const firstProd = environments.find(
    e => e.type == 'prod' && e.marketId == marketId,
  );
  if (firstProd) {
    return firstProd;
  }
  // Prod not found (!) -- default first
  return environments[0];
};

export const getCurrentEnvironmentConfig: () =>
  | MgaEnvironmentConfig
  | undefined = () => {
  const id = store.getState().preferences?.environment;
  return getEnvironmentConfig(id);
};

/** List supported languages for the currently selected market. */
export const getLanguages = (): string[] => {
  const config = getCurrentEnvironmentConfig();
  const languages = config?.languages ?? [];
  if (languages.length == 0) {
    trackError('getLanguages::noLanguages')(
      'No languages found in environment.',
    );
  }
  return languages;
};
