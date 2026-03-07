import { DreamType } from '@shared/enums';

export interface DreamEntity {
  id: string;
  userId: string;
  title: string;
  content: string;
  interpretation: string | null;
  date: string;
  type: DreamType;
  aiModel: string | null;
  aiTokensUsed: number | null;
  interpretationGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
