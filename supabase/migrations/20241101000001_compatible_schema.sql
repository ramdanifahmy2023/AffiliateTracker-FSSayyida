-- Compatible migration for existing Lovable Dev AI schema
-- This will add missing components and modify existing ones safely

-- First, check and create missing enum types
DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('shopee', 'tiktok');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'temp_banned', 'perm_banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE data_status AS ENUM ('empty', 'pending', 'rejected', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_type AS ENUM ('1', '2', '3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('fashion', 'elektronik', 'kecantikan', 'food', 'hobi', 'otomotif', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE live_status AS ENUM ('lancar', 'mati', 'relive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE period_week AS ENUM ('M1', 'M2', 'M3', 'M4', 'M5');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cost_category AS ENUM ('fix_cost', 'variable_cost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE debt_type AS ENUM ('debt', 'receivable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_type AS ENUM ('pdf', 'google_drive', 'youtube');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_position AS ENUM ('superadmin', 'leader', 'admin', 'staff_host_live', 'staff_content_creator', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Modify existing tables to add missing columns
-- Add missing columns to affiliate_accounts if not exist
ALTER TABLE public.affiliate_accounts 
ADD COLUMN IF NOT EXISTS platform platform_type DEFAULT 'shopee';

-- Update existing affiliate_accounts table structure
DO $$
BEGIN
    -- Update platform column type if it exists but wrong type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'affiliate_accounts' 
               AND column_name = 'platform' 
               AND table_schema = 'public') THEN
        
        -- Try to alter the column type
        BEGIN
            ALTER TABLE public.affiliate_accounts 
            ALTER COLUMN platform TYPE platform_type USING platform::text::platform_type;
        EXCEPTION
            WHEN OTHERS THEN
                -- If conversion fails, add a new column and migrate data
                ALTER TABLE public.affiliate_accounts ADD COLUMN IF NOT EXISTS platform_new platform_type DEFAULT 'shopee';
        END;
    END IF;
END $$;

-- Modify profiles table to add missing columns and match our user structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS position user_position DEFAULT 'staff_host_live';

-- Update role column to match position if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' 
               AND column_name = 'role' 
               AND table_schema = 'public') THEN
        
        -- Map existing roles to positions
        UPDATE public.profiles 
        SET position = CASE 
            WHEN role::text = 'admin' THEN 'admin'::user_position
            WHEN role::text = 'leader' THEN 'leader'::user_position
            WHEN role::text = 'staff' THEN 'staff_host_live'::user_position
            ELSE 'staff_host_live'::user_position
        END
        WHERE position IS NULL;
    END IF;
END $$;

-- Add missing columns to daily_reports
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS opening_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS closing_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_category product_category DEFAULT 'fashion';

-- Map existing columns to new structure
DO $$
BEGIN
    -- Map starting_balance to opening_balance
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'daily_reports' 
               AND column_name = 'starting_balance' 
               AND table_schema = 'public') THEN
        UPDATE public.daily_reports 
        SET opening_balance = starting_balance
        WHERE opening_balance = 0;
    END IF;
    
    -- Map ending_balance to closing_balance
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'daily_reports' 
               AND column_name = 'ending_balance' 
               AND table_schema = 'public') THEN
        UPDATE public.daily_reports 
        SET closing_balance = ending_balance
        WHERE closing_balance = 0;
    END IF;
END $$;

-- Create missing tables that don't exist

-- Create commissions table (compatible with existing commission_reports)
CREATE TABLE IF NOT EXISTS public.commissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_username text NOT NULL,
    period_week period_week NOT NULL,
    period_month integer NOT NULL,
    period_year integer NOT NULL,
    gross_commission numeric DEFAULT 0,
    net_commission numeric DEFAULT 0,
    liquid_commission numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(account_username, period_week, period_month, period_year)
);

-- Create cashflow table (compatible with existing transactions)
CREATE TABLE IF NOT EXISTS public.cashflow (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date date NOT NULL,
    type transaction_type NOT NULL,
    group_id uuid REFERENCES public.groups(id),
    amount numeric NOT NULL,
    proof_link text,
    category cost_category,
    description text NOT NULL,
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create debt_receivables table (compatible with existing debts)
CREATE TABLE IF NOT EXISTS public.debt_receivables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date date NOT NULL,
    type debt_type NOT NULL,
    amount numeric NOT NULL,
    description text NOT NULL,
    status payment_status DEFAULT 'pending',
    group_id uuid REFERENCES public.groups(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add group_id to assets table if not exists
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id),
ADD COLUMN IF NOT EXISTS description text;

-- Update assets to use description instead of notes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'assets' 
               AND column_name = 'notes' 
               AND table_schema = 'public') THEN
        UPDATE public.assets 
        SET description = notes
        WHERE description IS NULL AND notes IS NOT NULL;
    END IF;
END $$;

-- Fix attendance table structure
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS attendance_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS check_in_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS check_out_time timestamp with time zone;

-- Map existing columns
DO $$
BEGIN
    -- Map existing date to attendance_date
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'attendance' 
               AND column_name = 'date' 
               AND table_schema = 'public') THEN
        UPDATE public.attendance 
        SET attendance_date = date
        WHERE attendance_date IS NULL;
    END IF;
    
    -- Map check_in to check_in_time
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'attendance' 
               AND column_name = 'check_in' 
               AND table_schema = 'public') THEN
        UPDATE public.attendance 
        SET check_in_time = check_in
        WHERE check_in_time IS NULL;
    END IF;
    
    -- Map check_out to check_out_time
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'attendance' 
               AND column_name = 'check_out' 
               AND table_schema = 'public') THEN
        UPDATE public.attendance 
        SET check_out_time = check_out
        WHERE check_out_time IS NULL;
    END IF;
END $$;

-- Create unique constraint for attendance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'attendance_user_date_unique' 
                   AND table_name = 'attendance') THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT attendance_user_date_unique UNIQUE (user_id, attendance_date);
    END IF;
END $$;

-- Update groups table column name if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'groups' 
               AND column_name = 'name' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.groups 
        ADD COLUMN IF NOT EXISTS group_name text;
        
        UPDATE public.groups 
        SET group_name = name
        WHERE group_name IS NULL;
        
        -- Add unique constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'groups_group_name_key' 
                       AND table_name = 'groups') THEN
            ALTER TABLE public.groups 
            ADD CONSTRAINT groups_group_name_key UNIQUE (group_name);
        END IF;
    END IF;
END $$;

-- Create missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON public.daily_reports(user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_commissions_account_period ON public.commissions(account_username, period_month, period_year);
CREATE INDEX IF NOT EXISTS idx_cashflow_date_type ON public.cashflow(transaction_date, type);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, attendance_date);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Add triggers to tables that might not have them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_commissions_updated_at' 
                   AND event_object_table = 'commissions') THEN
        CREATE TRIGGER update_commissions_updated_at 
            BEFORE UPDATE ON public.commissions 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_cashflow_updated_at' 
                   AND event_object_table = 'cashflow') THEN
        CREATE TRIGGER update_cashflow_updated_at 
            BEFORE UPDATE ON public.cashflow 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_debt_receivables_updated_at' 
                   AND event_object_table = 'debt_receivables') THEN
        CREATE TRIGGER update_debt_receivables_updated_at 
            BEFORE UPDATE ON public.debt_receivables 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;