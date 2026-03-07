/**
 * User validation constants
 */
export const USER_NAME_MIN_LENGTH = 2;
export const USER_NAME_MAX_LENGTH = 50;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;

/**
 * Premium subscription constants
 */
export const PREMIUM_FEATURES = {
  UNLIMITED_DREAMS: 'unlimited_dreams',
  ADVANCED_ANALYSIS: 'advanced_analysis',
  EXPORT_DREAMS: 'export_dreams',
  CUSTOM_INSIGHTS: 'custom_insights',
} as const;
