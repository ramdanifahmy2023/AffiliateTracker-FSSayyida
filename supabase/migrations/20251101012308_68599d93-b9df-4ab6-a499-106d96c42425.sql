-- Create enum types
CREATE TYPE user_role AS ENUM ('superadmin', 'leader', 'admin', 'staff', 'viewer');
CREATE TYPE platform_type AS ENUM ('shopee', 'tiktok');
CREATE TYPE account_status AS ENUM ('active', 'banned_temporary', 'banned_permanent');
CREATE TYPE data_status AS ENUM ('empty', 'in_process', 'rejected', 'verified');
CREATE TYPE shift_type AS ENUM ('1', '2', '3');
CREATE TYPE live_status AS ENUM ('lancar', 'mati', 'relive');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE expense_category AS ENUM ('fixed_cost', 'variable_cost');

-- Profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE,
  role user_role NOT NULL DEFAULT 'staff',
  username TEXT UNIQUE NOT NULL,
  address TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  imei TEXT NOT NULL,
  google_account TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(15, 2),
  screenshot_link TEXT,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Affiliate accounts table
CREATE TABLE public.affiliate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform_type NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  account_status account_status NOT NULL DEFAULT 'active',
  data_status data_status NOT NULL DEFAULT 'empty',
  notes TEXT,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key to profiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_group FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Daily reports table
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift shift_type NOT NULL,
  category TEXT NOT NULL,
  live_status live_status NOT NULL DEFAULT 'lancar',
  starting_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ending_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  starting_omzet NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ending_omzet NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commission reports table
CREATE TABLE public.commission_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  week_period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  gross_commission NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net_commission NUMERIC(15, 2) NOT NULL DEFAULT 0,
  disbursed_commission NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table (income/expense)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type transaction_type NOT NULL,
  category TEXT NOT NULL,
  expense_category expense_category,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(15, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Debts table
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOP documents table
CREATE TABLE public.sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  link_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPI targets table
CREATE TABLE public.kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  target_omzet NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_gross_commission NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_attendance_days INTEGER NOT NULL DEFAULT 0,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, period_month, period_year),
  UNIQUE(group_id, period_month, period_year)
);

-- Audit trail table
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin can manage all profiles" ON public.profiles FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');
CREATE POLICY "Leader can create and update profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));
CREATE POLICY "Leader can update profiles" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- RLS Policies for groups
CREATE POLICY "All authenticated users can view groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage groups" ON public.groups FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for devices
CREATE POLICY "All authenticated users can view devices" ON public.devices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage devices" ON public.devices FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for affiliate_accounts
CREATE POLICY "All authenticated users can view accounts" ON public.affiliate_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage accounts" ON public.affiliate_accounts FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for attendance
CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create own attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can update own attendance" ON public.attendance FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for daily_reports
CREATE POLICY "Users can view all daily reports" ON public.daily_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create own daily reports" ON public.daily_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can update own daily reports" ON public.daily_reports FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for commission_reports
CREATE POLICY "All users can view commission reports" ON public.commission_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage commission reports" ON public.commission_reports FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for transactions
CREATE POLICY "All users can view transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin can manage all transactions" ON public.transactions FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');
CREATE POLICY "Leader and Admin can create transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader', 'admin'));

-- RLS Policies for assets
CREATE POLICY "All users can view assets" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage assets" ON public.assets FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for debts
CREATE POLICY "All users can view debts" ON public.debts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage debts" ON public.debts FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for sop_documents
CREATE POLICY "All users can view SOP documents" ON public.sop_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage SOP documents" ON public.sop_documents FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for kpi_targets
CREATE POLICY "All users can view KPI targets" ON public.kpi_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin and Leader can manage KPI targets" ON public.kpi_targets FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'leader'));

-- RLS Policies for audit_trail
CREATE POLICY "All users can view audit trail" ON public.audit_trail FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create audit entries" ON public.audit_trail FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_accounts_updated_at BEFORE UPDATE ON public.affiliate_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON public.daily_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commission_reports_updated_at BEFORE UPDATE ON public.commission_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sop_documents_updated_at BEFORE UPDATE ON public.sop_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kpi_targets_updated_at BEFORE UPDATE ON public.kpi_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_group_id ON public.profiles(group_id);
CREATE INDEX idx_devices_group_id ON public.devices(group_id);
CREATE INDEX idx_affiliate_accounts_group_id ON public.affiliate_accounts(group_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date);
CREATE INDEX idx_commission_reports_account_id ON public.commission_reports(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX idx_audit_trail_entity ON public.audit_trail(entity_type, entity_id);