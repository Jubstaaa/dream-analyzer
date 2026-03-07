/**
 * Insight type enumeration
 * 0: Psychological - Psychological analysis (subconscious, fears, desires)
 * 1: Spiritual - Spiritual/religious interpretation (symbols, traditional)
 * 2: Statistical - Statistical data (e.g., "3rd nightmare this week")
 * 3: Actionable - Action-oriented advice (e.g., "Try meditation")
 * 4: Motivational - Motivational quotes
 * 5: Astrological - Astrological influences
 */
export enum InsightType {
  PSYCHOLOGICAL = 0,
  SPIRITUAL = 1,
  STATISTICAL = 2,
  ACTIONABLE = 3,
  MOTIVATIONAL = 4,
  ASTROLOGICAL = 5,
}

export const INSIGHT_TYPE_VALUES = [0, 1, 2, 3, 4, 5] as const;
export type InsightTypeValue = (typeof INSIGHT_TYPE_VALUES)[number];
