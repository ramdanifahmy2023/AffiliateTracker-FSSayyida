-- Fix Email Login Migration Script
-- Jalankan script ini di Supabase SQL Editor untuk memperbaiki masalah login dengan email

-- 1. Tambah kolom email di tabel profiles jika belum ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Update email berdasarkan auth.users
UPDATE public.profiles 
SET email = auth.users.email
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- 3. Set email sebagai NOT NULL (opsional, setelah data terisi)
-- ALTER TABLE public.profiles 
-- ALTER COLUMN email SET NOT NULL;

-- 4. Tambah index untuk performa
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 5. Buat function untuk sync email otomatis
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.email != NEW.email THEN
    UPDATE public.profiles 
    SET email = NEW.email, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Buat trigger untuk sync email otomatis
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();

-- 7. Insert demo users dengan email yang benar jika belum ada
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES 
  -- Superadmin
  ('550e8400-e29b-41d4-a716-446655440001', 'superadmin@login.internal', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  -- Leader Alpha
  ('550e8400-e29b-41d4-a716-446655440002', 'leader_alpha@login.internal', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  -- Host 1
  ('550e8400-e29b-41d4-a716-446655440003', 'host1@login.internal', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert/Update profiles dengan email
INSERT INTO public.profiles (id, full_name, username, position, email, start_date, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Super Administrator', 'superadmin', 'superadmin', 'superadmin@login.internal', CURRENT_DATE, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Leader Alpha', 'leader_alpha', 'leader', 'leader_alpha@login.internal', CURRENT_DATE, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Host Live 1', 'host1', 'staff_host_live', 'host1@login.internal', CURRENT_DATE, now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();

-- 9. Verifikasi data
SELECT 
  p.id,
  p.full_name,
  p.username,
  p.email,
  p.position,
  au.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@login.internal'
ORDER BY p.position;

-- 10. Tambah RLS policy untuk email jika diperlukan
-- CREATE POLICY "Users can view own profile" ON public.profiles
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile" ON public.profiles
--   FOR UPDATE USING (auth.uid() = id);