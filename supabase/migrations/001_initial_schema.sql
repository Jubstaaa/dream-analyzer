-- ============================================
-- Dream Analyzer Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE dream_type AS ENUM (
  'normal',
  'nightmare',
  'lucid',
  'recurring',
  'prophetic',
  'mixed'
);

CREATE TYPE insight_type AS ENUM (
  'psychological',
  'spiritual',
  'statistical',
  'actionable',
  'motivational',
  'astrological'
);

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  image_url TEXT,
  premium_expire_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookup
CREATE INDEX idx_users_email ON public.users(email);

-- Index for premium users (partial index for non-null values)
CREATE INDEX idx_users_premium ON public.users(premium_expire_date)
WHERE premium_expire_date IS NOT NULL;

-- ============================================
-- DREAMS TABLE
-- ============================================

CREATE TABLE public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
  content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),
  interpretation TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type dream_type NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dreams
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_dreams_date ON public.dreams(date DESC);
CREATE INDEX idx_dreams_type ON public.dreams(type);
CREATE INDEX idx_dreams_created_at ON public.dreams(created_at DESC);

-- ============================================
-- INSIGHTS TABLE
-- ============================================

CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 2000),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time INTEGER NOT NULL CHECK (reading_time > 0),
  type insight_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for insights
CREATE INDEX idx_insights_type ON public.insights(type);
CREATE INDEX idx_insights_date ON public.insights(date DESC);
CREATE INDEX idx_insights_active ON public.insights(is_active) WHERE is_active = true;

-- ============================================
-- FAQS TABLE
-- ============================================

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_faqs_order ON public.faqs("order");
CREATE INDEX idx_faqs_active ON public.faqs(is_active) WHERE is_active = true;

-- ============================================
-- FAQ TRANSLATIONS TABLE
-- ============================================

CREATE TABLE public.faq_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id UUID NOT NULL REFERENCES public.faqs(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'tr')),
  question TEXT NOT NULL CHECK (char_length(question) >= 5 AND char_length(question) <= 500),
  answer TEXT NOT NULL CHECK (char_length(answer) >= 10 AND char_length(answer) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(faq_id, language)
);

-- Index for translations
CREATE INDEX idx_faq_translations_faq_id ON public.faq_translations(faq_id);
CREATE INDEX idx_faq_translations_language ON public.faq_translations(language);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_translations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Dreams policies
CREATE POLICY "Users can view their own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Insights policies (public read)
CREATE POLICY "Anyone can view active insights" ON public.insights
  FOR SELECT USING (is_active = true);

-- FAQs policies (public read)
CREATE POLICY "Anyone can view active FAQs" ON public.faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view FAQ translations" ON public.faq_translations
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create user profile after signup
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

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles extending auth.users';
COMMENT ON TABLE public.dreams IS 'User dream entries with analysis';
COMMENT ON TABLE public.insights IS 'Insights and articles about dreams';
COMMENT ON TABLE public.faqs IS 'Frequently asked questions base table';
COMMENT ON TABLE public.faq_translations IS 'FAQ translations for multiple languages';
