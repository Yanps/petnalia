export type FeatureFlagKey =
  | 'FEATURE_MAGIC_LINK'
  | 'FEATURE_GOOGLE_OAUTH'
  | 'FEATURE_WHATSAPP'
  | 'FEATURE_POLYGON_SERVICE_AREA';

/** All feature flags default to OFF. Enabled via environment variables. */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, false> = {
  FEATURE_MAGIC_LINK: false,
  FEATURE_GOOGLE_OAUTH: false,
  FEATURE_WHATSAPP: false,
  FEATURE_POLYGON_SERVICE_AREA: false,
};

/** Returns true if the feature flag is enabled in the current environment. */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return process.env[flag] === 'true';
}
