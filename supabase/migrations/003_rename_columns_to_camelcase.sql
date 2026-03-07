-- Migration: Rename columns from snake_case to camelCase
-- This migration renames all snake_case columns to camelCase for consistency with TypeScript

BEGIN;

-- ============================================
-- DROP TRIGGERS (will recreate with new column names)
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_dreams_updated_at ON public.dreams;
DROP TRIGGER IF EXISTS update_insights_updated_at ON public.insights;
DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
DROP TRIGGER IF EXISTS update_faq_translations_updated_at ON public.faq_translations;

-- ============================================
-- DROP POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can create their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can update their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can delete their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Anyone can view active insights" ON public.insights;
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Anyone can view FAQ translations" ON public.faq_translations;

-- ============================================
-- DROP INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_users_premium;
DROP INDEX IF EXISTS idx_dreams_user_id;
DROP INDEX IF EXISTS idx_dreams_created_at;
DROP INDEX IF EXISTS idx_insights_active;
DROP INDEX IF EXISTS idx_faqs_active;
DROP INDEX IF EXISTS idx_faq_translations_faq_id;

-- ============================================
-- RENAME COLUMNS - USERS TABLE
-- ============================================

ALTER TABLE public.users RENAME COLUMN image_url TO "imageUrl";
ALTER TABLE public.users RENAME COLUMN premium_expire_date TO "premiumExpireDate";
ALTER TABLE public.users RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.users RENAME COLUMN updated_at TO "updatedAt";

-- ============================================
-- RENAME COLUMNS - DREAMS TABLE
-- ============================================

ALTER TABLE public.dreams RENAME COLUMN user_id TO "userId";
ALTER TABLE public.dreams RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.dreams RENAME COLUMN updated_at TO "updatedAt";

-- ============================================
-- RENAME COLUMNS - INSIGHTS TABLE
-- ============================================

ALTER TABLE public.insights RENAME COLUMN image_url TO "imageUrl";
ALTER TABLE public.insights RENAME COLUMN reading_time TO "readingTime";
ALTER TABLE public.insights RENAME COLUMN is_active TO "isActive";
ALTER TABLE public.insights RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.insights RENAME COLUMN updated_at TO "updatedAt";

-- ============================================
-- RENAME COLUMNS - FAQS TABLE
-- ============================================

ALTER TABLE public.faqs RENAME COLUMN is_active TO "isActive";
ALTER TABLE public.faqs RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.faqs RENAME COLUMN updated_at TO "updatedAt";

-- ============================================
-- RENAME COLUMNS - FAQ_TRANSLATIONS TABLE
-- ============================================

ALTER TABLE public.faq_translations RENAME COLUMN faq_id TO "faqId";
ALTER TABLE public.faq_translations RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.faq_translations RENAME COLUMN updated_at TO "updatedAt";

-- ============================================
-- RECREATE INDEXES
-- ============================================

CREATE INDEX idx_users_premium ON public.users("premiumExpireDate")
WHERE "premiumExpireDate" IS NOT NULL;

CREATE INDEX idx_dreams_user_id ON public.dreams("userId");
CREATE INDEX idx_dreams_created_at ON public.dreams("createdAt" DESC);

CREATE INDEX idx_insights_active ON public.insights("isActive") WHERE "isActive" = true;

CREATE INDEX idx_faqs_active ON public.faqs("isActive") WHERE "isActive" = true;

CREATE INDEX idx_faq_translations_faq_id ON public.faq_translations("faqId");

-- ============================================
-- RECREATE POLICIES
-- ============================================

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = "userId");

CREATE POLICY "Anyone can view active insights" ON public.insights
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Anyone can view active FAQs" ON public.faqs
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Anyone can view FAQ translations" ON public.faq_translations
  FOR SELECT USING (true);

-- ============================================
-- UPDATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECREATE TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON public.dreams
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON public.insights
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_translations_updated_at BEFORE UPDATE ON public.faq_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UPDATE HANDLE NEW USER FUNCTION
-- ============================================

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

COMMIT;
