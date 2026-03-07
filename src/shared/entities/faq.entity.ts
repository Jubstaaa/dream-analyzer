export interface FaqBaseEntity {
  id: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqTranslationEntity {
  id: string;
  faqId: string;
  language: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqEntity extends FaqBaseEntity {
  question: string;
  answer: string;
  language: string;
}
