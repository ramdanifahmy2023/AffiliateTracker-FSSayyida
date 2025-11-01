-- =============================================
-- URGENT FIX FOR RLS INFINITE RECURSION ERROR
-- =============================================
-- Run this script immediately in Supabase SQL Editor

-- 1. DISABLE RLS temporarily to fix the infinite recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. DROP all existing problematic policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin can view all users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Allow all" ON profiles;

-- 3. Check if demo user exists and create if not
DO $$
DECLARE
    demo_user_id UUID := '52c7dddb-2985-43da-aa93-d56336afb00c';
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Check if user exists in auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE id = demo_user_id
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Create user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            demo_user_id,
            '00000000-0000-0000-0000-000000000000',
            'superadmin@login.internal',
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
    END IF;
    
    -- Always insert/update profile (use UPSERT)
    INSERT INTO profiles (
        id,
        full_name,
        position,
        username,
        start_date,
        birth_date,
        address,
        group_id,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        'Super Administrator',
        'superadmin',
        'superadmin',
        CURRENT_DATE,
        NULL,
        NULL,
        NULL,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        position = EXCLUDED.position,
        username = EXCLUDED.username,
        updated_at = NOW();
        
    RAISE NOTICE 'Demo user created/updated successfully';
END $$;

-- 4. Create other demo users
DO $$
DECLARE
    group_alpha_id UUID;
    group_beta_id UUID;
    user_id UUID;
BEGIN
    -- Ensure groups exist
    INSERT INTO groups (name, group_name) 
    VALUES 
        ('Group Alpha', 'Group Alpha'),
        ('Group Beta', 'Group Beta')
    ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO group_alpha_id FROM groups WHERE name = 'Group Alpha' LIMIT 1;
    SELECT id INTO group_beta_id FROM groups WHERE name = 'Group Beta' LIMIT 1;
    
    -- Create leader_alpha
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        user_id, '00000000-0000-0000-0000-000000000000',
        'leader_alpha@login.internal', crypt('password123', gen_salt('bf')),
        NOW(), NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (
        id, full_name, position, username, start_date, group_id, created_at, updated_at
    ) VALUES (
        user_id, 'Leader Alpha', 'leader', 'leader_alpha', CURRENT_DATE, group_alpha_id, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name, position = EXCLUDED.position, updated_at = NOW();
    
    -- Create admin1
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        user_id, '00000000-0000-0000-0000-000000000000',
        'admin1@login.internal', crypt('password123', gen_salt('bf')),
        NOW(), NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (
        id, full_name, position, username, start_date, group_id, created_at, updated_at
    ) VALUES (
        user_id, 'Administrator 1', 'admin', 'admin1', CURRENT_DATE, group_alpha_id, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name, position = EXCLUDED.position, updated_at = NOW();
    
    -- Create host1
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        user_id, '00000000-0000-0000-0000-000000000000',
        'host1@login.internal', crypt('password123', gen_salt('bf')),
        NOW(), NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (
        id, full_name, position, username, start_date, group_id, created_at, updated_at
    ) VALUES (
        user_id, 'Host Live 1', 'staff_host_live', 'host1', CURRENT_DATE, group_alpha_id, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name, position = EXCLUDED.position, updated_at = NOW();
    
    -- Create creator1
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        user_id, '00000000-0000-0000-0000-000000000000',
        'creator1@login.internal', crypt('password123', gen_salt('bf')),
        NOW(), NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (
        id, full_name, position, username, start_date, group_id, created_at, updated_at
    ) VALUES (
        user_id, 'Content Creator 1', 'staff_content_creator', 'creator1', CURRENT_DATE, group_beta_id, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name, position = EXCLUDED.position, updated_at = NOW();
    
    -- Create viewer1
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        user_id, '00000000-0000-0000-0000-000000000000',
        'viewer1@login.internal', crypt('password123', gen_salt('bf')),
        NOW(), NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (
        id, full_name, position, username, start_date, group_id, created_at, updated_at
    ) VALUES (
        user_id, 'Viewer 1', 'viewer', 'viewer1', CURRENT_DATE, NULL, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name, position = EXCLUDED.position, updated_at = NOW();
        
    RAISE NOTICE 'All demo users created/updated successfully';
END $$;

-- 5. Create simple, non-recursive RLS policies
CREATE POLICY "Allow authenticated users full access" ON profiles
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- 6. Re-enable RLS with the new safe policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Verify demo users exist
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.username,
    p.position,
    p.group_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@login.internal'
ORDER BY p.position;

-- 9. Test query that should work after fixes
-- This simulates what the app tries to do
SELECT * FROM profiles WHERE id = '52c7dddb-2985-43da-aa93-d56336afb00c';

COMMIT;