-- ============================================
-- Dream Analyzer - Mobile-Ready Schema
-- ============================================
-- This migration adapts the schema for mobile app:
-- 1. User model: name/surname are required (not nullable)
-- 2. Remove profile update capability (read-only from mobile)
-- 3. Add AI interpretation tracking for dreams
-- 4. No dream update/delete from mobile (only create + read)
-- ============================================

-- ============================================
-- UPDATE USERS TABLE - Name/Surname Required
-- ============================================

-- Ensure name and surname are NOT NULL (required fields)
ALTER TABLE public.users
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN surname SET NOT NULL;

-- Set default values for existing NULL entries
UPDATE public.users
SET
  name = COALESCE(name, 'User'),
  surname = COALESCE(surname, '')
WHERE name IS NULL OR surname IS NULL;

-- Update the trigger function to require name/surname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, surname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'surname', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REMOVE UPDATE POLICY FOR USERS
-- ============================================
-- Users cannot update their profile via API
-- Only read access is allowed from mobile

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- ============================================
-- ADD AI INTERPRETATION TRACKING TO DREAMS
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

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.users.name IS 'User first name (required)';
COMMENT ON COLUMN public.users.surname IS 'User last name (required)';
COMMENT ON COLUMN public.dreams."aiModel" IS 'AI model used for interpretation (e.g., openrouter/meta-llama/llama-3.1-8b-instruct:free)';
COMMENT ON COLUMN public.dreams."aiTokensUsed" IS 'Number of tokens used for AI interpretation';
COMMENT ON COLUMN public.dreams."interpretationGeneratedAt" IS 'Timestamp when AI interpretation was generated';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Mobile-ready schema completed!';
  RAISE NOTICE '   - Users table: name/surname are required';
  RAISE NOTICE '   - Profile update policy removed (read-only)';
  RAISE NOTICE '   - AI interpretation tracking added to dreams';
  RAISE NOTICE '   - Schema ready for mobile app integration';
END $$;
