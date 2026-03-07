-- ============================================
-- Dream Analyzer - Add AI Fields to Dreams Table
-- ============================================
-- This migration adds AI tracking fields to dreams table
-- using camelCase naming convention
-- ============================================

-- Add columns to track AI-generated interpretations
ALTER TABLE public.dreams
  ADD COLUMN IF NOT EXISTS "aiModel" TEXT,
  ADD COLUMN IF NOT EXISTS "aiTokensUsed" INTEGER,
  ADD COLUMN IF NOT EXISTS "interpretationGeneratedAt" TIMESTAMPTZ;

-- Add index for tracking AI usage
CREATE INDEX IF NOT EXISTS idx_dreams_ai_interpretation
  ON public.dreams("interpretationGeneratedAt")
  WHERE interpretation IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.dreams."aiModel" IS 'AI model used for interpretation (e.g., moonshotai/kimi-k2:free)';
COMMENT ON COLUMN public.dreams."aiTokensUsed" IS 'Number of tokens used for AI interpretation';
COMMENT ON COLUMN public.dreams."interpretationGeneratedAt" IS 'Timestamp when AI interpretation was generated';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AI fields added to dreams table!';
  RAISE NOTICE '   - aiModel: AI model identifier';
  RAISE NOTICE '   - aiTokensUsed: Token count tracking';
  RAISE NOTICE '   - interpretationGeneratedAt: Generation timestamp';
END $$;
