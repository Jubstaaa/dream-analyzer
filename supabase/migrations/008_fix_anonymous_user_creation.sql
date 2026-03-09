-- ============================================
-- Dream Analyzer - Fix Anonymous User Creation
-- ============================================
-- This migration relaxes the NOT NULL constraint on the email column
-- in the public.users table to support anonymous (guest) users who 
-- do not have an email address associated with their account.
-- ============================================

-- Relax email constraint
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Anonymous user support added!';
  RAISE NOTICE '   - public.users: email column is now nullable.';
END $$;
