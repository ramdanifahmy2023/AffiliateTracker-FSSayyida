-- Fix Database Schema for Email Login
-- Jalankan script ini di Supabase SQL Editor
-- PASTIKAN BACKUP DATABASE TERLEBIH DAHULU!

-- 1. Cek struktur tabel profiles saat ini
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Tambah kolom email jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
        RAISE NOTICE 'Kolom email berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom email sudah ada';
    END IF;
END $$;

-- 3. Update email dari auth.users untuk profiles yang sudah ada
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = now()
FROM auth.users 
WHERE profiles.id = auth.users.id 
  AND profiles.email IS NULL;

-- 4. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 5. Hapus data demo lama yang mungkin corrupt
DELETE FROM public.profiles WHERE email LIKE '%@login.internal';
DELETE FROM auth.users WHERE email LIKE '%@login.internal';

-- 6. Insert demo auth users dengan format yang benar
-- Function untuk membuat user auth
CREATE OR REPLACE FUNCTION create_demo_user(
    p_id uuid,
    p_email text,
    p_password text
) RETURNS void AS $$
DECLARE
    encrypted_pw text;
BEGIN
    -- Hash password
    encrypted_pw := crypt(p_password, gen_salt('bf'));
    
    -- Insert ke auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        p_id,
        'authenticated',
        'authenticated',
        p_email,
        encrypted_pw,
        now(),
        null,
        null,
        '{}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = EXCLUDED.encrypted_password,
        updated_at = now();
        
    RAISE NOTICE 'Demo user % created/updated', p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Buat demo users
SELECT create_demo_user('550e8400-e29b-41d4-a716-446655440001'::uuid, 'superadmin@login.internal', 'password123');
SELECT create_demo_user('550e8400-e29b-41d4-a716-446655440002'::uuid, 'leader_alpha@login.internal', 'password123');
SELECT create_demo_user('550e8400-e29b-41d4-a716-446655440003'::uuid, 'host1@login.internal', 'password123');

-- 8. Insert profiles dengan foreign key ke auth.users
INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    position, 
    email, 
    start_date, 
    created_at, 
    updated_at
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        'Super Administrator',
        'superadmin',
        'superadmin',
        'superadmin@login.internal',
        CURRENT_DATE,
        now(),
        now()
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        'Leader Alpha',
        'leader_alpha',
        'leader',
        'leader_alpha@login.internal',
        CURRENT_DATE,
        now(),
        now()
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003'::uuid,
        'Host Live 1',
        'host1',
        'staff_host_live',
        'host1@login.internal',
        CURRENT_DATE,
        now(),
        now()
    )
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    position = EXCLUDED.position,
    updated_at = now();

-- 9. Buat function untuk sync email otomatis
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS trigger AS $$
BEGIN
    -- Sync email changes from auth.users to profiles
    IF TG_OP = 'UPDATE' AND OLD.email != NEW.email THEN
        UPDATE public.profiles 
        SET email = NEW.email, updated_at = now()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Buat trigger untuk sync otomatis
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();

-- 11. Periksa dan perbaiki RLS policies
-- Nonaktifkan RLS sementara untuk testing (HATI-HATI: Hanya untuk development)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Jika ingin mengaktifkan RLS, gunakan policy ini:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view own profile" ON public.profiles
--     FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can update own profile" ON public.profiles
--     FOR UPDATE USING (auth.uid() = id);
--
-- CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles
--     FOR SELECT USING (auth.role() = 'authenticated');

-- 12. Verifikasi hasil
SELECT 
    'Auth Users' as table_name,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users au
WHERE au.email LIKE '%@login.internal'

UNION ALL

SELECT 
    'Profiles' as table_name,
    p.id,
    p.email,
    p.created_at,
    true as email_confirmed
FROM public.profiles p
WHERE p.email LIKE '%@login.internal'
ORDER BY table_name, email;

-- 13. Test query untuk memastikan join bekerja
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.email as profile_email,
    p.position,
    au.email as auth_email,
    au.email_confirmed_at IS NOT NULL as auth_confirmed
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@login.internal'
ORDER BY p.position;

-- 14. Cleanup function
DROP FUNCTION IF EXISTS create_demo_user(uuid, text, text);

-- 15. Final check
SELECT 
    'Database schema fixed successfully!' as status,
    COUNT(*) as demo_users_created
FROM public.profiles 
WHERE email LIKE '%@login.internal';

-- SELESAI
-- Setelah menjalankan script ini:
-- 1. Restart aplikasi
-- 2. Clear browser cache
-- 3. Test login dengan: superadmin@login.internal / password123
-- 4. Jika berhasil, test dengan user lain
-- 5. Jika masih error, cek console browser untuk detail error