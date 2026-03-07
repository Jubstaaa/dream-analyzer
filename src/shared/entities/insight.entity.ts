import { InsightType } from '@shared/enums';

export interface InsightEntity {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  type: InsightType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
