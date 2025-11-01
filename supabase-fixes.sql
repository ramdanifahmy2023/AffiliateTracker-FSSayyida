-- =============================================
-- SUPABASE DATABASE FIXES FOR LOGIN ISSUE
-- =============================================
-- Run this script in Supabase SQL Editor
-- This will fix authentication and RLS issues

-- 1. First, let's check and create the necessary ENUMs if they don't exist
DO $$ 
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'superadmin', 
            'leader', 
            'admin', 
            'staff_host_live', 
            'staff_content_creator', 
            'viewer'
        );
    END IF;

    -- Create user_position enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_position') THEN
        CREATE TYPE user_position AS ENUM (
            'superadmin', 
            'leader', 
            'admin', 
            'staff_host_live', 
            'staff_content_creator', 
            'viewer'
        );
    END IF;

    -- Create platform enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform') THEN
        CREATE TYPE platform AS ENUM ('shopee', 'tiktok');
    END IF;

    -- Create account_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'temp_banned', 'perm_banned');
    END IF;

    -- Create data_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_status') THEN
        CREATE TYPE data_status AS ENUM ('empty', 'pending', 'rejected', 'verified');
    END IF;

    -- Create shift enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift') THEN
        CREATE TYPE shift AS ENUM ('1', '2', '3');
    END IF;

    -- Create live_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'live_status') THEN
        CREATE TYPE live_status AS ENUM ('lancar', 'mati', 'relive');
    END IF;

    -- Create product_category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
        CREATE TYPE product_category AS ENUM (
            'fashion', 'elektronik', 'kecantikan', 'food', 'hobi', 'otomotif', 'lainnya'
        );
    END IF;

    -- Create period_week enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'period_week') THEN
        CREATE TYPE period_week AS ENUM ('M1', 'M2', 'M3', 'M4', 'M5');
    END IF;

    -- Create transaction_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense');
    END IF;

    -- Create expense_category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM ('fix_cost', 'variable_cost');
    END IF;

    -- Create payment_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled');
    END IF;

    -- Create debt_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'debt_type') THEN
        CREATE TYPE debt_type AS ENUM ('debt', 'receivable');
    END IF;
END $$;

-- 2. Drop existing RLS policies that might be conflicting
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin can view all users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 3. Create simplified RLS policies for profiles table
CREATE POLICY "Enable all access for authenticated users" ON profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Make sure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create demo users in auth.users and profiles tables
-- This will create the demo accounts that can be used for testing

-- Function to create a demo user
CREATE OR REPLACE FUNCTION create_demo_user(
    p_username TEXT,
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_position user_position,
    p_group_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Check if user already exists in auth.users
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = p_email;
    
    IF existing_user_id IS NOT NULL THEN
        -- User exists, just update/insert profile
        INSERT INTO profiles (id, full_name, position, username, start_date, group_id)
        VALUES (existing_user_id, p_full_name, p_position, p_username, CURRENT_DATE, p_group_id)
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            position = EXCLUDED.position,
            username = EXCLUDED.username,
            group_id = EXCLUDED.group_id;
        
        RETURN existing_user_id;
    END IF;
    
    -- Create new user ID
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users
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
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );
    
    -- Insert into profiles
    INSERT INTO profiles (
        id,
        full_name,
        position,
        username,
        start_date,
        group_id
    ) VALUES (
        new_user_id,
        p_full_name,
        p_position,
        p_username,
        CURRENT_DATE,
        p_group_id
    );
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create demo groups first
INSERT INTO groups (name, group_name) 
VALUES 
    ('Group Alpha', 'Group Alpha'),
    ('Group Beta', 'Group Beta')
ON CONFLICT (name) DO NOTHING;

-- Get group IDs for demo users
DO $$
DECLARE
    group_alpha_id UUID;
    group_beta_id UUID;
BEGIN
    SELECT id INTO group_alpha_id FROM groups WHERE name = 'Group Alpha' LIMIT 1;
    SELECT id INTO group_beta_id FROM groups WHERE name = 'Group Beta' LIMIT 1;
    
    -- Create demo users
    PERFORM create_demo_user(
        'superadmin',
        'superadmin@login.internal',
        'password123',
        'Super Administrator',
        'superadmin'::user_position,
        NULL
    );
    
    PERFORM create_demo_user(
        'leader_alpha',
        'leader_alpha@login.internal',
        'password123',
        'Leader Alpha',
        'leader'::user_position,
        group_alpha_id
    );
    
    PERFORM create_demo_user(
        'admin1',
        'admin1@login.internal',
        'password123',
        'Administrator 1',
        'admin'::user_position,
        group_alpha_id
    );
    
    PERFORM create_demo_user(
        'host1',
        'host1@login.internal',
        'password123',
        'Host Live 1',
        'staff_host_live'::user_position,
        group_alpha_id
    );
    
    PERFORM create_demo_user(
        'creator1',
        'creator1@login.internal',
        'password123',
        'Content Creator 1',
        'staff_content_creator'::user_position,
        group_beta_id
    );
    
    PERFORM create_demo_user(
        'viewer1',
        'viewer1@login.internal',
        'password123',
        'Viewer 1',
        'viewer'::user_position,
        NULL
    );
END $$;

-- 7. Create function to handle user sign up trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
    INSERT INTO public.profiles (id, full_name, username, position, start_date)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
      COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
      COALESCE((new.raw_user_meta_data->>'position')::user_position, 'viewer'::user_position),
      CURRENT_DATE
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Enable RLS on other tables and create basic policies

-- Groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON groups
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Devices table
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON devices
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Affiliate accounts table
ALTER TABLE affiliate_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON affiliate_accounts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Daily reports table
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON daily_reports
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Commissions table
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON commissions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Commission reports table
ALTER TABLE commission_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON commission_reports
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Cashflow table
ALTER TABLE cashflow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON cashflow
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Assets table
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON assets
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Debt receivables table
ALTER TABLE debt_receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON debt_receivables
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Attendance table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON attendance
    FOR ALL USING (auth.uid() IS NOT NULL);

-- KPI targets table
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON kpi_targets
    FOR ALL USING (auth.uid() IS NOT NULL);

-- SOP documents table
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON sop_documents
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON transactions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Audit trail table
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON audit_trail
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON profiles(position);
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON profiles(group_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, attendance_date);

-- 12. Clean up the function (optional)
DROP FUNCTION IF EXISTS create_demo_user(TEXT, TEXT, TEXT, TEXT, user_position, UUID);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify everything is working:

-- Check if demo users were created
-- SELECT u.email, p.full_name, p.username, p.position 
-- FROM auth.users u 
-- JOIN profiles p ON u.id = p.id 
-- WHERE u.email LIKE '%@login.internal';

-- Check RLS policies
-- SELECT tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Test authentication
-- SELECT auth.uid(), current_user;

COMMIT;