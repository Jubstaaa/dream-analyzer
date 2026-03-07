-- ============================================
-- Dream Analyzer - Add gender and birthday to User Profile
-- ============================================

-- Add gender and birthday columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.users.gender IS 'User gender';
COMMENT ON COLUMN public.users.birthday IS 'User birthday';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile fields added to users table!';
  RAISE NOTICE '   - gender: User gender';
  RAISE NOTICE '   - birthday: User birthday';
END $$;

-- Update Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, surname, gender, birthday)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    NEW.raw_user_meta_data->>'gender',
    CAST(NEW.raw_user_meta_data->>'birthday' AS DATE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
