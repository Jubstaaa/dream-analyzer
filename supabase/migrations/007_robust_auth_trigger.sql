-- ============================================
-- Dream Analyzer - Robust Auth Trigger
-- ============================================
-- This migration updates the handle_new_user trigger to be more robust.
-- It adds safe date casting for the birthday field to prevent 500 errors 
-- when metadata is malformed or empty.
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_birthday DATE;
BEGIN
  -- Safe date casting helper block
  BEGIN
    IF (NEW.raw_user_meta_data->>'birthday') IS NOT NULL AND (NEW.raw_user_meta_data->>'birthday') != '' THEN
      v_birthday := CAST(NEW.raw_user_meta_data->>'birthday' AS DATE);
    ELSE
      v_birthday := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to NULL if the date format is invalid
    v_birthday := NULL;
  END;

  INSERT INTO public.users (id, email, name, surname, gender, birthday)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    NEW.raw_user_meta_data->>'gender',
    v_birthday
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Robust auth trigger installed!';
  RAISE NOTICE '   - handle_new_user: Now handles invalid/empty birthday fields safely.';
END $$;
