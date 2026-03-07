/**
 * Dream type enumeration
 * 0: Normal - Regular, everyday dreams
 * 1: Nightmare - Nightmares, fearful dreams
 * 2: Lucid - Lucid dreams (aware of dreaming)
 * 3: Recurring - Recurring dreams
 * 4: Prophetic - Prophetic/precognitive dreams
 * 5: Mixed - Mixed/confusing dreams
 */
export enum DreamType {
  NORMAL = 0,
  NIGHTMARE = 1,
  LUCID = 2,
  RECURRING = 3,
  PROPHETIC = 4,
  MIXED = 5,
}

export const DREAM_TYPE_VALUES = [0, 1, 2, 3, 4, 5] as const;
export type DreamTypeValue = (typeof DREAM_TYPE_VALUES)[number];
