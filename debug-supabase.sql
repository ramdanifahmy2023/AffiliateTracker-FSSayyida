-- =============================================
-- DEBUG SCRIPT FOR SUPABASE ISSUES
-- =============================================
-- Run this to check current state and fix issues

-- 1. Check current RLS policies (this might be causing infinite recursion)
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 2. Check if the problematic user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '52c7dddb-2985-43da-aa93-d56336afb00c'
OR email = 'superadmin@login.internal';

-- 3. Check if profile exists for this user
SELECT 
    id,
    full_name,
    username,
    position,
    created_at
FROM profiles 
WHERE id = '52c7dddb-2985-43da-aa93-d56336afb00c';

-- 4. Check all users with @login.internal email
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created,
    p.full_name,
    p.username,
    p.position,
    p.created_at as profile_created
FROM auth.users u
FULL OUTER JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@login.internal'
OR p.username IN ('superadmin', 'leader_alpha', 'admin1', 'host1', 'creator1', 'viewer1')
ORDER BY u.email;

-- 5. Check table structure and permissions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 7. Test simple insert (this will help identify the exact issue)
-- DO $$
-- BEGIN
--     INSERT INTO profiles (
--         id,
--         full_name,
--         username,
--         position,
--         start_date
--     ) VALUES (
--         '52c7dddb-2985-43da-aa93-d56336afb00c',
--         'Super Administrator',
--         'superadmin',
--         'superadmin',
--         CURRENT_DATE
--     )
--     ON CONFLICT (id) DO UPDATE SET
--         full_name = EXCLUDED.full_name,
--         updated_at = NOW();
--         
--     RAISE NOTICE 'Profile upsert successful';
-- EXCEPTION
--     WHEN OTHERS THEN
--         RAISE NOTICE 'Profile upsert failed: %', SQLERRM;
-- END $$;

-- 8. Check custom types/enums
SELECT 
    t.typname,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_position', 'user_role')
GROUP BY t.typname
ORDER BY t.typname;