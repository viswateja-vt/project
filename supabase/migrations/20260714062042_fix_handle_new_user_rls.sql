/*
# Fix handle_new_user trigger function

## Problem
The `handle_new_user` trigger fires AFTER INSERT on `auth.users` to auto-create a profile row.
The function is SECURITY DEFINER but RLS on `profiles` was causing the INSERT to fail with
"Database error saving new user" because `auth.uid()` may not resolve correctly during
the trigger execution context, and the function's role may have RLS enforced.

## Fix
Recreate the function with `SET row_security = off` so the INSERT bypasses RLS entirely.
This is safe because the function only inserts a row with `id = NEW.id` (the new user's UUID),
so it cannot create profiles for arbitrary users.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET row_security = off
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();