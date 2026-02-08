-- Disable email confirmation requirement
-- Run this in the Supabase SQL Editor

UPDATE auth.flow_state
SET config = jsonb_set(config, '{require_email_confirmation}', 'false');

-- Alternatively, update the auth.config table if accessible, but usually this is done via:
-- 1. Go to Authentication > Providers > Email
-- 2. Toggle "Confirm email" to OFF

-- If you cannot access the UI, try updating the `auth.users` table trigger or defaults isn't standard.
-- The standard way via SQL to Auto-Confirm existing users:

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- TO PREVENT FUTURE CONFIRMATION:
-- This is strictly a project setting usually managed by the dashboard/API, not a simple SQL table update for the configuration itself in the 'public' schema.
-- However, we can use a TRIGGER to auto-confirm new users as a workaround if the dashboard is buggy.

CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_email();
