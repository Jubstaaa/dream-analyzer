-- ============================================
-- Fix Permissions for Service Role
-- ============================================
-- This migration fixes "permission denied for table" errors
-- Run this if you're getting 42501 errors with service_role key

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticator;

-- Grant table permissions to service_role (bypasses RLS)
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.dreams TO service_role;
GRANT ALL ON public.insights TO service_role;
GRANT ALL ON public.faqs TO service_role;
GRANT ALL ON public.faq_translations TO service_role;

-- Grant table permissions to authenticator (for anon key operations)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticator;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dreams TO authenticator;
GRANT SELECT ON public.insights TO authenticator;
GRANT SELECT ON public.faqs TO authenticator;
GRANT SELECT ON public.faq_translations TO authenticator;

-- Grant sequence permissions (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator;



